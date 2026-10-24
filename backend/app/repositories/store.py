import re
import uuid
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.core.logging import logger

def _clean_markdown_preview(raw_md: str) -> str:
    """Strips all leading hashes (#, ##, ###) and bold stars for clean preview text."""
    if not raw_md:
        return "Curriculum study notes verified for accessible multi-sensory learning."
    cleaned = re.sub(r'#{1,6}\s*', '', raw_md)
    cleaned = re.sub(r'\*{1,2}([^*]+)\*{1,2}', r'\1', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return (cleaned[:280] + "...") if len(cleaned) > 280 else cleaned

class LiveSupabaseDataStore:
    """
    Production Persistence Repository.
    Directly connected to the live Supabase PostgreSQL database.
    All data is read from and written to Supabase tables.
    """
    def __init__(self):
        self.profiles: Dict[str, Dict[str, Any]] = {}
        self.accessibility_preferences: Dict[str, Dict[str, Any]] = {}
        self.courses: Dict[str, Dict[str, Any]] = {}
        self.modules: Dict[str, Dict[str, Any]] = {}
        self.lessons: Dict[str, Dict[str, Any]] = {}
        self.quizzes: Dict[str, Dict[str, Any]] = {}
        self.quiz_attempts: List[Dict[str, Any]] = []
        self.assignments: List[Dict[str, Any]] = []
        self.document_jobs: Dict[str, Dict[str, Any]] = {}
        self.learning_progress: Dict[str, Dict[str, Any]] = {}
        self.notes: List[Dict[str, Any]] = []
        self.bookmarks: List[Dict[str, Any]] = []
        self.revision_records: List[Dict[str, Any]] = []
        self.classes: List[Dict[str, Any]] = []

        self.db_url = settings.DATABASE_URL
        self.load_from_database()

    def _get_connection(self):
        if not self.db_url:
            raise ValueError("DATABASE_URL not configured")
        return psycopg2.connect(self.db_url)

    def _serialize_row(self, row: Dict[str, Any]) -> Dict[str, Any]:
        """Ensures all UUIDs, datetimes, and JSON structures are JSON-safe and normalized."""
        clean = {}
        for k, v in row.items():
            if hasattr(v, 'isoformat'):
                clean[k] = v.isoformat()
            elif isinstance(v, str):
                clean[k] = v.replace(r"\r\n", "\n").replace(r"\n", "\n")
            elif isinstance(v, (type(None), int, float, bool, list, dict)):
                clean[k] = v
            else:
                clean[k] = str(v)
        return clean

    def load_from_database(self):
        """Loads all live data directly from the Supabase PostgreSQL database."""
        if not self.db_url:
            logger.warning("No DATABASE_URL configured. Supabase connection bypassed.")
            return

        try:
            conn = self._get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # 1. Profiles
            cur.execute("SELECT * FROM public.profiles;")
            self.profiles = {str(r['id']): self._serialize_row(r) for r in cur.fetchall()}

            # 2. Accessibility Preferences
            cur.execute("SELECT * FROM public.accessibility_preferences;")
            self.accessibility_preferences = {str(r['user_id']): self._serialize_row(r) for r in cur.fetchall()}

            # 3. Courses
            cur.execute("SELECT * FROM public.courses ORDER BY created_at ASC;")
            self.courses = {str(r['id']): self._serialize_row(r) for r in cur.fetchall()}

            # 4. Modules
            cur.execute("SELECT * FROM public.modules ORDER BY order_index ASC;")
            self.modules = {str(r['id']): self._serialize_row(r) for r in cur.fetchall()}

            # 5. Lessons
            cur.execute("SELECT * FROM public.lessons ORDER BY order_index ASC;")
            self.lessons = {str(r['id']): self._serialize_row(r) for r in cur.fetchall()}

            # 6. Quizzes
            cur.execute("SELECT * FROM public.quizzes;")
            self.quizzes = {str(r['id']): self._serialize_row(r) for r in cur.fetchall()}

            # 7. Quiz Attempts
            cur.execute("SELECT * FROM public.quiz_attempts ORDER BY submitted_at DESC;")
            self.quiz_attempts = [self._serialize_row(r) for r in cur.fetchall()]

            # 8. Assignments
            cur.execute("SELECT * FROM public.assignments ORDER BY due_date ASC;")
            self.assignments = [self._serialize_row(r) for r in cur.fetchall()]

            # 9. Document Jobs
            cur.execute("SELECT * FROM public.document_jobs ORDER BY uploaded_at DESC;")
            raw_jobs = [self._serialize_row(r) for r in cur.fetchall()]
            self.document_jobs = {}
            for job in raw_jobs:
                jid = str(job['job_id'])
                struct = job.get('extracted_structure') or {}
                acc_out = job.get('accessible_output') or {}
                if not job.get('title'):
                    job['title'] = struct.get('title') or job.get('file_name', 'Study Document')
                if not job.get('extracted_markdown') and isinstance(acc_out, dict):
                    job['extracted_markdown'] = acc_out.get('markdown_content') or ''
                
                raw_md = job.get('extracted_markdown') or ''
                job['markdown_preview'] = _clean_markdown_preview(raw_md)
                job['file_url'] = struct.get('file_url') or job.get('file_url') or f"/api/documents/{jid}/file"
                job['download_url'] = struct.get('download_url') or job.get('download_url') or f"/api/documents/{jid}/download"
                job['file_size'] = struct.get('file_size') or job.get('file_size')
                job['mime_type'] = struct.get('mime_type') or job.get('mime_type')

                if not job.get('concepts_detected'):
                    raw_concepts = struct.get('key_concepts') or []
                    job['concepts_detected'] = [
                        c.get('term', '') if isinstance(c, dict) else str(c)
                        for c in raw_concepts if c
                    ]
                self.document_jobs[jid] = job

            # 10. Learning Progress
            cur.execute("SELECT * FROM public.learning_progress;")
            self.learning_progress = {str(r['lesson_id']): self._serialize_row(r) for r in cur.fetchall()}

            # 11. Student Notes
            cur.execute("SELECT * FROM public.student_notes ORDER BY created_at DESC;")
            self.notes = [self._serialize_row(r) for r in cur.fetchall()]

            # 12. Student Bookmarks
            cur.execute("SELECT * FROM public.student_bookmarks ORDER BY created_at DESC;")
            self.bookmarks = [self._serialize_row(r) for r in cur.fetchall()]

            # 13. Revision Items
            cur.execute("SELECT * FROM public.revision_items ORDER BY created_at DESC;")
            self.revision_records = [self._serialize_row(r) for r in cur.fetchall()]

            # 14. Classes
            try:
                cur.execute("SELECT * FROM public.classes ORDER BY created_at DESC;")
                self.classes = [self._serialize_row(r) for r in cur.fetchall()]
            except Exception as ce:
                logger.warning(f"Could not load classes table: {ce}")
                self.classes = []

            cur.close()
            conn.close()
            logger.info(f"Loaded live data from Supabase: {len(self.courses)} courses, {len(self.lessons)} lessons, {len(self.assignments)} assignments, {len(self.classes)} classes")
        except Exception as e:
            logger.error(f"Error loading from Supabase database: {e}", exc_info=True)

    def sync_profiles(self):
        """Synchronizes profiles and accessibility preferences from Supabase to reflect new registrations immediately."""
        if not self.db_url:
            return
        try:
            conn = self._get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("SELECT * FROM public.profiles;")
            for r in cur.fetchall():
                self.profiles[str(r['id'])] = self._serialize_row(r)
            cur.execute("SELECT * FROM public.accessibility_preferences;")
            for r in cur.fetchall():
                self.accessibility_preferences[str(r['user_id'])] = self._serialize_row(r)
            cur.close()
            conn.close()
        except Exception as e:
            logger.warning(f"Failed to sync profiles from Supabase: {e}")

    def sync_document_jobs(self):
        """Synchronizes document jobs from Supabase to reflect new uploads and status changes."""
        if not self.db_url:
            return
        try:
            conn = self._get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("SELECT * FROM public.document_jobs ORDER BY uploaded_at DESC;")
            raw_jobs = [self._serialize_row(r) for r in cur.fetchall()]
            for job in raw_jobs:
                jid = str(job['job_id'])
                struct = job.get('extracted_structure') or {}
                acc_out = job.get('accessible_output') or {}
                if not job.get('title'):
                    job['title'] = struct.get('title') or job.get('file_name', 'Study Document')
                if not job.get('extracted_markdown') and isinstance(acc_out, dict):
                    job['extracted_markdown'] = acc_out.get('markdown_content') or ''
                
                raw_md = job.get('extracted_markdown') or ''
                job['markdown_preview'] = _clean_markdown_preview(raw_md)
                job['file_url'] = struct.get('file_url') or job.get('file_url') or f"/api/documents/{jid}/file"
                job['download_url'] = struct.get('download_url') or job.get('download_url') or f"/api/documents/{jid}/download"
                job['file_size'] = struct.get('file_size') or job.get('file_size')
                job['mime_type'] = struct.get('mime_type') or job.get('mime_type')

                if not job.get('concepts_detected'):
                    raw_concepts = struct.get('key_concepts') or []
                    job['concepts_detected'] = [
                        c.get('term', '') if isinstance(c, dict) else str(c)
                        for c in raw_concepts if c
                    ]
                self.document_jobs[jid] = job
            cur.close()
            conn.close()
        except Exception as e:
            logger.warning(f"Failed to sync document jobs from Supabase: {e}")

    # --------------------------------------------------------------------------
    # Live Mutation Methods (Persist directly to Supabase)
    # --------------------------------------------------------------------------

    def save_accessibility_preferences(self, user_id: str, prefs: Dict[str, Any]):
        self.accessibility_preferences[user_id] = prefs
        try:
            conn = self._get_connection()
            conn.autocommit = True
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO public.accessibility_preferences (
                    user_id, auditory_orientation, read_ai_responses_aloud, read_lesson_content_aloud,
                    navigation_announcements, verbosity, voice_identifier, speech_rate, font_size_scale,
                    theme, high_contrast, reduced_motion, focus_mode, dyslexia_font, selected_language, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
                )
                ON CONFLICT (user_id) DO UPDATE SET
                    auditory_orientation = EXCLUDED.auditory_orientation,
                    read_ai_responses_aloud = EXCLUDED.read_ai_responses_aloud,
                    read_lesson_content_aloud = EXCLUDED.read_lesson_content_aloud,
                    navigation_announcements = EXCLUDED.navigation_announcements,
                    verbosity = EXCLUDED.verbosity,
                    voice_identifier = EXCLUDED.voice_identifier,
                    speech_rate = EXCLUDED.speech_rate,
                    font_size_scale = EXCLUDED.font_size_scale,
                    theme = EXCLUDED.theme,
                    high_contrast = EXCLUDED.high_contrast,
                    reduced_motion = EXCLUDED.reduced_motion,
                    focus_mode = EXCLUDED.focus_mode,
                    dyslexia_font = EXCLUDED.dyslexia_font,
                    selected_language = EXCLUDED.selected_language,
                    updated_at = NOW();
            """, (
                user_id,
                prefs.get("auditory_orientation", True),
                prefs.get("read_ai_responses_aloud", False),
                prefs.get("read_lesson_content_aloud", False),
                prefs.get("navigation_announcements", True),
                prefs.get("verbosity", "STANDARD"),
                prefs.get("voice_identifier", "alloy"),
                prefs.get("speech_rate", 1.0),
                prefs.get("font_size_scale", 1.0),
                prefs.get("theme", "dark"),
                prefs.get("high_contrast", False),
                prefs.get("reduced_motion", False),
                prefs.get("focus_mode", False),
                prefs.get("dyslexia_font", False),
                prefs.get("selected_language", "en")
            ))
            cur.close()
            conn.close()
            logger.info(f"Persisted accessibility preferences to Supabase for user {user_id}")
        except Exception as e:
            logger.error(f"Failed to persist accessibility preferences to Supabase: {e}")

    def save_quiz_attempt(self, attempt: Dict[str, Any]):
        self.quiz_attempts.insert(0, attempt)
        try:
            conn = self._get_connection()
            conn.autocommit = True
            cur = conn.cursor()
            raw_id = attempt.get("id")
            try:
                uuid.UUID(str(raw_id))
                attempt_id = str(raw_id)
            except (ValueError, AttributeError, TypeError):
                attempt_id = str(uuid.uuid4())
                attempt["id"] = attempt_id

            cur.execute("""
                INSERT INTO public.quiz_attempts (
                    id, quiz_id, student_id, score, total_questions, percentage, is_passed, answers, submitted_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW());
            """, (
                attempt_id,
                attempt["quiz_id"],
                attempt["student_id"],
                attempt["score"],
                attempt["total_questions"],
                attempt["percentage"],
                attempt["is_passed"],
                json.dumps(attempt.get("feedback_details", []))
            ))
            cur.close()
            conn.close()
            logger.info(f"Persisted quiz attempt to Supabase: {attempt_id}")
        except Exception as e:
            logger.error(f"Failed to persist quiz attempt to Supabase: {e}")

    def save_assignment_submission(self, assignment_id: str, submission_content: str) -> Optional[Dict[str, Any]]:
        target_asg = None
        for asg in self.assignments:
            if asg["id"] == assignment_id:
                asg["status"] = "SUBMITTED"
                asg["submission_content"] = submission_content
                asg["submitted_at"] = datetime.now(timezone.utc).isoformat()
                target_asg = asg
                break

        if not target_asg:
            return None

        try:
            conn = self._get_connection()
            conn.autocommit = True
            cur = conn.cursor()
            cur.execute("""
                UPDATE public.assignments
                SET status = 'SUBMITTED',
                    submission_content = %s,
                    submitted_at = NOW()
                WHERE id = %s;
            """, (submission_content, assignment_id))
            cur.close()
            conn.close()
            logger.info(f"Persisted assignment submission to Supabase: {assignment_id}")
        except Exception as e:
            logger.error(f"Failed to update assignment in Supabase: {e}")

        return target_asg

    def save_learning_progress(self, lesson_id: str, student_id: str, time_spent_seconds: int = 900):
        now_iso = datetime.now(timezone.utc).isoformat()
        rec = {
            "lesson_id": lesson_id,
            "student_id": student_id,
            "is_completed": True,
            "time_spent_seconds": time_spent_seconds,
            "completed_at": now_iso
        }
        self.learning_progress[lesson_id] = rec

        try:
            conn = self._get_connection()
            conn.autocommit = True
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO public.learning_progress (
                    lesson_id, student_id, is_completed, time_spent_seconds, completed_at
                ) VALUES (%s, %s, true, %s, NOW())
                ON CONFLICT (lesson_id, student_id) DO UPDATE SET
                    is_completed = true,
                    time_spent_seconds = public.learning_progress.time_spent_seconds + EXCLUDED.time_spent_seconds,
                    completed_at = NOW();
            """, (lesson_id, student_id, time_spent_seconds))
            cur.close()
            conn.close()
            logger.info(f"Persisted lesson completion to Supabase for lesson {lesson_id}")
        except Exception as e:
            logger.error(f"Failed to persist learning progress to Supabase: {e}")

    def save_document_job(self, job_dict: Dict[str, Any]):
        job_id = job_dict["job_id"]
        self.document_jobs[job_id] = job_dict

        accessible_out = job_dict.get("accessible_output") or {}
        if isinstance(accessible_out, dict) and job_dict.get("extracted_markdown"):
            accessible_out["markdown_content"] = job_dict.get("extracted_markdown")

        struct = job_dict.get("extracted_structure") or {}
        if not isinstance(struct, dict):
            struct = {}
        if "file_url" not in struct:
            struct["file_url"] = job_dict.get("file_url") or f"/api/documents/{job_id}/file"
            struct["download_url"] = job_dict.get("download_url") or f"/api/documents/{job_id}/download"
        if "file_size" in job_dict and "file_size" not in struct:
            struct["file_size"] = job_dict["file_size"]
        if "mime_type" in job_dict and "mime_type" not in struct:
            struct["mime_type"] = job_dict["mime_type"]
        if "file_path" in job_dict and "file_path" not in struct:
            struct["file_path"] = job_dict["file_path"]
        job_dict["extracted_structure"] = struct

        try:
            conn = self._get_connection()
            conn.autocommit = True
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO public.document_jobs (
                    job_id, teacher_id, file_name, status, error_message, extracted_structure, accessible_output, is_shared_with_students, teacher_notes, uploaded_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
                )
                ON CONFLICT (job_id) DO UPDATE SET
                    teacher_id = EXCLUDED.teacher_id,
                    status = EXCLUDED.status,
                    error_message = EXCLUDED.error_message,
                    extracted_structure = EXCLUDED.extracted_structure,
                    accessible_output = EXCLUDED.accessible_output,
                    is_shared_with_students = EXCLUDED.is_shared_with_students,
                    teacher_notes = EXCLUDED.teacher_notes,
                    updated_at = NOW();
            """, (
                job_id,
                job_dict.get("teacher_id"),
                job_dict.get("file_name", "document"),
                job_dict.get("status", "PROCESSING"),
                job_dict.get("error_message"),
                json.dumps(job_dict.get("extracted_structure") or {}),
                json.dumps(accessible_out),
                job_dict.get("is_shared_with_students", True),
                job_dict.get("teacher_notes")
            ))
            cur.close()
            conn.close()
            logger.info(f"Persisted document job to Supabase: {job_id}")
        except Exception as e:
            logger.error(f"Failed to persist document job to Supabase: {e}")

    def update_student_selected_teacher(self, student_id: str, teacher_id: str):
        if student_id in self.profiles:
            self.profiles[student_id]["selected_teacher_id"] = teacher_id
        try:
            conn = self._get_connection()
            conn.autocommit = True
            cur = conn.cursor()
            cur.execute("""
                UPDATE public.profiles
                SET selected_teacher_id = %s, updated_at = NOW()
                WHERE id = %s;
            """, (teacher_id, student_id))
            cur.close()
            conn.close()
            logger.info(f"Updated student {student_id} selected educator to {teacher_id}")
        except Exception as e:
            logger.error(f"Failed to persist selected teacher to Supabase: {e}")

    def save_quiz(self, quiz_dict: Dict[str, Any]) -> Dict[str, Any]:
        qid = str(quiz_dict.get("id") or uuid.uuid4())
        quiz_dict["id"] = qid
        self.quizzes[qid] = quiz_dict

        try:
            conn = self._get_connection()
            conn.autocommit = True
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO public.quizzes (
                    id, lesson_id, title, description, passing_score, questions, created_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, NOW()
                )
                ON CONFLICT (id) DO UPDATE SET
                    lesson_id = EXCLUDED.lesson_id,
                    title = EXCLUDED.title,
                    description = EXCLUDED.description,
                    passing_score = EXCLUDED.passing_score,
                    questions = EXCLUDED.questions;
            """, (
                qid,
                quiz_dict.get("lesson_id"),
                quiz_dict.get("title", "Mastery Quiz"),
                quiz_dict.get("description", "Accessible assessment"),
                quiz_dict.get("passing_score", 70),
                json.dumps(quiz_dict.get("questions", []))
            ))
            cur.close()
            conn.close()
            logger.info(f"Persisted quiz to Supabase: {qid}")
        except Exception as e:
            logger.error(f"Failed to persist quiz to Supabase: {e}", exc_info=True)

        return quiz_dict

    def save_course(self, course_dict: Dict[str, Any]):
        cid = str(course_dict["id"])
        self.courses[cid] = course_dict

        try:
            conn = self._get_connection()
            conn.autocommit = True
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO public.courses (
                    id, teacher_id, title, slug, description, category, difficulty_level,
                    is_published, enrollment_count, completion_rate, created_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
                )
                ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title,
                    slug = EXCLUDED.slug,
                    description = EXCLUDED.description,
                    category = EXCLUDED.category,
                    difficulty_level = EXCLUDED.difficulty_level,
                    is_published = EXCLUDED.is_published,
                    updated_at = NOW();
            """, (
                cid,
                course_dict.get("teacher_id"),
                course_dict.get("title"),
                course_dict.get("slug"),
                course_dict.get("description", ""),
                course_dict.get("category", "Computer Science"),
                course_dict.get("difficulty_level", "Beginner"),
                course_dict.get("is_published", True),
                course_dict.get("enrollment_count", 0),
                course_dict.get("completion_rate", 0)
            ))
            cur.close()
            conn.close()
            logger.info(f"Persisted course to Supabase: {cid}")
        except Exception as e:
            logger.error(f"Failed to persist course to Supabase: {e}")

    def save_lesson(self, lesson_dict: Dict[str, Any]):
        lid = str(lesson_dict["id"])
        self.lessons[lid] = lesson_dict

        try:
            conn = self._get_connection()
            conn.autocommit = True
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO public.lessons (
                    id, module_id, course_id, title, slug, content_raw, content_simplified,
                    summary, order_index, estimated_minutes, audio_transcript, is_published, created_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
                )
                ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title,
                    slug = EXCLUDED.slug,
                    content_raw = EXCLUDED.content_raw,
                    content_simplified = EXCLUDED.content_simplified,
                    summary = EXCLUDED.summary,
                    audio_transcript = EXCLUDED.audio_transcript,
                    updated_at = NOW();
            """, (
                lid,
                lesson_dict.get("module_id"),
                lesson_dict.get("course_id"),
                lesson_dict.get("title"),
                lesson_dict.get("slug"),
                lesson_dict.get("content_raw", ""),
                lesson_dict.get("content_simplified"),
                lesson_dict.get("summary"),
                lesson_dict.get("order_index", 1),
                lesson_dict.get("estimated_minutes", 15),
                lesson_dict.get("audio_transcript"),
                lesson_dict.get("is_published", True)
            ))
            cur.close()
            conn.close()
            logger.info(f"Persisted lesson to Supabase: {lid}")
        except Exception as e:
            logger.error(f"Failed to persist lesson to Supabase: {e}")

    def save_class(self, class_dict: Dict[str, Any]) -> Dict[str, Any]:
        raw_id = class_dict.get("id")
        try:
            uuid.UUID(str(raw_id))
            cls_id = str(raw_id)
        except (ValueError, AttributeError, TypeError):
            cls_id = str(uuid.uuid4())
        class_dict["id"] = cls_id

        existing_idx = next((i for i, c in enumerate(self.classes) if c["id"] == cls_id), None)
        if existing_idx is not None:
            self.classes[existing_idx] = class_dict
        else:
            self.classes.insert(0, class_dict)

        try:
            conn = self._get_connection()
            conn.autocommit = True
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO public.classes (
                    id, teacher_id, title, code, academic_term, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
                ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title,
                    code = EXCLUDED.code,
                    academic_term = EXCLUDED.academic_term,
                    updated_at = NOW();
            """, (
                cls_id,
                class_dict.get("teacher_id"),
                class_dict.get("title", "Active Class Cohort"),
                class_dict.get("code", "CS-101"),
                class_dict.get("academic_term", "Fall 2026")
            ))
            cur.close()
            conn.close()
            logger.info(f"Persisted class cohort to Supabase: {cls_id}")
        except Exception as e:
            logger.error(f"Failed to persist class to Supabase: {e}")

        return class_dict

data_store = LiveSupabaseDataStore()

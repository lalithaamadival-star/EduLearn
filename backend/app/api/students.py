from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List, Optional
from app.repositories.store import data_store
from app.core.security import get_current_user

router = APIRouter(prefix="/api/students", tags=["Student Portal Data"])

class SelectTeacherRequest(BaseModel):
    teacher_id: str

@router.post("/select-teacher")
async def select_teacher(req: SelectTeacherRequest, user: Dict[str, Any] = Depends(get_current_user)):
    """Allows student to select or switch their primary educator."""
    data_store.sync_profiles()
    teacher = data_store.profiles.get(req.teacher_id)
    if not teacher or (teacher.get("role") or "").strip().upper() != "TEACHER":
        raise HTTPException(status_code=404, detail="Selected educator not found.")

    student_id = str(user["id"])
    data_store.update_student_selected_teacher(student_id, req.teacher_id)
    return {
        "status": "success",
        "selected_teacher": {
            "id": str(teacher["id"]),
            "full_name": teacher["full_name"],
            "email": teacher["email"],
            "organization": teacher.get("organization") or "Department of Computer Science & Engineering"
        }
    }

@router.get("/dashboard")
async def get_student_dashboard(
    teacher_id: Optional[str] = None,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Real student personalized learning workspace telemetry:
    - Scoped strictly to the active selected educator
    - Switching teacher updates courses, continue learning, assignments, and study documents
    - Multi-educator selection telemetry
    """
    student_id = str(user["id"])
    data_store.sync_profiles()
    data_store.sync_document_jobs()

    current_profile = data_store.profiles.get(student_id, user)

    # 1. Look up all real registered teachers
    teachers = [
        p for p in data_store.profiles.values()
        if (p.get("role") or "").strip().upper() == "TEACHER"
    ]

    # Resolve active selected teacher
    target_tid = teacher_id or current_profile.get("selected_teacher_id")
    primary_teacher = None
    if target_tid:
        primary_teacher = data_store.profiles.get(str(target_tid))

    # If teacher_id passed and valid, update student preference in database
    if teacher_id and primary_teacher and primary_teacher.get("role") == "TEACHER":
        data_store.update_student_selected_teacher(student_id, teacher_id)

    # Fallback to single teacher if only one exists and none was selected
    if not primary_teacher and len(teachers) == 1:
        primary_teacher = teachers[0]

    # 2. Scope published courses and study documents to the selected teacher
    if primary_teacher:
        t_id_str = str(primary_teacher["id"])
        published_courses = [
            c for c in data_store.courses.values()
            if c.get("is_published", True) and str(c.get("teacher_id")) == t_id_str
        ]
        # Study documents uploaded by this teacher
        study_documents = []
        for d in data_store.document_jobs.values():
            if str(d.get("teacher_id")) == t_id_str and d.get("is_shared_with_students", True):
                d_copy = dict(d)
                struct = d_copy.get("extracted_structure") or {}
                acc_out = d_copy.get("accessible_output") or {}
                if not d_copy.get("title"):
                    d_copy["title"] = struct.get("title") or d_copy.get("file_name", "Study Document")
                if not d_copy.get("extracted_markdown") and isinstance(acc_out, dict):
                    d_copy["extracted_markdown"] = acc_out.get("markdown_content") or ""
                if not d_copy.get("markdown_preview"):
                    md = d_copy.get("extracted_markdown") or ""
                    d_copy["markdown_preview"] = (md[:280] + "...") if len(md) > 280 else md
                if not d_copy.get("concepts_detected"):
                    raw_c = struct.get("key_concepts") or []
                    d_copy["concepts_detected"] = [
                        c.get("term", "") if isinstance(c, dict) else str(c) for c in raw_c if c
                    ]
                study_documents.append(d_copy)
    else:
        published_courses = []
        study_documents = []

    course_ids = {str(c["id"]) for c in published_courses}
    teacher_lessons = [
        l for l in data_store.lessons.values()
        if str(l.get("course_id")) in course_ids and l.get("is_published", True)
    ]
    total_lessons = len(teacher_lessons)

    continue_learning = None
    if published_courses:
        first_course = published_courses[0]
        c_id = str(first_course["id"])
        course_lessons = [
            l for l in data_store.lessons.values()
            if str(l.get("course_id")) == c_id and l.get("is_published", True)
        ]
        course_lessons.sort(key=lambda x: x.get("order_index", 1))

        if course_lessons:
            first_lesson = course_lessons[0]
            lp = data_store.learning_progress.get(str(first_lesson["id"]))
            is_done = lp and lp.get("is_completed")

            continue_learning = {
                "has_content": True,
                "course_title": first_course["title"],
                "lesson_title": first_lesson["title"],
                "lesson_slug": first_lesson["slug"],
                "course_slug": first_course["slug"],
                "estimated_minutes": first_lesson.get("estimated_minutes", 15),
                "progress_percentage": 100 if is_done else 0
            }

    # 3. Real assignments scoped to this educator's curriculum
    pending_assignments = [
        a for a in data_store.assignments
        if a.get("status") == "ASSIGNED" and (str(a.get("course_id")) in course_ids or not a.get("course_id"))
    ]

    # 4. Student notes and bookmarks
    student_notes = [
        n for n in data_store.notes
        if str(n.get("student_id", "")) == student_id or not n.get("student_id")
    ]
    student_bookmarks = [
        b for b in data_store.bookmarks
        if str(b.get("student_id", "")) == student_id or not b.get("student_id")
    ]

    # 5. Real progress calculation
    completed_lessons = sum(
        1 for lp in data_store.learning_progress.values()
        if str(lp.get("student_id")) == student_id and lp.get("is_completed") and str(lp.get("lesson_id")) in {str(l["id"]) for l in teacher_lessons}
    )
    overall_percentage = round((completed_lessons / total_lessons * 100), 1) if total_lessons > 0 else 0

    return {
        "student": user,
        "assigned_teacher": {
            "id": str(primary_teacher["id"]),
            "full_name": primary_teacher["full_name"],
            "email": primary_teacher["email"],
            "organization": primary_teacher.get("organization") or "Department of Computer Science & Engineering"
        } if primary_teacher else None,
        "instructors": [
            {
                "id": str(t["id"]),
                "full_name": t["full_name"],
                "email": t["email"],
                "organization": t.get("organization") or "Department of Computer Science & Engineering",
                "courses_count": len([c for c in data_store.courses.values() if str(c.get("teacher_id")) == str(t["id"])])
            } for t in teachers
        ],
        "continue_learning": continue_learning,
        "upcoming_assignments": pending_assignments,
        "study_documents": study_documents,
        "courses_count": len(published_courses),
        "recent_notes": student_notes[:5],
        "bookmarks": student_bookmarks[:5],
        "overall_progress": {
            "completed_lessons": completed_lessons,
            "total_lessons": total_lessons,
            "percentage": overall_percentage
        }
    }

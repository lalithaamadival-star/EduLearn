from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ------------------------------------------------------------
# Accessibility Preferences Schemas
# ------------------------------------------------------------
class AccessibilityPreferencesSchema(BaseModel):
    auditory_orientation: bool = True
    read_ai_responses_aloud: bool = False
    read_lesson_content_aloud: bool = False
    navigation_announcements: bool = True
    verbosity: str = "STANDARD"  # CONCISE, STANDARD, DETAILED
    voice_identifier: Optional[str] = "alloy"
    speech_rate: float = 1.00
    font_size_scale: float = 1.00
    theme: str = "dark" # dark, light
    high_contrast: bool = False
    reduced_motion: bool = False
    focus_mode: bool = False
    dyslexia_font: bool = False
    selected_language: str = "en"

class AccessibilityPreferencesUpdate(BaseModel):
    auditory_orientation: Optional[bool] = None
    read_ai_responses_aloud: Optional[bool] = None
    read_lesson_content_aloud: Optional[bool] = None
    navigation_announcements: Optional[bool] = None
    verbosity: Optional[str] = None
    voice_identifier: Optional[str] = None
    speech_rate: Optional[float] = None
    font_size_scale: Optional[float] = None
    theme: Optional[str] = None
    high_contrast: Optional[bool] = None
    reduced_motion: Optional[bool] = None
    focus_mode: Optional[bool] = None
    dyslexia_font: Optional[bool] = None
    selected_language: Optional[str] = None

# ------------------------------------------------------------
# AI Request & Response Schemas
# ------------------------------------------------------------
class AIChatContext(BaseModel):
    student_id: Optional[str] = None
    course_id: Optional[str] = None
    course_title: Optional[str] = None
    module_id: Optional[str] = None
    module_title: Optional[str] = None
    lesson_id: Optional[str] = None
    lesson_title: Optional[str] = None
    lesson_content: Optional[str] = None
    learning_progress_percent: Optional[int] = None
    last_quiz_score: Optional[str] = None
    selected_language: str = "en"
    accessibility_mode: Optional[str] = None

class AIChatRequest(BaseModel):
    message: str
    context: Optional[AIChatContext] = None
    history: Optional[List[Dict[str, str]]] = []
    action: Optional[str] = "chat" # chat, explain, simplify, expand, quiz_mistake, translate

class AISimplifyRequest(BaseModel):
    content: str
    target_reading_level: Optional[str] = "middle_school"
    language: Optional[str] = "en"

class AISummarizeRequest(BaseModel):
    content: str
    format: Optional[str] = "bullet_points" # bullet_points, narrative, key_takeaways
    max_words: Optional[int] = 200

class AITeacherAssistRequest(BaseModel):
    prompt: str
    task_type: str # lesson_outline, simplify, examples, quiz, assignment, revision_notes, accessibility_audit
    lesson_content: Optional[str] = None
    target_grade_level: Optional[str] = "undergraduate"
    language: Optional[str] = "en"

class AIResponse(BaseModel):
    content: str
    simplified_content: Optional[str] = None
    key_points: Optional[List[str]] = []
    suggested_follow_ups: Optional[List[str]] = []
    provider_used: str
    tokens_used: int = 0
    audio_transcript: Optional[str] = None

# ------------------------------------------------------------
# TTS Schemas
# ------------------------------------------------------------
class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None
    language: Optional[str] = "en"
    speed: Optional[float] = 1.0

class TTSResponse(BaseModel):
    audio_url: Optional[str] = None
    use_browser_fallback: bool = False
    transcript: str
    voice_name: str
    voice_id: Optional[str] = None
    duration_estimate_sec: float
    error_detail: Optional[str] = None

# ------------------------------------------------------------
# Document Intelligence & OCR Schemas
# ------------------------------------------------------------
class DocumentProcessingJobResponse(BaseModel):
    job_id: str
    file_name: str
    status: str # QUEUED, PROCESSING, NEEDS_REVIEW, READY, PUBLISHED, FAILED
    error_message: Optional[str] = None
    extracted_structure: Optional[Dict[str, Any]] = None
    extracted_markdown: Optional[str] = None
    teacher_notes: Optional[str] = None
    uploaded_at: str
    updated_at: str

class DocumentReviewUpdateRequest(BaseModel):
    extracted_markdown: Optional[str] = None
    teacher_notes: Optional[str] = None
    status: Optional[str] = "READY" # READY or PUBLISHED

# ------------------------------------------------------------
# Courses & Lessons Schemas
# ------------------------------------------------------------
class CourseCreate(BaseModel):
    title: str
    slug: str
    description: str
    category: str = "Computer Science"
    difficulty_level: str = "Beginner"

class LessonCreate(BaseModel):
    module_id: str
    title: str
    slug: str
    content_raw: str
    content_simplified: Optional[str] = None
    summary: Optional[str] = None
    estimated_minutes: int = 15

# ------------------------------------------------------------
# Quiz Schemas
# ------------------------------------------------------------
class QuizAnswerSubmit(BaseModel):
    question_id: str
    selected_options: List[str]

class QuizAttemptSubmit(BaseModel):
    quiz_id: str
    answers: List[QuizAnswerSubmit]

class QuizExplanationRequest(BaseModel):
    question_text: str
    student_answer: str
    correct_answer: str
    explanation: str

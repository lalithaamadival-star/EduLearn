import uuid
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
from app.models.schemas import LessonCreate
from app.repositories.store import data_store
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/api/lessons", tags=["Lessons"])

@router.get("/{lesson_id}")
async def get_lesson(lesson_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    lesson = data_store.lessons.get(lesson_id)
    if not lesson:
        for l in data_store.lessons.values():
            if l.get("slug") == lesson_id:
                lesson = l
                break

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Find associated quiz if any
    lesson_quiz = None
    for q in data_store.quizzes.values():
        if q["lesson_id"] == lesson["id"]:
            # Strip correct answer from student view
            quiz_copy = {
                "id": q["id"],
                "lesson_id": q["lesson_id"],
                "title": q["title"],
                "description": q["description"],
                "passing_score": q["passing_score"],
                "questions": [
                    {
                        "id": qn["id"],
                        "question_text": qn["question_text"],
                        "question_type": qn["question_type"],
                        "options": qn["options"],
                    }
                    for qn in q.get("questions", [])
                ]
            }
            lesson_quiz = quiz_copy
            break

    # Get course title
    course_title = "Python Fundamentals"
    if lesson.get("course_id") and lesson["course_id"] in data_store.courses:
        course_title = data_store.courses[lesson["course_id"]]["title"]

    return {
        **lesson,
        "course_title": course_title,
        "quiz": lesson_quiz
    }

@router.post("")
async def create_lesson(req: LessonCreate, user: Dict[str, Any] = Depends(require_role("TEACHER"))):
    new_id = str(uuid.uuid4())
    new_lesson = {
        "id": new_id,
        "module_id": req.module_id,
        "title": req.title,
        "slug": req.slug,
        "content_raw": req.content_raw,
        "content_simplified": req.content_simplified or req.content_raw,
        "summary": req.summary or "Lesson overview",
        "order_index": len(data_store.lessons) + 1,
        "estimated_minutes": req.estimated_minutes,
        "audio_transcript": req.summary or req.title,
        "audio_url": None,
        "is_published": False
    }
    data_store.save_lesson(new_lesson)
    return new_lesson

@router.put("/{lesson_id}")
async def update_lesson(
    lesson_id: str,
    update_data: Dict[str, Any],
    user: Dict[str, Any] = Depends(require_role("TEACHER"))
):
    if lesson_id not in data_store.lessons:
        raise HTTPException(status_code=404, detail="Lesson not found")
    lesson = data_store.lessons[lesson_id]
    lesson.update(update_data)
    data_store.save_lesson(lesson)
    return lesson

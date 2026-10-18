from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.repositories.store import data_store
from app.core.security import get_current_user

router = APIRouter(prefix="/api/progress", tags=["Learning Progress & Revision"])

@router.get("")
async def get_progress_overview(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Returns authentic learning progress and targeted revision recommendations.
    No manipulative streaks or vanity metrics; focus on conceptual mastery.
    """
    total_courses = len(data_store.courses)
    completed_lessons = len([p for p in data_store.learning_progress.values() if p.get("is_completed")])
    total_lessons = len(data_store.lessons)

    overall_percentage = round((completed_lessons / max(total_lessons, 1)) * 100)

    return {
        "overall_mastery_percentage": overall_percentage,
        "completed_lessons_count": completed_lessons,
        "total_lessons_count": total_lessons,
        "active_courses_count": total_courses,
        "quiz_attempts": data_store.quiz_attempts,
        "revision_records": data_store.revision_records,
        "recent_notes": data_store.notes,
        "bookmarks": data_store.bookmarks,
        "recommendations": [
            {
                "id": "rec-1",
                "title": "Deep Dive: Memory Pointer Aliasing in Python",
                "reason": "Reinforce conceptual distinction between mutable and immutable mutations.",
                "action_route": "/courses/python-fundamentals/lessons/variables-and-memory"
            },
            {
                "id": "rec-2",
                "title": "Practice: Short-Circuit Logical Branching",
                "reason": "Next topic in Module 1 curriculum.",
                "action_route": "/courses/python-fundamentals/lessons/control-flow-and-truthiness"
            }
        ]
    }

@router.post("/lesson/{lesson_id}/complete")
async def mark_lesson_complete(lesson_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    data_store.save_learning_progress(lesson_id, user["id"], 900)
    return {"status": "success", "lesson_id": lesson_id, "is_completed": True}

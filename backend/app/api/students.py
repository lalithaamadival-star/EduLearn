from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.repositories.store import data_store
from app.core.security import get_current_user

router = APIRouter(prefix="/api/students", tags=["Student Portal Data"])

@router.get("/dashboard")
async def get_student_dashboard(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Editorial hierarchy dashboard response:
    - Primary Continue Learning focus
    - AI Tutor quick prompt context
    - Upcoming assignments
    - Meaningful progress
    - Recent notes & bookmarks
    """
    first_lesson = data_store.lessons.get("e0000000-0000-0000-0000-000000000001")
    first_course = data_store.courses.get("c0000000-0000-0000-0000-000000000001")

    continue_learning = {
        "course_title": first_course["title"] if first_course else "Python Fundamentals",
        "lesson_title": first_lesson["title"] if first_lesson else "Variables, Data Types and Memory References",
        "lesson_slug": first_lesson["slug"] if first_lesson else "variables-and-memory",
        "course_slug": first_course["slug"] if first_course else "python-fundamentals",
        "estimated_minutes": first_lesson.get("estimated_minutes", 15) if first_lesson else 15,
        "progress_percentage": 65
    }

    pending_assignments = [a for a in data_store.assignments if a.get("status") == "ASSIGNED"]

    return {
        "student": user,
        "continue_learning": continue_learning,
        "upcoming_assignments": pending_assignments,
        "recent_notes": data_store.notes[:3],
        "bookmarks": data_store.bookmarks[:3],
        "overall_progress": {
            "completed_lessons": 1,
            "total_lessons": len(data_store.lessons),
            "percentage": 50
        }
    }

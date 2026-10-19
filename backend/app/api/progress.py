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
    student_id = str(user["id"])
    total_courses = len(data_store.courses)
    total_lessons = len(data_store.lessons)

    # User's completed lessons
    completed_lessons = len([
        p for p in data_store.learning_progress.values()
        if str(p.get("student_id")) == student_id and p.get("is_completed")
    ])
    overall_percentage = round((completed_lessons / max(total_lessons, 1)) * 100) if total_lessons > 0 else 0

    # User-scoped quiz attempts, notes, bookmarks, revision records
    user_quizzes = [
        q for q in data_store.quiz_attempts
        if str(q.get("student_id", "")) == student_id
    ]
    user_revision = [
        r for r in data_store.revision_records
        if str(r.get("student_id", "")) == student_id
    ]
    user_notes = [
        n for n in data_store.notes
        if str(n.get("student_id", "")) == student_id or not n.get("student_id")
    ]
    user_bookmarks = [
        b for b in data_store.bookmarks
        if str(b.get("student_id", "")) == student_id or not b.get("student_id")
    ]

    # Dynamic recommendations from actual published lessons
    recommendations = []
    for c in data_store.courses.values():
        c_slug = c.get("slug")
        c_id = str(c.get("id"))
        for l in data_store.lessons.values():
            if str(l.get("course_id")) == c_id and l.get("is_published", True):
                lp = data_store.learning_progress.get(str(l["id"]))
                if not (lp and lp.get("is_completed")):
                    recommendations.append({
                        "id": f"rec-{l.get('id')}",
                        "title": f"Study: {l.get('title')}",
                        "reason": f"Next topic in {c.get('title')}.",
                        "action_route": f"/courses/{c_slug}/lessons/{l.get('slug')}"
                    })
                    break
        if len(recommendations) >= 2:
            break

    return {
        "overall_mastery_percentage": overall_percentage,
        "completed_lessons_count": completed_lessons,
        "total_lessons_count": total_lessons,
        "active_courses_count": total_courses,
        "quiz_attempts": user_quizzes,
        "revision_records": user_revision,
        "recent_notes": user_notes,
        "bookmarks": user_bookmarks,
        "recommendations": recommendations
    }

@router.post("/lesson/{lesson_id}/complete")
async def mark_lesson_complete(lesson_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    data_store.save_learning_progress(lesson_id, user["id"], 900)
    return {"status": "success", "lesson_id": lesson_id, "is_completed": True}

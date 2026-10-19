from fastapi import APIRouter, Depends
from typing import Dict, Any, List, Optional
from app.repositories.store import data_store
from app.core.security import get_current_user

router = APIRouter(prefix="/api/students", tags=["Student Portal Data"])

@router.get("/dashboard")
async def get_student_dashboard(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Real student personalized learning workspace telemetry:
    - Primary Continue Learning focus (from live published courses)
    - Assigned educator and faculty details
    - Active assignments and pending coursework
    - Real completion progress
    - Student notes and bookmarks
    """
    student_id = str(user["id"])

    # 1. Look up real registered teachers (fresh sync from database)
    data_store.sync_profiles()
    teachers = [
        p for p in data_store.profiles.values()
        if (p.get("role") or "").strip().upper() == "TEACHER"
    ]
    primary_teacher = teachers[0] if teachers else None

    # 2. Look up published courses and lessons
    published_courses = [c for c in data_store.courses.values() if c.get("is_published", True)]
    total_lessons = len([l for l in data_store.lessons.values() if l.get("is_published", True)])

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
            # Calculate lesson progress if exists
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

    # 3. Real assignments
    pending_assignments = [
        a for a in data_store.assignments
        if a.get("status") == "ASSIGNED"
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
        if str(lp.get("student_id")) == student_id and lp.get("is_completed")
    )
    overall_percentage = round((completed_lessons / total_lessons * 100), 1) if total_lessons > 0 else 0

    return {
        "student": user,
        "assigned_teacher": {
            "id": str(primary_teacher["id"]),
            "full_name": primary_teacher["full_name"],
            "email": primary_teacher["email"],
            "organization": primary_teacher.get("organization") or "Department of Computing"
        } if primary_teacher else None,
        "instructors": [
            {
                "id": str(t["id"]),
                "full_name": t["full_name"],
                "email": t["email"],
                "organization": t.get("organization") or "Department of Computing"
            } for t in teachers
        ],
        "continue_learning": continue_learning,
        "upcoming_assignments": pending_assignments,
        "recent_notes": student_notes[:5],
        "bookmarks": student_bookmarks[:5],
        "overall_progress": {
            "completed_lessons": completed_lessons,
            "total_lessons": total_lessons,
            "percentage": overall_percentage
        }
    }

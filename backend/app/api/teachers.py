from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from app.repositories.store import data_store
from app.core.security import require_role

router = APIRouter(prefix="/api/teachers", tags=["Teacher Portal Data"])

@router.get("/dashboard")
async def get_teacher_dashboard(user: Dict[str, Any] = Depends(require_role("TEACHER"))):
    """
    Teacher operational dashboard payload.
    Structured for density, operational oversight, and pedagogical velocity.
    """
    courses = list(data_store.courses.values())
    pending_documents = [d for d in data_store.document_jobs.values() if d.get("status") in ("QUEUED", "PROCESSING", "NEEDS_REVIEW")]
    recent_submissions = [a for a in data_store.assignments if a.get("status") in ("SUBMITTED", "GRADED")]

    classes = [
        {
            "id": "cls-01",
            "title": "CS201: Computational Structures & Accessibility",
            "code": "CS201-2026A",
            "students_count": 34,
            "avg_mastery": 86.4,
            "active_submissions": 3
        },
        {
            "id": "cls-02",
            "title": "SE305: Inclusive Software Architecture",
            "code": "SE305-2026A",
            "students_count": 28,
            "avg_mastery": 91.2,
            "active_submissions": 1
        }
    ]

    alerts = [
        {
            "id": "alt-1",
            "type": "REVIEW_NEEDED",
            "message": "1 document OCR extraction awaiting teacher review before publishing.",
            "link": "/teacher/documents"
        },
        {
            "id": "alt-2",
            "type": "SUBMISSION_READY",
            "message": "New student submission in WCAG 2.2 AAA Audit assignment.",
            "link": "/teacher/assignments"
        }
    ]

    return {
        "teacher": user,
        "classes": classes,
        "courses_summary": courses,
        "pending_document_jobs": pending_documents,
        "recent_submissions": recent_submissions,
        "alerts": alerts,
        "analytics_quick_view": {
            "total_students": 62,
            "lessons_published": len(data_store.lessons),
            "quiz_pass_rate": 94.2,
            "avg_time_per_lesson_min": 18.5
        }
    }

@router.get("/classes")
async def get_classes(user: Dict[str, Any] = Depends(require_role("TEACHER"))):
    return [
        {
            "id": "cls-01",
            "title": "CS201: Computational Structures & Accessibility",
            "code": "CS201-2026A",
            "academic_term": "Fall 2026",
            "enrolled_students": [
                {
                    "id": "b0000000-0000-0000-0000-000000000001",
                    "full_name": "Rahul Verma",
                    "email": "rahul.verma@accessed.edu",
                    "preferred_mode": "Screen-Reader + Auditory",
                    "completion_rate": 88
                },
                {
                    "id": "b0000000-0000-0000-0000-000000000002",
                    "full_name": "Priya Sen",
                    "email": "priya.sen@accessed.edu",
                    "preferred_mode": "High Contrast + Large Text",
                    "completion_rate": 94
                }
            ]
        }
    ]

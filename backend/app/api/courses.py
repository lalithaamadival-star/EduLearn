import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from app.models.schemas import CourseCreate
from app.repositories.store import data_store
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/api/courses", tags=["Courses"])

def enrich_course_with_teacher(course: Dict[str, Any]) -> Dict[str, Any]:
    c = dict(course)
    t_id = str(c.get("teacher_id") or "")
    teacher = data_store.profiles.get(t_id)

    # If teacher_id is not set or not cached, sync from database
    if not teacher:
        data_store.sync_profiles()
        teacher = data_store.profiles.get(t_id)

    # Fallback to first teacher in profiles
    if not teacher:
        teachers = [p for p in data_store.profiles.values() if (p.get("role") or "").strip().upper() == "TEACHER"]
        if teachers:
            teacher = teachers[0]

    c["instructor_name"] = teacher["full_name"] if teacher else "Faculty Educator"
    c["instructor_email"] = teacher.get("email") if teacher else None
    c["instructor_organization"] = teacher.get("organization") if teacher else "Department of Computing"
    return c

@router.get("")
async def list_courses(
    teacher_id: Optional[str] = None,
    user: Dict[str, Any] = Depends(get_current_user)
):
    role = (user.get("role") or "").strip().upper()
    effective_tid = teacher_id
    if role == "TEACHER" and not teacher_id:
        effective_tid = str(user["id"])

    courses = [enrich_course_with_teacher(c) for c in data_store.courses.values()]
    if effective_tid and effective_tid != "ALL":
        courses = [c for c in courses if str(c.get("teacher_id")) == str(effective_tid)]
    return courses

@router.get("/{course_id}")
async def get_course_detail(course_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    course = data_store.courses.get(course_id)
    if not course:
        # Check by slug
        for c in data_store.courses.values():
            if c.get("slug") == course_id:
                course = c
                break

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enriched = enrich_course_with_teacher(course)

    # Find modules and lessons
    c_id = course["id"]
    course_modules = [m for m in data_store.modules.values() if m["course_id"] == c_id]
    course_modules.sort(key=lambda x: x["order_index"])

    for mod in course_modules:
        m_id = mod["id"]
        lessons = [l for l in data_store.lessons.values() if l["module_id"] == m_id]
        lessons.sort(key=lambda x: x["order_index"])
        mod["lessons"] = lessons

    return {
        **enriched,
        "modules": course_modules
    }

@router.post("")
async def create_course(req: CourseCreate, user: Dict[str, Any] = Depends(require_role("TEACHER"))):
    new_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    new_course = {
        "id": new_id,
        "teacher_id": user["id"],
        "title": req.title,
        "slug": req.slug,
        "description": req.description,
        "category": req.category,
        "difficulty_level": req.difficulty_level,
        "is_published": False,
        "enrollment_count": 0,
        "completion_rate": 0,
        "created_at": now_iso
    }
    data_store.save_course(new_course)
    return new_course

@router.put("/{course_id}")
async def update_course(
    course_id: str,
    update_data: Dict[str, Any],
    user: Dict[str, Any] = Depends(require_role("TEACHER"))
):
    if course_id not in data_store.courses:
        raise HTTPException(status_code=404, detail="Course not found")
    course = data_store.courses[course_id]
    course.update(update_data)
    data_store.save_course(course)
    return course

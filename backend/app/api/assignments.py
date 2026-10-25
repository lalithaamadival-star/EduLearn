from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.repositories.store import data_store
from app.core.security import get_current_user, require_role
from app.core.logging import logger

router = APIRouter(prefix="/api/assignments", tags=["Assignments"])

class AssignmentSubmissionRequest(BaseModel):
    submission_content: Optional[str] = None
    submission: Optional[str] = None
    content: Optional[str] = None

    def get_content(self) -> str:
        return (self.submission_content or self.submission or self.content or "").strip()

class AssignmentCreateRequest(BaseModel):
    course_id: str
    title: str
    instructions: str
    due_date: Optional[str] = None
    max_score: Optional[int] = 100

class AssignmentUpdateRequest(BaseModel):
    title: Optional[str] = None
    instructions: Optional[str] = None
    due_date: Optional[str] = None
    max_score: Optional[int] = None

class AssignmentGradeRequest(BaseModel):
    score: int
    feedback: str

def enrich_assignment(asg: Dict[str, Any]) -> Dict[str, Any]:
    item = dict(asg)
    c_id = str(item.get("course_id") or "")
    course = data_store.courses.get(c_id)
    if course:
        item["course_title"] = course.get("title")
        item["course_slug"] = course.get("slug")
        item["category"] = course.get("category")
        t_id = str(item.get("teacher_id") or course.get("teacher_id") or "")
        teacher = data_store.profiles.get(t_id)
        item["instructor_name"] = teacher["full_name"] if teacher else "Faculty Educator"
        item["instructor_email"] = teacher.get("email") if teacher else None
    return item

@router.get("")
async def list_assignments(
    course_id: Optional[str] = None,
    teacher_id: Optional[str] = None,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns coursework assignments.
    - Teachers see coursework authored for their courses.
    - Students see coursework assigned by their selected educator.
    """
    data_store.sync_assignments()
    role = (user.get("role") or "").strip().upper()
    user_id = str(user.get("id"))
    
    all_asgs = [enrich_assignment(a) for a in data_store.assignments]

    if role == "TEACHER":
        # Teacher: find courses authored by this teacher
        teacher_course_ids = {str(c["id"]) for c in data_store.courses.values() if str(c.get("teacher_id")) == user_id}
        scoped = [
            a for a in all_asgs
            if str(a.get("teacher_id")) == user_id or str(a.get("course_id")) in teacher_course_ids
        ]
        if course_id:
            scoped = [a for a in scoped if str(a.get("course_id")) == str(course_id)]
        return scoped
    else:
        # Student: find courses belonging to student's active educator
        current_profile = data_store.profiles.get(user_id, user)
        active_t_id = teacher_id or current_profile.get("selected_teacher_id")
        
        if active_t_id:
            teacher_course_ids = {str(c["id"]) for c in data_store.courses.values() if str(c.get("teacher_id")) == str(active_t_id)}
            scoped = [
                a for a in all_asgs
                if str(a.get("teacher_id")) == str(active_t_id) or str(a.get("course_id")) in teacher_course_ids
            ]
            if course_id:
                scoped = [a for a in scoped if str(a.get("course_id")) == str(course_id)]
            return scoped
        
        if course_id:
            all_asgs = [a for a in all_asgs if str(a.get("course_id")) == str(course_id)]
        return all_asgs

@router.post("")
async def create_assignment(
    req: AssignmentCreateRequest,
    user: Dict[str, Any] = Depends(require_role("TEACHER"))
):
    """Teacher assigns new coursework to students enrolled in a course."""
    course = data_store.courses.get(req.course_id)
    if not course:
        # Try search by slug or ID match
        for c in data_store.courses.values():
            if str(c.get("id")) == str(req.course_id) or c.get("slug") == req.course_id:
                course = c
                break

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    teacher_id = str(user["id"])
    new_asg = data_store.create_assignment(
        course_id=str(course["id"]),
        title=req.title,
        instructions=req.instructions,
        teacher_id=teacher_id,
        due_date=req.due_date,
        max_score=req.max_score or 100
    )
    return enrich_assignment(new_asg)

@router.put("/{assignment_id}")
async def update_assignment(
    assignment_id: str,
    req: AssignmentUpdateRequest,
    user: Dict[str, Any] = Depends(require_role("TEACHER"))
):
    """Teacher updates assignment instructions, title, or due date."""
    target = None
    for a in data_store.assignments:
        if a["id"] == assignment_id:
            if req.title is not None:
                a["title"] = req.title
            if req.instructions is not None:
                a["instructions"] = req.instructions
            if req.due_date is not None:
                a["due_date"] = req.due_date
            if req.max_score is not None:
                a["max_score"] = req.max_score
            target = a
            break

    if not target:
        raise HTTPException(status_code=404, detail="Assignment not found")

    try:
        conn = data_store._get_connection()
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute("""
            UPDATE public.assignments
            SET title = %s, instructions = %s, due_date = %s, max_score = %s
            WHERE id = %s;
        """, (target["title"], target["instructions"], target["due_date"], target["max_score"], assignment_id))
        cur.close()
        conn.close()
    except Exception as e:
        logger.error(f"Failed to update assignment: {e}")

    return enrich_assignment(target)

@router.post("/{assignment_id}/grade")
async def grade_assignment(
    assignment_id: str,
    req: AssignmentGradeRequest,
    user: Dict[str, Any] = Depends(require_role("TEACHER"))
):
    """Teacher evaluates and grades a student submission with scores and feedback."""
    updated = data_store.grade_assignment(
        assignment_id=assignment_id,
        score=req.score,
        feedback=req.feedback
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Assignment submission not found")

    return enrich_assignment(updated)

@router.delete("/{assignment_id}")
async def delete_assignment(
    assignment_id: str,
    user: Dict[str, Any] = Depends(require_role("TEACHER"))
):
    """Teacher removes an assignment."""
    success = data_store.delete_assignment(assignment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Assignment could not be deleted")
    return {"message": "Assignment deleted successfully"}

@router.post("/{assignment_id}/submit")
async def submit_assignment(
    assignment_id: str,
    req: AssignmentSubmissionRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Student submits coursework solution or written text."""
    student_id = str(user.get("id"))
    student_name = user.get("full_name") or "Student"
    updated_asg = data_store.save_assignment_submission(
        assignment_id=assignment_id,
        submission_content=req.get_content(),
        student_id=student_id,
        student_name=student_name
    )
    if updated_asg:
        return enrich_assignment(updated_asg)

    raise HTTPException(status_code=404, detail="Assignment not found")

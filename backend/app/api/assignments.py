from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.repositories.store import data_store
from app.core.security import get_current_user

router = APIRouter(prefix="/api/assignments", tags=["Assignments"])

class AssignmentSubmissionRequest(BaseModel):
    submission_content: str

@router.get("")
async def list_assignments(user: Dict[str, Any] = Depends(get_current_user)):
    return data_store.assignments

@router.post("/{assignment_id}/submit")
async def submit_assignment(
    assignment_id: str,
    req: AssignmentSubmissionRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    updated_asg = data_store.save_assignment_submission(assignment_id, req.submission_content)
    if updated_asg:
        return updated_asg

    raise HTTPException(status_code=404, detail="Assignment not found")

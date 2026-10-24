import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from typing import Dict, Any, Optional
from app.models.schemas import DocumentProcessingJobResponse, DocumentReviewUpdateRequest
from app.services.ocr.gemini_service import gemini_document_service
from app.repositories.store import data_store
from app.core.security import require_role, get_current_user
from app.core.logging import logger

router = APIRouter(prefix="/api/documents", tags=["Document Intelligence & OCR"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    course_id: Optional[str] = Form(None),
    user: Dict[str, Any] = Depends(require_role("TEACHER"))
):
    """
    Teacher uploads PDF, DOCX, PPTX, or Image.
    Enters state: QUEUED -> PROCESSING -> Gemini extraction -> NEEDS_REVIEW.
    Never automatically publishes.
    """
    job_id = f"job-{uuid.uuid4().hex[:8]}"
    content_bytes = await file.read()
    text_preview = content_bytes[:4000].decode("utf-8", errors="ignore")

    now_iso = datetime.now(timezone.utc).isoformat()
    teacher_id = str(user["id"])

    # Create job in data_store
    data_store.document_jobs[job_id] = {
        "job_id": job_id,
        "teacher_id": teacher_id,
        "file_name": file.filename,
        "status": "PROCESSING",
        "error_message": None,
        "uploaded_at": now_iso,
        "updated_at": now_iso,
        "course_id": course_id,
        "extracted_structure": None,
        "extracted_markdown": None,
        "teacher_notes": None,
        "is_shared_with_students": True
    }

    # Trigger extraction through Gemini
    try:
        extracted = await gemini_document_service.analyze_document_content(
            file_name=file.filename,
            text_content_or_preview=text_preview,
            file_bytes=content_bytes,
            mime_type=file.content_type
        )
        data_store.document_jobs[job_id]["extracted_structure"] = {
            "title": extracted.get("title", file.filename),
            "headings": extracted.get("headings", []),
            "key_concepts": extracted.get("key_concepts", []),
            "suggested_quiz_questions": extracted.get("suggested_quiz_questions", [])
        }
        data_store.document_jobs[job_id]["extracted_markdown"] = extracted.get("markdown_content", "")
        data_store.document_jobs[job_id]["status"] = "NEEDS_REVIEW"
        data_store.document_jobs[job_id]["updated_at"] = datetime.now(timezone.utc).isoformat()
    except Exception as e:
        logger.error(f"Document processing failed: {e}")
        data_store.document_jobs[job_id]["status"] = "FAILED"
        data_store.document_jobs[job_id]["error_message"] = "Document structure extraction encountered an error. Please try uploading again."

    data_store.save_document_job(data_store.document_jobs[job_id])
    return data_store.document_jobs[job_id]

@router.get("")
async def list_documents(
    teacher_id: Optional[str] = None,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns study documents and OCR materials.
    - Teachers see their uploaded materials.
    - Students see study documents uploaded by their active selected educator.
    """
    data_store.sync_profiles()
    role = (user.get("role") or "").strip().upper()
    docs = list(data_store.document_jobs.values())

    enriched_docs = []
    for d in docs:
        doc_copy = dict(d)
        t_id = str(doc_copy.get("teacher_id") or "")
        teacher = data_store.profiles.get(t_id)
        doc_copy["teacher_name"] = teacher["full_name"] if teacher else "Faculty Educator"
        doc_copy["teacher_email"] = teacher.get("email") if teacher else None
        doc_copy["teacher_organization"] = teacher.get("organization") if teacher else "Department of Computer Science & Engineering"
        enriched_docs.append(doc_copy)

    if role == "TEACHER":
        t_docs = [d for d in enriched_docs if str(d.get("teacher_id")) == str(user["id"])]
        return t_docs if t_docs else enriched_docs
    else:
        # Student viewing study documents
        current_profile = data_store.profiles.get(str(user["id"]), user)
        active_t_id = teacher_id or current_profile.get("selected_teacher_id")
        if active_t_id:
            filtered = [d for d in enriched_docs if str(d.get("teacher_id")) == str(active_t_id) and d.get("is_shared_with_students", True)]
            return filtered
        return [d for d in enriched_docs if d.get("is_shared_with_students", True)]

@router.get("/{job_id}")
async def get_document_job(job_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    if job_id not in data_store.document_jobs:
        raise HTTPException(status_code=404, detail="Document processing job not found")
    job = dict(data_store.document_jobs[job_id])
    t_id = str(job.get("teacher_id") or "")
    teacher = data_store.profiles.get(t_id)
    job["teacher_name"] = teacher["full_name"] if teacher else "Faculty Educator"
    job["teacher_email"] = teacher.get("email") if teacher else None
    return job

@router.get("/{job_id}/status")
async def get_job_status(job_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    if job_id not in data_store.document_jobs:
        raise HTTPException(status_code=404, detail="Document processing job not found")
    job = data_store.document_jobs[job_id]
    return {
        "job_id": job["job_id"],
        "status": job["status"],
        "error_message": job.get("error_message"),
        "updated_at": job["updated_at"]
    }

@router.put("/{job_id}/review")
async def review_document(
    job_id: str,
    update: DocumentReviewUpdateRequest,
    user: Dict[str, Any] = Depends(require_role("TEACHER"))
):
    if job_id not in data_store.document_jobs:
        raise HTTPException(status_code=404, detail="Document processing job not found")
    
    job = data_store.document_jobs[job_id]
    if update.extracted_markdown is not None:
        job["extracted_markdown"] = update.extracted_markdown
    if update.teacher_notes is not None:
        job["teacher_notes"] = update.teacher_notes
    if update.status:
        job["status"] = update.status
    job["updated_at"] = datetime.now(timezone.utc).isoformat()
    data_store.save_document_job(job)

    return job

@router.post("/{job_id}/publish")
async def publish_document_as_lesson(
    job_id: str,
    user: Dict[str, Any] = Depends(require_role("TEACHER"))
):
    """
    Teacher final approval: converts the reviewed document into a published course lesson.
    """
    if job_id not in data_store.document_jobs:
        raise HTTPException(status_code=404, detail="Document processing job not found")
    
    job = data_store.document_jobs[job_id]
    lesson_id = str(uuid.uuid4())
    title = job["extracted_structure"].get("title", job["file_name"]) if job.get("extracted_structure") else job["file_name"]
    teacher_id = str(user["id"])

    target_course_id = job.get("course_id")
    target_module_id = None

    if target_course_id and str(target_course_id) in data_store.courses:
        for m in data_store.modules.values():
            if str(m.get("course_id")) == str(target_course_id):
                target_module_id = str(m["id"])
                break

    if not target_course_id:
        for c in data_store.courses.values():
            if str(c.get("teacher_id")) == teacher_id:
                target_course_id = str(c["id"])
                for m in data_store.modules.values():
                    if str(m.get("course_id")) == target_course_id:
                        target_module_id = str(m["id"])
                        break
                break

    if not target_course_id and data_store.courses:
        first_c = next(iter(data_store.courses.values()))
        target_course_id = str(first_c["id"])
        for m in data_store.modules.values():
            if str(m.get("course_id")) == target_course_id:
                target_module_id = str(m["id"])
                break

    if not target_module_id and data_store.modules:
        target_module_id = next(iter(data_store.modules.keys()))

    new_lesson = {
        "id": lesson_id,
        "module_id": target_module_id,
        "course_id": target_course_id,
        "title": title,
        "slug": f"doc-{uuid.uuid4().hex[:6]}-{title.lower().replace(' ', '-')[:30]}",
        "content_raw": job.get("extracted_markdown", "# New Lesson"),
        "content_simplified": f"# {title} (Simplified)\n\nThis lesson was converted from reviewed document {job['file_name']}.",
        "summary": f"Imported curriculum material based on {job['file_name']}.",
        "order_index": len(data_store.lessons) + 1,
        "estimated_minutes": 20,
        "audio_transcript": f"Welcome to {title}. This lesson covers material extracted from the course document.",
        "audio_url": None,
        "is_published": True
    }

    data_store.save_lesson(new_lesson)
    job["status"] = "PUBLISHED"
    job["published_to_lesson_id"] = lesson_id
    job["updated_at"] = datetime.now(timezone.utc).isoformat()
    data_store.save_document_job(job)

    return {
        "status": "PUBLISHED",
        "lesson": new_lesson
    }

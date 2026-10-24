import os
import re
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import FileResponse
from typing import Dict, Any, Optional
from app.models.schemas import DocumentProcessingJobResponse, DocumentReviewUpdateRequest
from app.services.ocr.gemini_service import gemini_document_service
from app.repositories.store import data_store
from app.core.security import require_role, get_current_user
from app.core.logging import logger

router = APIRouter(prefix="/api/documents", tags=["Document Intelligence & OCR"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def clean_hashes_from_preview(raw_md: str) -> str:
    """Removes all leading markdown hashes (#, ##, ###) and bold markers for clean card previews."""
    if not raw_md:
        return "Curriculum study notes verified for accessible multi-sensory learning."
    cleaned = re.sub(r'#{1,6}\s*', '', raw_md)
    cleaned = re.sub(r'\*{1,2}([^*]+)\*{1,2}', r'\1', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return (cleaned[:280] + "...") if len(cleaned) > 280 else cleaned

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    course_id: Optional[str] = Form(None),
    user: Dict[str, Any] = Depends(require_role("TEACHER"))
):
    """
    Teacher uploads PDF, DOCX, PPTX, or Image.
    Persists actual physical file for sharing/download, extracts OCR, enters state: NEEDS_REVIEW.
    Never automatically publishes.
    """
    job_id = f"job-{uuid.uuid4().hex[:8]}"
    content_bytes = await file.read()
    
    # Save the actual physical file to uploads directory so students & teachers can view/download
    safe_filename = file.filename.replace(" ", "_")
    saved_filename = f"{job_id}_{safe_filename}"
    file_path = os.path.join(UPLOAD_DIR, saved_filename)
    try:
        with open(file_path, "wb") as f_out:
            f_out.write(content_bytes)
    except Exception as e:
        logger.error(f"Failed to persist physical file: {e}")

    text_preview = content_bytes[:4000].decode("utf-8", errors="ignore")
    now_iso = datetime.now(timezone.utc).isoformat()
    teacher_id = str(user["id"])
    file_url = f"/api/documents/{job_id}/file"
    download_url = f"/api/documents/{job_id}/download"
    file_size = len(content_bytes)
    mime_type = file.content_type or "application/octet-stream"

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
        "file_path": file_path,
        "file_url": file_url,
        "download_url": download_url,
        "file_size": file_size,
        "mime_type": mime_type,
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
            "suggested_quiz_questions": extracted.get("suggested_quiz_questions", []),
            "file_url": file_url,
            "download_url": download_url,
            "file_size": file_size,
            "mime_type": mime_type,
            "file_path": file_path
        }
        data_store.document_jobs[job_id]["extracted_markdown"] = extracted.get("markdown_content", "")
        data_store.document_jobs[job_id]["markdown_preview"] = clean_hashes_from_preview(extracted.get("markdown_content", ""))
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
    data_store.sync_document_jobs()
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
        struct = doc_copy.get("extracted_structure") or {}
        acc_out = doc_copy.get("accessible_output") or {}
        jid = str(doc_copy.get("job_id") or "")
        
        # Original physical file links for viewing and downloading
        doc_copy["file_url"] = struct.get("file_url") or doc_copy.get("file_url") or f"/api/documents/{jid}/file"
        doc_copy["download_url"] = struct.get("download_url") or doc_copy.get("download_url") or f"/api/documents/{jid}/download"
        doc_copy["file_size"] = struct.get("file_size") or doc_copy.get("file_size")
        doc_copy["mime_type"] = struct.get("mime_type") or doc_copy.get("mime_type")

        if not doc_copy.get("title"):
            doc_copy["title"] = struct.get("title") or doc_copy.get("file_name", "Study Document")
        if not doc_copy.get("extracted_markdown") and isinstance(acc_out, dict):
            doc_copy["extracted_markdown"] = acc_out.get("markdown_content") or ""
        
        # Clean preview without '#' markers
        raw_md = doc_copy.get("extracted_markdown") or ""
        doc_copy["markdown_preview"] = clean_hashes_from_preview(raw_md)

        if not doc_copy.get("concepts_detected"):
            raw_c = struct.get("key_concepts") or []
            doc_copy["concepts_detected"] = [
                c.get("term", "") if isinstance(c, dict) else str(c) for c in raw_c if c
            ]
        enriched_docs.append(doc_copy)

    if role == "TEACHER":
        return [d for d in enriched_docs if str(d.get("teacher_id")) == str(user["id"])]
    else:
        # Student viewing study documents
        current_profile = data_store.profiles.get(str(user["id"]), user)
        active_t_id = teacher_id or current_profile.get("selected_teacher_id")
        if active_t_id:
            filtered = [d for d in enriched_docs if str(d.get("teacher_id")) == str(active_t_id) and d.get("is_shared_with_students", True)]
            return filtered
        return [d for d in enriched_docs if d.get("is_shared_with_students", True)]

@router.get("/{job_id}/file")
async def view_document_file(job_id: str):
    """Serves the actual uploaded physical file inline for in-browser viewing."""
    if job_id not in data_store.document_jobs:
        data_store.sync_document_jobs()
    if job_id not in data_store.document_jobs:
        raise HTTPException(status_code=404, detail="Document not found")
    
    job = data_store.document_jobs[job_id]
    struct = job.get("extracted_structure") or {}
    file_name = job.get("file_name", "document.pdf")
    safe_filename = file_name.replace(" ", "_")
    file_path = struct.get("file_path") or job.get("file_path") or os.path.join(UPLOAD_DIR, f"{job_id}_{safe_filename}")

    if not os.path.exists(file_path):
        matched = [f for f in os.listdir(UPLOAD_DIR) if f.startswith(job_id)]
        if matched:
            file_path = os.path.join(UPLOAD_DIR, matched[0])

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Original physical file not found on server")

    media_type = struct.get("mime_type") or job.get("mime_type") or "application/pdf"
    if file_name.lower().endswith(".pdf"):
        media_type = "application/pdf"
    elif file_name.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
        media_type = f"image/{file_name.split('.')[-1].lower()}"
    elif file_name.lower().endswith((".txt", ".md")):
        media_type = "text/plain"

    return FileResponse(
        file_path,
        media_type=media_type,
        filename=file_name,
        content_disposition_type="inline"
    )

@router.get("/{job_id}/download")
async def download_document_file(job_id: str):
    """Downloads the actual uploaded physical document directly."""
    if job_id not in data_store.document_jobs:
        data_store.sync_document_jobs()
    if job_id not in data_store.document_jobs:
        raise HTTPException(status_code=404, detail="Document not found")
    
    job = data_store.document_jobs[job_id]
    struct = job.get("extracted_structure") or {}
    file_name = job.get("file_name", "document.pdf")
    safe_filename = file_name.replace(" ", "_")
    file_path = struct.get("file_path") or job.get("file_path") or os.path.join(UPLOAD_DIR, f"{job_id}_{safe_filename}")

    if not os.path.exists(file_path):
        matched = [f for f in os.listdir(UPLOAD_DIR) if f.startswith(job_id)]
        if matched:
            file_path = os.path.join(UPLOAD_DIR, matched[0])

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Original physical file not found on server")

    return FileResponse(
        file_path,
        media_type="application/octet-stream",
        filename=file_name,
        content_disposition_type="attachment"
    )

@router.get("/{job_id}")
async def get_document_job(job_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    if job_id not in data_store.document_jobs:
        data_store.sync_document_jobs()
    if job_id not in data_store.document_jobs:
        raise HTTPException(status_code=404, detail="Document processing job not found")
    job = dict(data_store.document_jobs[job_id])
    t_id = str(job.get("teacher_id") or "")
    teacher = data_store.profiles.get(t_id)
    job["teacher_name"] = teacher["full_name"] if teacher else "Faculty Educator"
    job["teacher_email"] = teacher.get("email") if teacher else None
    struct = job.get("extracted_structure") or {}
    acc_out = job.get("accessible_output") or {}
    
    # Original physical file links
    job["file_url"] = struct.get("file_url") or job.get("file_url") or f"/api/documents/{job_id}/file"
    job["download_url"] = struct.get("download_url") or job.get("download_url") or f"/api/documents/{job_id}/download"
    job["file_size"] = struct.get("file_size") or job.get("file_size")
    job["mime_type"] = struct.get("mime_type") or job.get("mime_type")

    if not job.get("title"):
        job["title"] = struct.get("title") or job.get("file_name", "Study Document")
    if not job.get("extracted_markdown") and isinstance(acc_out, dict):
        job["extracted_markdown"] = acc_out.get("markdown_content") or ""
    
    raw_md = job.get("extracted_markdown") or ""
    job["markdown_preview"] = clean_hashes_from_preview(raw_md)

    if not job.get("concepts_detected"):
        raw_c = struct.get("key_concepts") or []
        job["concepts_detected"] = [
            c.get("term", "") if isinstance(c, dict) else str(c) for c in raw_c if c
        ]
    return job

@router.get("/{job_id}/status")
async def get_job_status(job_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    if job_id not in data_store.document_jobs:
        data_store.sync_document_jobs()
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
        data_store.sync_document_jobs()
    if job_id not in data_store.document_jobs:
        raise HTTPException(status_code=404, detail="Document processing job not found")
    
    job = data_store.document_jobs[job_id]
    if update.extracted_markdown is not None:
        job["extracted_markdown"] = update.extracted_markdown
        job["markdown_preview"] = clean_hashes_from_preview(update.extracted_markdown)
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

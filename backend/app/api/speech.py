from fastapi import APIRouter, Depends, UploadFile, File
from typing import Dict, Any
from app.core.security import get_current_user

router = APIRouter(prefix="/api/speech", tags=["Speech Recognition"])

@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Speech transcription endpoint.
    Frontend primarily utilizes Browser Web Speech API for immediate low-latency interaction,
    with keyboard entry always available as accessible alternative.
    """
    return {
        "status": "success",
        "message": "Speech received. Primary speech recognition operates in browser client.",
        "file_name": file.filename
    }

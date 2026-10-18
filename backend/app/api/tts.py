import os
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from typing import Dict, Any
from app.models.schemas import TTSRequest, TTSResponse
from app.services.tts.neural_tts_service import tts_service
from app.core.security import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/api/tts", tags=["Text-to-Speech Engine"])

@router.get("/voices")
async def list_configured_voices():
    """
    Returns active Neural Voice configuration for English and Kannada.
    """
    return {
        "active_provider": settings.TTS_PROVIDER,
        "voices": [
            {
                "language": "en",
                "label": "Microsoft Neural (Prabhat - Indian English)",
                "voice_id": settings.EDGE_VOICE_EN,
                "provider": "edge_tts",
                "tier": "free_human_neural",
                "is_default": True
            },
            {
                "language": "kn",
                "label": "Microsoft Neural (Sapna - Kannada)",
                "voice_id": settings.EDGE_VOICE_KN,
                "provider": "edge_tts",
                "tier": "free_human_neural",
                "is_default": False
            }
        ]
    }

@router.post("", response_model=TTSResponse)
@router.post("/synthesize", response_model=TTSResponse)
async def generate_speech(req: TTSRequest):
    """
    Synthesizes natural, human-sounding speech using Microsoft Neural Speech Models (Edge TTS)
    with local audio caching.
    Supports native Kannada (Sapna) and natural English (Aria) with zero external API dependencies.
    Guarantees accessible transcript is always delivered.
    """
    res = await tts_service.synthesize(
        text=req.text,
        voice_id=req.voice_id,
        language=req.language or "en"
    )

    return TTSResponse(
        audio_url=res.get("audio_url"),
        use_browser_fallback=res.get("use_browser_fallback", False),
        transcript=res.get("transcript", req.text),
        voice_name=res.get("voice_name", "Neural Voice"),
        voice_id=res.get("voice_id"),
        duration_estimate_sec=res.get("duration_estimate_sec", 5.0),
        error_detail=res.get("error_detail")
    )

@router.get("/audio/{filename}")
async def get_cached_audio(filename: str):
    """
    Serves cached audio streams.
    """
    filepath = os.path.join(settings.AUDIO_CACHE_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(filepath, media_type="audio/mpeg")

import hashlib
import os
from typing import Optional, Dict, Any
from app.core.config import settings
from app.core.logging import logger

class TTSService:
    """
    High-Fidelity Neural Speech Synthesis Service.
    Powered by Microsoft Neural Speech Models (Edge TTS) for natural, human-sounding
    narration in English (Aria) and Kannada (Sapna) with zero API keys and zero cost.
    """
    def __init__(self):
        self.default_en_voice = getattr(settings, "EDGE_VOICE_EN", "en-IN-PrabhatNeural")
        self.default_kn_voice = getattr(settings, "EDGE_VOICE_KN", "kn-IN-SapnaNeural")
        self.cache_dir = settings.AUDIO_CACHE_DIR
        os.makedirs(self.cache_dir, exist_ok=True)

    def resolve_voice(self, language: str = "en", text: str = "", voice_id: Optional[str] = None) -> tuple[str, str]:
        """
        Resolves the appropriate neural voice and human-friendly name.
        Kannada: kn-IN-SapnaNeural (Native Female Kannada Speaker)
        English: en-IN-PrabhatNeural (Natural Male Indian English Speaker)
        """
        has_kannada_chars = any('\u0c80' <= char <= '\u0cff' for char in text)
        is_kannada = (language and language.lower().startswith("kn")) or has_kannada_chars

        if voice_id and voice_id.startswith(("kn-IN", "en-US", "en-IN")):
            resolved_id = voice_id
            label = f"Microsoft Neural ({voice_id})"
        elif is_kannada:
            resolved_id = self.default_kn_voice
            label = "Microsoft Neural (Sapna - Kannada)"
        else:
            resolved_id = self.default_en_voice
            label = "Microsoft Neural (Prabhat - Indian English)"

        return resolved_id, label

    def _get_cache_filename(self, text: str, voice_id: str) -> str:
        key = f"{text}_{voice_id}".encode("utf-8")
        h = hashlib.sha256(key).hexdigest()
        return f"neural_{h}.mp3"

    async def synthesize(
        self,
        text: str,
        voice_id: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Synthesizes human-sounding speech using native neural models with local audio caching.
        Returns audio URL pointing to cached MP3 stream.
        Always returns full accessible transcript.
        """
        voice, voice_label = self.resolve_voice(language=language, text=text, voice_id=voice_id)
        cache_filename = self._get_cache_filename(text, voice)
        cache_filepath = os.path.join(self.cache_dir, cache_filename)

        # 1. Return from cache if already generated
        if os.path.exists(cache_filepath) and os.path.getsize(cache_filepath) > 500:
            logger.info(f"Serving Neural Speech from local cache: {cache_filename} ({voice})")
            return {
                "audio_url": f"/api/tts/audio/{cache_filename}",
                "use_browser_fallback": False,
                "transcript": text,
                "voice_name": f"{voice_label} (Cached)",
                "voice_id": voice,
                "duration_estimate_sec": round(len(text.split()) / 2.5, 1)
            }

        # 2. Generate high-quality human speech via edge-tts
        try:
            import edge_tts
            logger.info(f"Generating Free Human Neural Audio via {voice} ({len(text)} chars)")
            communicate = edge_tts.Communicate(text, voice)
            await communicate.save(cache_filepath)

            if os.path.exists(cache_filepath) and os.path.getsize(cache_filepath) > 500:
                logger.info(f"Successfully generated {voice} audio: {os.path.getsize(cache_filepath)} bytes")
                return {
                    "audio_url": f"/api/tts/audio/{cache_filename}",
                    "use_browser_fallback": False,
                    "transcript": text,
                    "voice_name": voice_label,
                    "voice_id": voice,
                    "duration_estimate_sec": round(len(text.split()) / 2.5, 1)
                }
        except Exception as e:
            logger.error(f"Neural TTS synthesis error: {e}")

        # 3. Graceful offline fallback
        return {
            "audio_url": None,
            "use_browser_fallback": True,
            "transcript": text,
            "voice_name": "Browser Web Speech Engine (Offline Fallback)",
            "voice_id": voice,
            "duration_estimate_sec": round(len(text.split()) / 2.5, 1),
            "error_detail": "Online neural synthesis unavailable. Using browser speech engine."
        }

tts_service = TTSService()

import httpx
from typing import List, Dict, Any
from app.services.ai.base import AIProvider
from app.core.config import settings
from app.core.logging import logger

class GroqProvider(AIProvider):
    provider_name = "groq"

    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.endpoint = "https://api.groq.com/openai/v1/chat/completions"

    async def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
        temperature: float = 0.4,
        max_tokens: int = 1500
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("Groq API key not configured")

        formatted_messages = [{"role": "system", "content": system_prompt}] + messages
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": formatted_messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(self.endpoint, headers=headers, json=payload)
            if response.status_code != 200:
                logger.error(f"Groq API error {response.status_code}: {response.text}")
                raise RuntimeError(f"Groq invocation returned HTTP {response.status_code}")

            data = response.json()
            choice = data["choices"][0]
            tokens = data.get("usage", {}).get("total_tokens", 0)
            
            return {
                "content": choice["message"]["content"],
                "provider": "Groq",
                "model": self.model,
                "tokens": tokens
            }

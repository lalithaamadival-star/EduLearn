from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class AIProvider(ABC):
    """
    Abstract Base Class for AccessEd AI Services.
    """
    provider_name: str

    @abstractmethod
    async def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
        temperature: float = 0.4,
        max_tokens: int = 1500
    ) -> Dict[str, Any]:
        """
        Generates response given conversation history and system instructions.
        Returns dict with:
        {
            'content': str,
            'provider': str,
            'model': str,
            'tokens': int
        }
        """
        pass

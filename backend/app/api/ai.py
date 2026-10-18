from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from app.models.schemas import (
    AIChatRequest,
    AISimplifyRequest,
    AISummarizeRequest,
    AITeacherAssistRequest,
    AIResponse
)
from app.services.ai.orchestrator import ai_orchestrator
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/api/ai", tags=["Contextual AI Engine"])

@router.post("/chat", response_model=AIResponse)
async def chat_with_tutor(req: AIChatRequest, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Context-aware AI tutor endpoint.
    Knows the student, current course, active lesson, quiz score, language, and accessibility mode.
    Gracefully falls back between Groq -> OpenRouter -> Pedagogical engine without exposing errors.
    """
    history = req.history or []
    messages = history + [{"role": "user", "content": req.message}]

    response_data = await ai_orchestrator.get_response(
        messages=messages,
        context=req.context,
        action=req.action or "chat"
    )

    # Generate suggested follow-ups
    suggested = [
        "Can you give me an everyday real-world example?",
        "How would this appear in an actual coding problem?",
        "Explain this in simplified language."
    ]

    return AIResponse(
        content=response_data["content"],
        simplified_content=None,
        key_points=[],
        suggested_follow_ups=suggested,
        provider_used=response_data["provider"],
        tokens_used=response_data.get("tokens", 0),
        audio_transcript=response_data["content"]
    )

@router.post("/simplify", response_model=AIResponse)
async def simplify_content(req: AISimplifyRequest, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Simplifies educational content into plain language with lower cognitive load.
    """
    system_prompt = (
        "You are an expert cognitive accessibility educator. "
        "Take the following technical lesson text and rewrite it in plain, clear, accessible language. "
        "Use bullet points, short clear sentences, and clear everyday metaphors. "
        "Do not sacrifice technical truth, but eliminate jargon and convoluted syntax."
    )
    messages = [{"role": "user", "content": req.content}]
    result = await ai_orchestrator.get_response(messages=messages, system_prompt_override=system_prompt)

    return AIResponse(
        content=result["content"],
        provider_used=result["provider"],
        tokens_used=result.get("tokens", 0)
    )

@router.post("/summarize", response_model=AIResponse)
async def summarize_content(req: AISummarizeRequest, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Extracts key takeaways and structural summary for rapid revision.
    """
    system_prompt = (
        "You are the AccessEd Curriculum Summarizer. "
        "Condense the following lesson text into high-impact key takeaways. "
        "Focus on core principles, common pitfalls, and practical heuristics."
    )
    messages = [{"role": "user", "content": req.content}]
    result = await ai_orchestrator.get_response(messages=messages, system_prompt_override=system_prompt)

    return AIResponse(
        content=result["content"],
        provider_used=result["provider"],
        tokens_used=result.get("tokens", 0)
    )

@router.post("/teacher-assist", response_model=AIResponse)
async def teacher_assist(
    req: AITeacherAssistRequest,
    user: Dict[str, Any] = Depends(require_role("TEACHER"))
):
    """
    Teacher AI assistance endpoint.
    Assists in lesson outlines, simplification, practice questions, and accessibility audits.
    CRITICAL: Never automatically publishes. Returned for teacher review.
    """
    system_prompt = (
        "You are the AccessEd Teacher AI Co-pilot.\n"
        "Generate high-quality, inclusive pedagogical draft material based on the teacher's prompt.\n"
        "Strict Structural Requirements:\n"
        "1. Structure drafts with clean markdown headings (e.g. '### 1. Pedagogical Objective', '### 2. Core Mental Model & Analogy', '### 3. Concrete Example').\n"
        "2. Include bulleted lists with bold prefix keywords for scannability.\n"
        "3. Provide code examples in fenced blocks with language tags (```python ... ```) where applicable.\n"
        "4. Include explicit accessibility adaptations for blind, low-vision, or neurodivergent students.\n"
        "5. Conclude with a '### 💡 Key Takeaway & Assessment Suggestion' card.\n"
        "6. Ensure the draft is polished, professional, and ready for educator review."
    )
    messages = [{"role": "user", "content": req.prompt}]
    if req.lesson_content:
        messages.append({"role": "user", "content": f"Reference Content:\n{req.lesson_content}"})

    result = await ai_orchestrator.get_response(messages=messages, system_prompt_override=system_prompt)

    return AIResponse(
        content=result["content"],
        provider_used=result["provider"],
        tokens_used=result.get("tokens", 0)
    )

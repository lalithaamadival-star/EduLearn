from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import json
import re
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

class AIAssignmentGenerateRequest(BaseModel):
    topic: str
    course_title: Optional[str] = None
    difficulty: Optional[str] = "Intermediate"
    additional_notes: Optional[str] = None

@router.post("/generate-assignment")
async def generate_assignment(
    req: AIAssignmentGenerateRequest,
    user: Dict[str, Any] = Depends(require_role("TEACHER"))
):
    """
    Generates a structured, inclusive, pedagogical problem set/assignment for educator review.
    Teacher can directly review, adjust parameters, and publish.
    """
    system_instruction = (
        "You are an expert inclusive computer science educator on the AccessEd platform.\n"
        "Generate a structured, accessible assignment or problem set on the requested topic.\n"
        "Respond ONLY with a valid JSON object without markdown fences, matching this exact schema:\n"
        "{\n"
        '  "title": "Clear, engaging assignment title",\n'
        '  "instructions": "Full detailed instructions formatted with clean markdown, including: 1. Overview, 2. Technical Requirements / Challenge, 3. Code Example / Starter Template, 4. Submission Instructions, 5. Grading Criteria",\n'
        '  "suggested_due_days": 7,\n'
        '  "max_score": 100\n'
        "}"
    )

    user_prompt = f"Topic: {req.topic}\nCourse: {req.course_title or 'Computer Science Curriculum'}\nDifficulty: {req.difficulty}"
    if req.additional_notes:
        user_prompt += f"\nAdditional Teacher Requirements: {req.additional_notes}"

    messages = [{"role": "user", "content": user_prompt}]
    result = await ai_orchestrator.get_response(messages=messages, system_prompt_override=system_instruction)
    
    parsed = None
    try:
        text = result["content"].strip()
        json_match = re.search(r"\{[\s\S]*\}", text)
        if json_match:
            parsed = json.loads(json_match.group(0))
    except Exception:
        pass

    if not parsed or not parsed.get("title") or not parsed.get("instructions"):
        topic_clean = req.topic.strip()
        parsed = {
            "title": f"Problem Set: {topic_clean}",
            "instructions": (
                f"### 🎯 Learning Objectives\n"
                f"- Demonstrate hands-on conceptual mastery of {topic_clean}.\n"
                f"- Apply accessible design and robust error-handling in your solution.\n\n"
                f"### 📋 Technical Challenge\n"
                f"Implement a well-structured Python solution addressing the core requirements of {topic_clean}.\n"
                f"Your solution must include:\n"
                f"1. A clean, modular function or class implementing the logic.\n"
                f"2. Comprehensive edge-case handling.\n"
                f"3. A concise written explanation (1-2 paragraphs) discussing your technical tradeoffs and time/space complexity.\n\n"
                f"### 💻 Starter Template\n"
                f"```python\n"
                f"# AccessEd Student Submission\n"
                f"# Topic: {topic_clean}\n\n"
                f"def solve_problem():\n"
                f"    # TODO: Implement your solution here\n"
                f"    pass\n\n"
                f"if __name__ == '__main__':\n"
                f"    print('Validating solution...')\n"
                f"```\n\n"
                f"### 📊 Evaluation Rubric (100 Points Total)\n"
                f"- **Correctness & Logic (50 pts)**: Solution accurately fulfills all requirements.\n"
                f"- **Code Quality & Readability (30 pts)**: PEP 8 compliant, clear variable naming, type hints.\n"
                f"- **Analysis & Tradeoffs (20 pts)**: Thorough conceptual explanation."
            ),
            "suggested_due_days": 7,
            "max_score": 100
        }

    return parsed

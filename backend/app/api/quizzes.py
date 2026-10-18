import uuid
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.models.schemas import QuizAttemptSubmit, QuizExplanationRequest
from app.repositories.store import data_store
from app.services.ai.orchestrator import ai_orchestrator
from app.core.security import get_current_user

router = APIRouter(prefix="/api/quizzes", tags=["Accessible Quizzes"])

class CreateQuizRequest(BaseModel):
    lesson_id: Optional[str] = None
    course_id: Optional[str] = None
    title: str
    description: Optional[str] = "Mastery Assessment"
    passing_score: Optional[int] = 70
    questions: List[Dict[str, Any]]

@router.get("")
async def list_quizzes(lesson_id: Optional[str] = None, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Returns accessible list of available quizzes.
    """
    quizzes_list = list(data_store.quizzes.values())
    if lesson_id:
        quizzes_list = [q for q in quizzes_list if str(q.get("lesson_id")) == str(lesson_id)]
    
    return [
        {
            "id": str(q["id"]),
            "lesson_id": str(q.get("lesson_id")) if q.get("lesson_id") else None,
            "title": q.get("title", "Mastery Quiz"),
            "description": q.get("description", ""),
            "passing_score": q.get("passing_score", 70),
            "total_questions": len(q.get("questions", [])),
            "created_at": q.get("created_at")
        }
        for q in quizzes_list
    ]

@router.post("")
async def create_quiz(req: CreateQuizRequest, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Persists AI-generated or educator-authored quiz directly into Supabase public.quizzes.
    Attaches to selected lesson or course section.
    """
    if not req.title or not req.title.strip():
        raise HTTPException(status_code=400, detail="Quiz title is required.")

    if not req.questions:
        raise HTTPException(status_code=400, detail="At least one question is required to create a quiz.")

    # Resolve target lesson_id
    target_lesson_id = req.lesson_id
    if not target_lesson_id and req.course_id:
        for les in data_store.lessons.values():
            if str(les.get("course_id")) == str(req.course_id):
                target_lesson_id = str(les["id"])
                break

    # If still not found, attach to first known lesson if available
    if not target_lesson_id and data_store.lessons:
        target_lesson_id = next(iter(data_store.lessons.keys()))

    quiz_id = str(uuid.uuid4())
    formatted_questions = []

    for idx, q in enumerate(req.questions):
        q_id = q.get("id") or f"q-{idx + 1}"
        q_text = q.get("question_text") or q.get("question") or f"Question {idx + 1}"
        raw_options = q.get("options") or []
        
        # Ensure options are formatted
        formatted_options = []
        for o_idx, opt in enumerate(raw_options):
            if isinstance(opt, dict):
                formatted_options.append(opt)
            else:
                formatted_options.append({
                    "id": f"opt-{o_idx + 1}",
                    "text": str(opt)
                })

        # Ensure correct_answer is a list
        raw_correct = q.get("correct_answer") or q.get("correct_options") or []
        if isinstance(raw_correct, (str, int)):
            # If numeric index was passed
            if isinstance(raw_correct, int) and 0 <= raw_correct < len(formatted_options):
                correct_list = [formatted_options[raw_correct]["id"]]
            else:
                correct_list = [str(raw_correct)]
        else:
            correct_list = [str(c) for c in raw_correct]

        if not correct_list and formatted_options:
            correct_list = [formatted_options[0]["id"]]

        formatted_questions.append({
            "id": str(q_id),
            "question_text": q_text,
            "question_type": q.get("question_type", "single_choice"),
            "options": formatted_options,
            "correct_answer": correct_list,
            "explanation": q.get("explanation", "Review the lesson material for this topic.")
        })

    quiz_record = {
        "id": quiz_id,
        "lesson_id": target_lesson_id,
        "title": req.title.strip(),
        "description": req.description or "AI-Assisted Diagnostic Assessment",
        "passing_score": req.passing_score or 70,
        "questions": formatted_questions
    }

    saved = data_store.save_quiz(quiz_record)
    return saved

@router.get("/{quiz_id}")
async def get_quiz(quiz_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    quiz = data_store.quizzes.get(quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Return questions without exposing answers ahead of submission
    safe_questions = [
        {
            "id": q["id"],
            "question_text": q["question_text"],
            "question_type": q["question_type"],
            "options": q["options"],
        }
        for q in quiz.get("questions", [])
    ]
    return {
        "id": quiz["id"],
        "lesson_id": quiz["lesson_id"],
        "title": quiz["title"],
        "description": quiz["description"],
        "passing_score": quiz["passing_score"],
        "total_questions": len(safe_questions),
        "questions": safe_questions
    }

@router.post("/{quiz_id}/attempt")
async def submit_quiz_attempt(
    quiz_id: str,
    attempt: QuizAttemptSubmit,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Submits quiz attempt, computes score, provides accessible feedback per question.
    """
    quiz = data_store.quizzes.get(quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions_map = {q["id"]: q for q in quiz.get("questions", [])}
    total_questions = len(questions_map)
    score = 0
    feedback_details = []

    for ans in attempt.answers:
        q = questions_map.get(ans.question_id)
        if not q:
            continue

        selected = set(ans.selected_options)
        correct = set(q.get("correct_answer", []))
        is_correct = (selected == correct)

        if is_correct:
            score += 1

        feedback_details.append({
            "question_id": q["id"],
            "question_text": q["question_text"],
            "selected_options": ans.selected_options,
            "correct_options": q["correct_answer"],
            "is_correct": is_correct,
            "explanation": q["explanation"]
        })

    percentage = round((score / max(total_questions, 1)) * 100, 1)
    is_passed = percentage >= quiz["passing_score"]

    attempt_record = {
        "id": str(uuid.uuid4()),
        "quiz_id": quiz_id,
        "student_id": user["id"],
        "score": score,
        "total_questions": total_questions,
        "percentage": percentage,
        "is_passed": is_passed,
        "feedback_details": feedback_details,
        "submitted_announcement": f"Quiz submitted. Your score is {score} out of {total_questions}. {'Mastery achieved.' if is_passed else 'Review suggested mistakes below.'}"
    }

    data_store.save_quiz_attempt(attempt_record)
    return attempt_record

@router.post("/explain-mistake")
async def explain_quiz_mistake(
    req: QuizExplanationRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Pedagogical AI Tutor explanation for a missed quiz question.
    """
    prompt = (
        f"A student took a quiz and answered a question incorrectly.\n"
        f"Question: {req.question_text}\n"
        f"Student's Answer: {req.student_answer}\n"
        f"Correct Answer: {req.correct_answer}\n"
        f"Teacher's Explanation: {req.explanation}\n\n"
        f"Explain kindly and clearly why the student's answer was incorrect, "
        f"why the correct answer is right, and provide a helpful memory anchor to prevent this confusion in future."
    )
    result = await ai_orchestrator.get_response(
        messages=[{"role": "user", "content": prompt}],
        action="quiz_mistake"
    )

    return {
        "explanation": result["content"],
        "provider": result["provider"]
    }

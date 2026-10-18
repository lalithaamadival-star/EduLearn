from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import logger
from app.api import (
    auth,
    students,
    teachers,
    courses,
    lessons,
    quizzes,
    assignments,
    ai,
    tts,
    speech,
    documents,
    progress,
    accessibility
)

import asyncio
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("AccessEd API engine online.")
    try:
        yield
    except (asyncio.CancelledError, KeyboardInterrupt):
        pass
    finally:
        logger.info("AccessEd API shutdown complete.")

app = FastAPI(
    title="AccessEd Inclusive Learning & Accessibility Ecosystem API",
    description="2026 World-Class Accessible Educational Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler: Sanitize errors to ensure user-safe messages
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled system error at {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "The AccessEd platform encountered an unexpected issue while processing your request.",
            "suggestion": "Please retry in a moment or continue using offline/accessible cached tools."
        }
    )

# Include API Routers
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(teachers.router)
app.include_router(courses.router)
app.include_router(lessons.router)
app.include_router(quizzes.router)
app.include_router(assignments.router)
app.include_router(ai.router)
app.include_router(tts.router)
app.include_router(speech.router)
app.include_router(documents.router)
app.include_router(progress.router)
app.include_router(accessibility.router)

@app.get("/health", tags=["System Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "AccessEd Backend",
        "version": "1.0.0",
        "primary_ai": settings.PRIMARY_AI_PROVIDER,
        "fallback_ai": settings.FALLBACK_AI_PROVIDER,
        "accessibility_engine": "active"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)

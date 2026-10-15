"""
Resume customization router.
Handles POST /api/customize and POST /api/customize/stream
"""
import logging
import time
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import settings
from app.models import CustomizeResponse, ErrorResponse
from app.services.llm_service import LLMService, LLMError, LLMRateLimitError, LLMResponseError
from app.services.resume_parser import ResumeParser, ResumeParserError
from app.services.prompt_engineer import PromptEngineer
from app.utils.file_validator import validate_file_content, FileValidationError

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# Singleton services
_resume_parser = ResumeParser()
_prompt_engineer = PromptEngineer()


def _get_llm_service() -> LLMService:
    """Get LLM service (lazy init to catch missing API key early)"""
    try:
        return LLMService()
    except ValueError as e:
        raise HTTPException(
            status_code=503,
            detail="AI service is not configured. Please contact support."
        )


@router.post(
    "/customize",
    response_model=CustomizeResponse,
    responses={
        400: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
    summary="Customize resume to match job description",
)
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def customize_resume(
    request: Request,
    file: UploadFile = File(..., description="Resume file (PDF or DOCX, max 10MB)"),
    job_description: str = Form(..., min_length=50, max_length=50000),
    sections: Optional[str] = Form(
        default=None,
        description="Comma-separated sections to customize: summary,skills,experience,education"
    ),
):
    """
    Customize a resume to match a job description using AI.
    
    - **file**: PDF or DOCX resume (max 10MB) OR
    - **resume_text**: Extracted or raw plain text resume (min 50 chars)
    - **job_description**: Full job description text (min 50 chars)
    - **sections**: Which sections to customize (optional, defaults to all)
    """
    start_time = time.time()
    logger.info(
        f"Customization request: file={file.filename}, "
        f"size={file.size}B, jd_len={len(job_description)}"
    )

    # 1. Validate and read file
    try:
        file_content = await file.read()
        validate_file_content(
            file_content,
            file.filename or "resume",
            settings.max_file_size_bytes,
        )
    except FileValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. Parse resume
    try:
        resume_text = _resume_parser.parse(file_content, file.filename or "resume")
    except ResumeParserError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 3. Parse sections
    section_list = None
    if sections:
        section_list = [s.strip().lower() for s in sections.split(",") if s.strip()]

    # 4. Build prompts
    system_prompt, user_prompt = _prompt_engineer.build_customize_prompt(
        job_description=job_description,
        resume_text=resume_text,
        sections=section_list,
    )

    # 5. Call LLM
    llm = _get_llm_service()
    try:
        result = await llm.customize_resume(
            resume_text=resume_text,
            job_description=job_description,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )
    except LLMRateLimitError:
        raise HTTPException(
            status_code=429,
            detail="AI service is temporarily busy. Please try again in a minute."
        )
    except LLMResponseError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except LLMError as e:
        logger.error(f"LLM error: {e}")
        raise HTTPException(
            status_code=503,
            detail="AI service is temporarily unavailable. Please try again."
        )

    elapsed = int((time.time() - start_time) * 1000)
    logger.info(f"Customization complete in {elapsed}ms, match_score={result.match_score}")
    
    return result


@router.post(
    "/customize/stream",
    summary="Customize resume with streaming response (SSE)",
)
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def customize_resume_stream(
    request: Request,
    file: UploadFile = File(...),
    job_description: str = Form(..., min_length=50, max_length=50000),
    sections: Optional[str] = Form(default=None),
):
    """
    Stream resume customization using Server-Sent Events.
    Returns real-time progress updates as the AI processes the request.
    """
    import json

    # Validate file
    try:
        file_content = await file.read()
        validate_file_content(file_content, file.filename or "resume", settings.max_file_size_bytes)
    except FileValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Parse resume
    try:
        resume_text = _resume_parser.parse(file_content, file.filename or "resume")
    except ResumeParserError as e:
        raise HTTPException(status_code=400, detail=str(e))

    section_list = None
    if sections:
        section_list = [s.strip().lower() for s in sections.split(",") if s.strip()]

    system_prompt, user_prompt = _prompt_engineer.build_customize_prompt(
        job_description=job_description,
        resume_text=resume_text,
        sections=section_list,
    )

    llm = _get_llm_service()

    async def event_stream():
        # Send initial status
        yield f"data: {json.dumps({'type': 'status', 'status': 'parsing', 'message': 'Parsing resume content...'})}\n\n"
        
        async for event in llm.stream_customize_resume(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        ):
            yield event

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )

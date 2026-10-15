"""ATS Score router"""
import logging
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import settings
from app.models import ATSScoreResponse
from app.services.llm_service import LLMService, LLMError, LLMResponseError
from app.services.resume_parser import ResumeParser, ResumeParserError
from app.services.prompt_engineer import PromptEngineer
from app.utils.file_validator import validate_file_content, FileValidationError

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

_resume_parser = ResumeParser()
_prompt_engineer = PromptEngineer()


@router.post(
    "/ats-score",
    response_model=ATSScoreResponse,
    summary="Get ATS compatibility score",
)
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def get_ats_score(
    request: Request,
    file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    job_description: str = Form(..., min_length=20),
):
    """Analyze resume ATS compatibility against a job description."""
    extracted_text = ""
    if resume_text and resume_text.strip():
        extracted_text = resume_text.strip()
    elif file is not None:
        try:
            file_content = await file.read()
            validate_file_content(file_content, file.filename or "resume", settings.max_file_size_bytes)
            extracted_text = _resume_parser.parse(file_content, file.filename or "resume")
        except FileValidationError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except ResumeParserError as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        raise HTTPException(
            status_code=400,
            detail="Either a resume file or resume_text must be provided.",
        )

    system_prompt, user_prompt = _prompt_engineer.build_ats_score_prompt(
        resume_text=extracted_text,
        job_description=job_description,
    )

    try:
        llm = LLMService()
        return await llm.get_ats_score(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )
    except (LLMError, LLMResponseError) as e:
        logger.error(f"ATS score error: {e}")
        raise HTTPException(status_code=503, detail=str(e))

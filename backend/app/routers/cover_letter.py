"""Cover letter generation router"""
import logging
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import settings
from app.models import CoverLetterResponse
from app.services.llm_service import LLMService, LLMError
from app.services.resume_parser import ResumeParser, ResumeParserError
from app.services.prompt_engineer import PromptEngineer
from app.utils.file_validator import validate_file_content, FileValidationError

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

_resume_parser = ResumeParser()
_prompt_engineer = PromptEngineer()


@router.post(
    "/cover-letter",
    response_model=CoverLetterResponse,
    summary="Generate a cover letter",
)
@limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def generate_cover_letter(
    request: Request,
    file: Optional[UploadFile] = File(None, description="Resume file (PDF or DOCX)"),
    resume_text: Optional[str] = Form(None, description="Resume text directly"),
    job_description: str = Form(..., min_length=20, max_length=50000),
    company_name: str = Form(default="", max_length=200),
):
    """Generate a tailored cover letter based on resume and job description."""
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

    system_prompt, user_prompt = _prompt_engineer.build_cover_letter_prompt(
        job_description=job_description,
        resume_text=extracted_text,
        company_name=company_name or None,
    )

    try:
        llm = LLMService()
        result = await llm.generate_cover_letter(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )
        return result
    except LLMError as e:
        logger.error(f"Cover letter generation error: {e}")
        raise HTTPException(status_code=503, detail=str(e))

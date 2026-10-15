"""
LLM Service — Google Gemini API integration with streaming support.
"""
import asyncio
import json
import logging
import time
from typing import AsyncGenerator, Optional

import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, ServiceUnavailable

from app.config import settings
from app.models import CustomizeResponse, CoverLetterResponse, ATSScoreResponse

logger = logging.getLogger(__name__)


class LLMError(Exception):
    """Base LLM error"""
    pass


class LLMRateLimitError(LLMError):
    """Rate limit exceeded"""
    pass


class LLMResponseError(LLMError):
    """Invalid or unparseable LLM response"""
    pass


class LLMService:
    """Google Gemini LLM service with model fallback cascade and retry logic"""

    # Cascade of models in priority order: first try active fast models, then fallbacks
    CANDIDATE_MODELS = [
        "gemini-flash-lite-latest",
        "gemini-3.8-flash",
        "gemini-flash-latest",
        "gemini-3.5-flash",
    ]

    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured")
        
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        self.generation_config = genai.GenerationConfig(
            temperature=settings.LLM_TEMPERATURE,
            max_output_tokens=settings.LLM_MAX_OUTPUT_TOKENS,
            response_mime_type="application/json",
        )
        
        # Build priority model list with user config first if specified
        models = [settings.GEMINI_MODEL] if settings.GEMINI_MODEL else []
        for m in self.CANDIDATE_MODELS:
            if m not in models:
                models.append(m)
        self.model_names = models
        self.last_used_model = self.model_names[0]

    async def customize_resume(
        self,
        resume_text: str,
        job_description: str,
        system_prompt: str,
        user_prompt: str,
    ) -> CustomizeResponse:
        """
        Call Gemini to customize a resume.
        
        Returns structured CustomizeResponse.
        """
        start_time = time.time()
        
        raw_response = await self._call_with_retry(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )
        
        elapsed_ms = int((time.time() - start_time) * 1000)
        
        try:
            data = json.loads(raw_response)
            if isinstance(data, dict):
                data["original_resume_text"] = resume_text
                data["processing_time_ms"] = elapsed_ms
                data["model_used"] = self.last_used_model
            response = CustomizeResponse.model_validate(data)
            return response
        except (json.JSONDecodeError, Exception) as e:
            logger.error(f"Failed to parse LLM response: {e}\nResponse: {raw_response[:500]}")
            raise LLMResponseError(
                "The AI returned an unexpected response format. Please try again."
            )

    async def stream_customize_resume(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> AsyncGenerator[str, None]:
        """
        Stream resume customization response as Server-Sent Events.
        
        Yields SSE-formatted strings.
        """
        yield self._sse("status", {"status": "analyzing", "message": "Analyzing job requirements..."})
        await asyncio.sleep(0.1)
        
        yield self._sse("status", {"status": "crafting", "message": "Crafting customized content..."})
        
        contents = self._build_contents(system_prompt, user_prompt)
        last_err = None

        for model_name in self.model_names:
            try:
                model = genai.GenerativeModel(
                    model_name=model_name,
                    generation_config=self.generation_config,
                )
                response_stream = await asyncio.to_thread(
                    lambda: model.generate_content(contents, stream=True)
                )
                
                accumulated_text = ""
                for chunk in response_stream:
                    if chunk.text:
                        accumulated_text += chunk.text
                        yield self._sse("chunk", {"text": chunk.text})
                
                # Parse final response
                try:
                    data = json.loads(accumulated_text)
                    yield self._sse("complete", {"status": "done", "result": data})
                    return
                except json.JSONDecodeError:
                    yield self._sse("error", {"message": "Failed to parse response"})
                    return
            except (ResourceExhausted, Exception) as e:
                logger.warning(f"Streaming model {model_name} failed: {e}. Trying next model...")
                last_err = e
                continue

        logger.error(f"All streaming models exhausted: {last_err}")
        yield self._sse("error", {"message": "AI service is currently at capacity. Please try again shortly."})

    async def generate_cover_letter(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> CoverLetterResponse:
        """Generate a cover letter with model fallback"""
        start_time = time.time()
        contents = self._build_contents(system_prompt, user_prompt)
        
        last_error = None
        for model_name in self.model_names:
            try:
                model = genai.GenerativeModel(
                    model_name=model_name,
                    generation_config=genai.GenerationConfig(
                        temperature=0.5,
                        max_output_tokens=2048,
                    ),
                )
                response = await asyncio.to_thread(
                    lambda: model.generate_content(contents)
                )
                cover_letter_text = response.text.strip()
                elapsed_ms = int((time.time() - start_time) * 1000)
                return CoverLetterResponse(
                    cover_letter=cover_letter_text,
                    word_count=len(cover_letter_text.split()),
                    processing_time_ms=elapsed_ms,
                )
            except Exception as e:
                logger.warning(f"Cover letter model {model_name} failed: {e}. Trying next...")
                last_error = e
                continue

        raise LLMError(f"Failed to generate cover letter: {last_error}")

    async def get_ats_score(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> ATSScoreResponse:
        """Analyze ATS score"""
        raw = await self._call_with_retry(system_prompt=system_prompt, user_prompt=user_prompt)
        
        try:
            data = json.loads(raw)
            return ATSScoreResponse.model_validate(data)
        except Exception as e:
            logger.error(f"ATS score parsing failed: {e}")
            raise LLMResponseError("Failed to parse ATS score response")

    async def _call_with_retry(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> str:
        """
        Call Gemini API with automatic model cascade fallback.
        Tries primary model, then falls back to remaining models if rate-limited.
        Returns response_text.
        """
        contents = self._build_contents(system_prompt, user_prompt)
        last_error = None

        for model_name in self.model_names:
            logger.info(f"Attempting LLM call with model: {model_name}")
            model = genai.GenerativeModel(
                model_name=model_name,
                generation_config=self.generation_config,
            )

            for attempt in range(settings.LLM_MAX_RETRIES):
                try:
                    response = await asyncio.wait_for(
                        asyncio.to_thread(lambda: model.generate_content(contents)),
                        timeout=settings.LLM_TIMEOUT_SECONDS,
                    )
                    self.last_used_model = model_name
                    logger.info(f"LLM call succeeded with {model_name}")
                    return response.text

                except ResourceExhausted as e:
                    # Model quota exhausted, switch to next model immediately
                    logger.warning(f"Model {model_name} quota exceeded (ResourceExhausted). Switching to next model...")
                    last_error = LLMRateLimitError(str(e))
                    break  # Break retry loop for this model, try next model in cascade

                except (ServiceUnavailable, asyncio.TimeoutError) as e:
                    logger.warning(f"Model {model_name} attempt {attempt+1} transient error: {e}")
                    last_error = LLMError(str(e))
                    await asyncio.sleep(1)

                except Exception as e:
                    err_msg = str(e)
                    if "404" in err_msg or "not available" in err_msg.lower():
                        logger.warning(f"Model {model_name} not available: {err_msg}. Switching to next model...")
                        break
                    logger.error(f"Model {model_name} unexpected error: {e}")
                    last_error = LLMError(f"AI service error: {str(e)}")
                    if attempt < settings.LLM_MAX_RETRIES - 1:
                        await asyncio.sleep(1)

        raise last_error or LLMError("All AI models in cascade exhausted. Please try again shortly.")

    def _build_contents(self, system_prompt: str, user_prompt: str) -> list:
        """Build Gemini API contents list"""
        return [
            {"role": "user", "parts": [f"{system_prompt}\n\n{user_prompt}"]},
        ]

    @staticmethod
    def _sse(event_type: str, data: dict) -> str:
        """Format a Server-Sent Event"""
        return f"data: {json.dumps({'type': event_type, **data})}\n\n"

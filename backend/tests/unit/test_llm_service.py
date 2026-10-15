"""Unit tests for LLMService with mocked Google Gemini API"""
import json
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from app.services.llm_service import (
    LLMService,
    LLMError,
    LLMRateLimitError,
    LLMResponseError,
)
from app.models import CustomizeResponse


class TestLLMService:
    @patch("app.services.llm_service.genai")
    def test_init_raises_without_api_key(self, mock_genai):
        """Should raise ValueError if GEMINI_API_KEY is not set"""
        with patch("app.services.llm_service.settings.GEMINI_API_KEY", ""):
            with pytest.raises(ValueError, match="GEMINI_API_KEY is not configured"):
                LLMService()

    @patch("app.services.llm_service.genai")
    def test_sse_formatting(self, mock_genai):
        """Should correctly format Server-Sent Events"""
        with patch("app.services.llm_service.settings.GEMINI_API_KEY", "test-key"):
            service = LLMService()
            sse_str = service._sse("test_event", {"data": "hello"})
            assert sse_str.startswith("data: ")
            assert sse_str.endswith("\n\n")
            parsed = json.loads(sse_str.replace("data: ", "").strip())
            assert parsed["type"] == "test_event"
            assert parsed["data"] == "hello"

    @patch("app.services.llm_service.genai")
    def test_build_contents(self, mock_genai):
        """Should format Gemini API user content parts"""
        with patch("app.services.llm_service.settings.GEMINI_API_KEY", "test-key"):
            service = LLMService()
            contents = service._build_contents("system prompt", "user prompt")
            assert len(contents) == 1
            assert "system prompt" in contents[0]["parts"][0]
            assert "user prompt" in contents[0]["parts"][0]

    @pytest.mark.asyncio
    @patch("app.services.llm_service.genai")
    async def test_customize_resume_success(self, mock_genai):
        """Should successfully parse and return CustomizeResponse from Gemini"""
        mock_response_data = {
            "customized_resume": {
                "summary": "Tailored summary",
                "skills": ["Python", "FastAPI"],
                "experience": [],
                "education": [],
                "certifications": [],
                "projects": []
            },
            "original_resume_text": "",
            "match_score": 85,
            "ats_score": 90,
            "missing_keywords": ["Docker"],
            "changes_made": [
                {"section": "summary", "description": "Rewritten", "impact": "improved"}
            ]
        }

        with patch("app.services.llm_service.settings.GEMINI_API_KEY", "test-key"):
            service = LLMService()
            with patch.object(service, "_call_with_retry", return_value=json.dumps(mock_response_data)):
                result = await service.customize_resume(
                    resume_text="Original text",
                    job_description="JD text",
                    system_prompt="sys",
                    user_prompt="usr",
                )
                assert isinstance(result, CustomizeResponse)
                assert result.match_score == 85
                assert result.ats_score == 90
                assert result.original_resume_text == "Original text"

    @pytest.mark.asyncio
    @patch("app.services.llm_service.genai")
    async def test_customize_resume_invalid_json_raises_error(self, mock_genai):
        """Should raise LLMResponseError when LLM returns invalid JSON"""
        with patch("app.services.llm_service.settings.GEMINI_API_KEY", "test-key"):
            service = LLMService()
            with patch.object(service, "_call_with_retry", return_value="Not valid JSON"):
                with pytest.raises(LLMResponseError):
                    await service.customize_resume(
                        resume_text="Original text",
                        job_description="JD text",
                        system_prompt="sys",
                        user_prompt="usr",
                    )

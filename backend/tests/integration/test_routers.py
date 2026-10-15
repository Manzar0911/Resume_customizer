"""Integration tests for FastAPI endpoints"""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from app.models import CoverLetterResponse, ATSScoreResponse


class TestHealthAndRootEndpoints:
    def test_health_check(self, client):
        """GET /health should return 200 and healthy status"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data

    def test_root_endpoint(self, client):
        """GET / should return 200 and API info"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "Resume Customizer API" in data["message"]


class TestCustomizeEndpoint:
    @patch("app.routers.customize._resume_parser.parse")
    @patch("app.routers.customize._get_llm_service")
    def test_customize_success(
        self,
        mock_get_llm,
        mock_parse,
        client,
        sample_pdf_bytes,
        sample_job_description,
        mock_customize_response,
    ):
        """POST /api/customize with valid inputs returns tailored resume"""
        mock_parse.return_value = "Extracted valid resume text for tests with more than 100 characters..."
        mock_llm_instance = MagicMock()
        mock_llm_instance.customize_resume = AsyncMock(return_value=mock_customize_response)
        mock_get_llm.return_value = mock_llm_instance

        files = {"file": ("resume.pdf", sample_pdf_bytes, "application/pdf")}
        data = {
            "job_description": sample_job_description,
            "sections": "summary,skills,experience",
        }

        response = client.post("/api/customize", files=files, data=data)
        assert response.status_code == 200
        result = response.json()
        assert "customized_resume" in result
        assert result["match_score"] == 88
        assert result["ats_score"] == 92
        assert len(result["missing_keywords"]) > 0

    def test_customize_missing_file(self, client, sample_job_description):
        """POST /api/customize without file should return 422"""
        response = client.post("/api/customize", data={"job_description": sample_job_description})
        assert response.status_code == 422

    def test_customize_short_job_description(self, client, sample_pdf_bytes):
        """POST /api/customize with too short job description should return 422"""
        files = {"file": ("resume.pdf", sample_pdf_bytes, "application/pdf")}
        response = client.post("/api/customize", files=files, data={"job_description": "too short"})
        assert response.status_code == 422

    def test_customize_invalid_file_extension(self, client, sample_job_description):
        """POST /api/customize with .txt file should return 400"""
        files = {"file": ("resume.txt", b"plain text content", "text/plain")}
        response = client.post("/api/customize", files=files, data={"job_description": sample_job_description})
        assert response.status_code == 400
        assert "Only PDF and DOCX" in response.json()["detail"]


class TestCoverLetterEndpoint:
    @patch("app.routers.cover_letter.LLMService")
    def test_cover_letter_with_text(self, mock_llm_class, client, sample_job_description):
        """POST /api/cover-letter with resume_text directly should return 200"""
        mock_instance = mock_llm_class.return_value
        mock_instance.generate_cover_letter = AsyncMock(
            return_value=CoverLetterResponse(
                cover_letter="Dear Hiring Manager, I am thrilled to apply for the Senior Engineer role...",
                word_count=320,
                processing_time_ms=1100,
            )
        )

        data = {
            "resume_text": "Alex Morgan Software Engineer with experience in Python and React",
            "job_description": sample_job_description,
            "company_name": "Acme Inc",
        }
        response = client.post("/api/cover-letter", data=data)
        assert response.status_code == 200
        res = response.json()
        assert "cover_letter" in res
        assert res["word_count"] == 320

    def test_cover_letter_missing_sources(self, client, sample_job_description):
        """POST /api/cover-letter without file or resume_text should return 400"""
        data = {"job_description": sample_job_description}
        response = client.post("/api/cover-letter", data=data)
        assert response.status_code == 400


class TestATSScoreEndpoint:
    @patch("app.routers.ats_score.LLMService")
    def test_ats_score_with_text(self, mock_llm_class, client, sample_job_description):
        """POST /api/ats-score with resume_text should return 200"""
        mock_instance = mock_llm_class.return_value
        mock_instance.get_ats_score = AsyncMock(
            return_value=ATSScoreResponse(
                ats_score=90,
                keyword_match_rate=85,
                formatting_score=95,
                readability_score=90,
                suggestions=["Add more quantitative metrics"],
                matched_keywords=["Python", "FastAPI", "React"],
                missing_keywords=["Kubernetes"],
            )
        )

        data = {
            "resume_text": "Alex Morgan Software Engineer with extensive experience in Python and FastAPI",
            "job_description": sample_job_description,
        }
        response = client.post("/api/ats-score", data=data)
        assert response.status_code == 200
        res = response.json()
        assert res["ats_score"] == 90
        assert res["keyword_match_rate"] == 85

"""Shared pytest fixtures for Resume Customizer backend tests"""
import io
import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.models import (
    CustomizeResponse,
    CustomizedResumeData,
    CoverLetterResponse,
    ATSScoreResponse,
    ChangeEntry,
)


@pytest.fixture
def client():
    """FastAPI TestClient fixture"""
    return TestClient(app)


@pytest.fixture
def sample_job_description():
    """Valid realistic job description"""
    return """
    Senior Full Stack Engineer (Python & React)
    
    About the Role:
    We are looking for an experienced Senior Full Stack Engineer with strong proficiency in
    Python (FastAPI, Django), React, Next.js, and TypeScript.
    
    Responsibilities:
    - Architect and build scalable backend REST APIs using FastAPI and Python
    - Develop modern, responsive frontend user interfaces using Next.js and TypeScript
    - Integrate LLMs and generative AI capabilities (Google Gemini, OpenAI) into user workflows
    - Collaborate with cross-functional teams to deliver high quality features
    - Implement rigorous testing and security best practices
    
    Requirements:
    - 4+ years experience with Python and web frameworks
    - 3+ years experience with React and TypeScript
    - Experience with Docker, cloud deployments (Render, Vercel, AWS)
    - Strong problem-solving and communication skills
    """


@pytest.fixture
def sample_resume_text():
    """Valid realistic raw resume text"""
    return """
    ALEX MORGAN
    alex.morgan@example.com | (555) 019-2834 | San Francisco, CA | linkedin.com/in/alexmorgan | github.com/alexmorgan
    
    PROFESSIONAL SUMMARY
    Dedicated Software Engineer with 4 years of experience building modern web applications and APIs. Skilled in Python, TypeScript, and cloud services.
    
    SKILLS
    Languages: Python, JavaScript, TypeScript, SQL, HTML/CSS
    Frameworks: FastAPI, Django, React, Next.js, Node.js
    Tools & Cloud: Git, Docker, PostgreSQL, Redis, AWS
    
    EXPERIENCE
    Software Engineer | Nova Tech Solutions | 2022 - Present
    - Developed backend REST endpoints using FastAPI and PostgreSQL handling 50k daily active users
    - Built responsive frontend dashboards using React and TypeScript
    - Reduced API response times by 35% through query optimization and Redis caching
    - Implemented automated CI/CD pipelines with GitHub Actions
    
    Junior Developer | Orbit Innovations | 2020 - 2022
    - Maintained legacy Python codebase and migrated monolithic components to modular microservices
    - Collaborated with UX designers to implement accessible web pages
    - Wrote comprehensive unit and integration tests achieving 85% code coverage
    
    EDUCATION
    B.S. in Computer Science | University of California, Berkeley | 2020
    
    PROJECTS
    AI Code Reviewer: Built an automated tool integrating LLM APIs for automated PR feedback using Python and FastAPI
    """


@pytest.fixture
def sample_pdf_bytes():
    """Generates a minimal valid PDF byte sequence with PyMuPDF or pure PDF format"""
    content = (
        b"%PDF-1.4\n"
        b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
        b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n"
        b"4 0 obj<</Length 55>>stream\n"
        b"BT /F1 12 Tf 72 712 Td (Alex Morgan Software Engineer Resume Content) Tj ET\n"
        b"endstream\n"
        b"endobj\n"
        b"xref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000056 00000 n \n0000000111 00000 n \n0000000212 00000 n \n"
        b"trailer<</Size 5/Root 1 0 R>>\nstartxref\n317\n%%EOF\n"
    )
    return content


@pytest.fixture
def mock_customize_response():
    """Mock structured CustomizeResponse matching schema"""
    return CustomizeResponse(
        customized_resume=CustomizedResumeData(
            summary="Senior Full Stack Engineer with 4+ years of expertise in Python (FastAPI), React, and Next.js, specializing in building high-performance scalable systems.",
            skills=["Python", "FastAPI", "React", "Next.js", "TypeScript", "Docker", "PostgreSQL", "Google Gemini"],
            experience=[
                {
                    "company": "Nova Tech Solutions",
                    "role": "Senior Full Stack Engineer",
                    "duration": "2022 - Present",
                    "bullets": [
                        "Architected scalable backend REST APIs using FastAPI and PostgreSQL handling 50k+ daily users",
                        "Engineered modern responsive interfaces with React, Next.js, and TypeScript",
                        "Optimized database performance and implemented Redis caching to cut latency by 35%"
                    ]
                }
            ],
            education=[
                {
                    "institution": "University of California, Berkeley",
                    "degree": "B.S. in Computer Science",
                    "year": "2020",
                    "gpa": "3.8"
                }
            ],
            certifications=["AWS Certified Solutions Architect"],
            projects=[
                {
                    "name": "AI Code Assistant",
                    "description": "Integrated LLMs (Gemini API) into dev workflows for real-time automated code suggestions",
                    "technologies": ["Python", "FastAPI", "React", "Gemini API"]
                }
            ]
        ),
        original_resume_text="Original resume raw text...",
        match_score=88,
        ats_score=92,
        missing_keywords=["Docker", "Cloud Deployments", "Vercel"],
        changes_made=[
            ChangeEntry(section="summary", description="Aligned summary with Senior Full Stack requirements", impact="improved"),
            ChangeEntry(section="experience", description="Emphasized FastAPI and Next.js accomplishments", impact="improved")
        ],
        processing_time_ms=1250,
        model_used="gemini-1.5-pro-latest"
    )

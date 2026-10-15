"""Pydantic request and response models"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, field_validator, Field


# ─── Request Models ─────────────────────────────────────────────────────────

class CustomizeSections(BaseModel):
    """Sections to customize"""
    summary: bool = True
    skills: bool = True
    experience: bool = True
    education: bool = False


# ─── Response Models ─────────────────────────────────────────────────────────

class ContactInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None


class ExperienceEntry(BaseModel):
    company: str = ""
    role: str = ""
    duration: str = ""
    bullets: List[str] = []


class EducationEntry(BaseModel):
    institution: str = ""
    degree: str = ""
    year: str = ""
    gpa: Optional[str] = None


class CustomizedResumeData(BaseModel):
    contact: Optional[ContactInfo] = None
    summary: str = ""
    skills: List[str] = []
    experience: List[ExperienceEntry] = []
    education: List[EducationEntry] = []
    certifications: List[str] = []
    projects: List[Dict[str, Any]] = []


class ChangeEntry(BaseModel):
    section: str
    description: str
    impact: str  # "improved", "added", "rephrased", "reordered"


class CustomizeResponse(BaseModel):
    """Full response from resume customization"""
    model_config = {"protected_namespaces": ()}

    customized_resume: CustomizedResumeData
    original_resume_text: str = ""
    match_score: int = Field(ge=0, le=100)
    ats_score: int = Field(ge=0, le=100)
    missing_keywords: List[str] = []
    changes_made: List[ChangeEntry] = []
    processing_time_ms: int = 0
    model_used: str = ""


class CoverLetterResponse(BaseModel):
    """Cover letter generation response"""
    cover_letter: str
    word_count: int
    processing_time_ms: int = 0


class ATSScoreResponse(BaseModel):
    """ATS score analysis response"""
    ats_score: int = Field(ge=0, le=100)
    keyword_match_rate: float
    formatting_score: int
    readability_score: int
    suggestions: List[str] = []
    matched_keywords: List[str] = []
    missing_keywords: List[str] = []


class ErrorResponse(BaseModel):
    """Standard error response"""
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None

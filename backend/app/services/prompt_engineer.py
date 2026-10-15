"""
Prompt engineering service.
Builds and manages prompts for LLM calls.
"""
import re
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

# Common prompt injection patterns to sanitize
INJECTION_PATTERNS = [
    r"ignore\s+(?:all\s+)?(?:previous|above|prior)\s+instructions?",
    r"disregard\s+(?:all\s+)?(?:previous|above|prior)\s+instructions?",
    r"forget\s+(?:all\s+)?(?:previous|above|prior)\s+instructions?",
    r"you\s+are\s+now\s+(?:a|an)",
    r"new\s+instructions?\s*:",
    r"override\s+(?:system|all)",
    r"jailbreak",
    r"DAN\s+mode",
    r"<\|.*?\|>",           # Special tokens
    r"\[INST\]",            # Llama instruction tokens
    r"<<SYS>>",             # System prompt tokens
]

SYSTEM_PROMPT = """You are an expert resume consultant and ATS (Applicant Tracking System) optimization specialist. 
Your sole task is to customize the provided resume to better match the given job description.

CRITICAL RULES:
1. Only modify the resume content — never add fabricated experiences, companies, degrees, or credentials
2. Preserve all factual information (dates, company names, education institutions)
3. Enhance phrasing, ordering, and keyword alignment — but never invent facts
4. Return ONLY valid JSON matching the specified schema — no markdown, no explanations
5. Be professional, concise, and ATS-friendly
"""


def sanitize_user_input(text: str) -> str:
    """
    Remove common prompt injection patterns from user input.
    
    Args:
        text: Raw user input text
        
    Returns:
        Sanitized text with injection patterns replaced
    """
    for pattern in INJECTION_PATTERNS:
        text = re.sub(pattern, "[CONTENT REMOVED]", text, flags=re.IGNORECASE)
    return text


def truncate_text(text: str, max_chars: int) -> str:
    """Safely truncate text to max_chars with ellipsis"""
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "\n...[content truncated for length]"


class PromptEngineer:
    """Builds prompts for all LLM operations"""

    # Character limits for context window management
    MAX_JD_CHARS = 15000
    MAX_RESUME_CHARS = 15000

    def build_customize_prompt(
        self,
        job_description: str,
        resume_text: str,
        sections: Optional[List[str]] = None,
    ) -> tuple[str, str]:
        """
        Build system + user prompts for resume customization.
        
        Returns:
            Tuple of (system_prompt, user_prompt)
        """
        # Sanitize inputs
        clean_jd = sanitize_user_input(job_description)
        clean_resume = sanitize_user_input(resume_text)
        
        # Truncate to fit context window
        clean_jd = truncate_text(clean_jd, self.MAX_JD_CHARS)
        clean_resume = truncate_text(clean_resume, self.MAX_RESUME_CHARS)
        
        # Build section instructions
        if sections is None:
            sections = ["summary", "skills", "experience"]
        
        section_instructions = self._build_section_instructions(sections)
        
        user_prompt = f"""
=== JOB DESCRIPTION ===
{clean_jd}
=== END JOB DESCRIPTION ===

=== ORIGINAL RESUME ===
{clean_resume}
=== END ORIGINAL RESUME ===

=== CUSTOMIZATION INSTRUCTIONS ===
{section_instructions}

=== OUTPUT FORMAT ===
Return ONLY this JSON structure (no markdown fences, no extra text):
{{
  "customized_resume": {{
    "contact": {{
      "name": "string or null",
      "email": "string or null",
      "phone": "string or null",
      "location": "string or null",
      "linkedin": "string or null",
      "github": "string or null",
      "website": "string or null"
    }},
    "summary": "string - rewritten professional summary aligned to JD",
    "skills": ["skill1", "skill2", "...list all relevant skills"],
    "experience": [
      {{
        "company": "string",
        "role": "string",
        "duration": "string",
        "bullets": ["bullet1", "bullet2", "..."]
      }}
    ],
    "education": [
      {{
        "institution": "string",
        "degree": "string",
        "year": "string",
        "gpa": "string or null"
      }}
    ],
    "certifications": ["cert1", "cert2"],
    "projects": [
      {{
        "name": "string",
        "description": "string",
        "technologies": ["tech1"]
      }}
    ]
  }},
  "match_score": 85,
  "ats_score": 78,
  "missing_keywords": ["keyword1", "keyword2"],
  "changes_made": [
    {{
      "section": "summary",
      "description": "Rewrote summary to highlight Python and FastAPI experience",
      "impact": "improved"
    }}
  ]
}}
"""
        return SYSTEM_PROMPT, user_prompt

    def _build_section_instructions(self, sections: List[str]) -> str:
        """Build instructions for specific sections"""
        instructions = []
        
        if "summary" in sections:
            instructions.append(
                "SUMMARY: Rewrite the professional summary/objective to directly address "
                "the key requirements and keywords in the JD. Keep it 3-4 sentences max."
            )
        
        if "skills" in sections:
            instructions.append(
                "SKILLS: Reorder skills to prioritize those mentioned in the JD. "
                "Add relevant skills from the JD that the candidate likely has based "
                "on their experience (but do NOT fabricate skills they clearly don't have)."
            )
        
        if "experience" in sections:
            instructions.append(
                "EXPERIENCE: Rephrase bullet points to incorporate JD keywords naturally. "
                "Reorder bullets to lead with the most JD-relevant accomplishments. "
                "Quantify achievements where possible. Never change company names, dates, or roles."
            )
        
        if "education" in sections:
            instructions.append(
                "EDUCATION: Highlight relevant coursework or projects if they align with the JD."
            )
        
        instructions.append(
            "MATCH SCORE: Calculate 0-100 based on keyword overlap, skills alignment, "
            "and experience relevance to the JD."
        )
        instructions.append(
            "ATS SCORE: Estimate 0-100 based on keyword density, formatting clarity, "
            "and absence of ATS-breaking elements."
        )
        instructions.append(
            "MISSING KEYWORDS: List important JD keywords not present in the original resume."
        )
        
        return "\n".join(f"{i+1}. {inst}" for i, inst in enumerate(instructions))

    def build_cover_letter_prompt(
        self,
        job_description: str,
        resume_text: str,
        company_name: Optional[str] = None,
    ) -> tuple[str, str]:
        """Build prompts for cover letter generation"""
        clean_jd = sanitize_user_input(truncate_text(job_description, self.MAX_JD_CHARS))
        clean_resume = sanitize_user_input(truncate_text(resume_text, self.MAX_RESUME_CHARS))
        
        company = company_name or "the company"
        
        system = """You are an expert career coach specializing in writing compelling cover letters.
Write professional, personalized cover letters that highlight the candidate's most relevant 
achievements for the specific role. Never fabricate details."""
        
        user = f"""Write a professional cover letter for {company} based on:

=== JOB DESCRIPTION ===
{clean_jd}
=== END ===

=== CANDIDATE'S RESUME ===
{clean_resume}
=== END ===

Requirements:
- 3-4 paragraphs, ~300-400 words
- Opening: Express genuine interest, mention the role
- Middle: Highlight 2-3 most relevant achievements with specifics
- Closing: Call to action, enthusiasm
- Professional but personable tone
- No "I am writing to apply" clichés

Return ONLY the cover letter text, no JSON, no extra commentary.
"""
        return system, user

    def build_ats_score_prompt(
        self, resume_text: str, job_description: str
    ) -> tuple[str, str]:
        """Build prompts for ATS score analysis"""
        system = """You are an ATS (Applicant Tracking System) expert. 
Analyze resumes for ATS compatibility and keyword matching."""
        
        user = f"""Analyze this resume for ATS compatibility against the job description.

=== JOB DESCRIPTION ===
{truncate_text(job_description, 8000)}
=== END ===

=== RESUME ===
{truncate_text(resume_text, 8000)}
=== END ===

Return ONLY this JSON:
{{
  "ats_score": 75,
  "keyword_match_rate": 0.65,
  "formatting_score": 85,
  "readability_score": 80,
  "matched_keywords": ["Python", "FastAPI"],
  "missing_keywords": ["Docker", "Kubernetes"],
  "suggestions": [
    "Add Docker to your skills section",
    "Include more quantified achievements"
  ]
}}
"""
        return system, user

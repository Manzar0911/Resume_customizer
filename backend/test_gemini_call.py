import os
import asyncio

# Point model to working gemini-flash-lite-latest
os.environ["GEMINI_MODEL"] = "gemini-flash-lite-latest"
os.environ["GEMINI_FLASH_MODEL"] = "gemini-flash-lite-latest"

from app.config import get_settings
get_settings.cache_clear()

from app.services.llm_service import LLMService

async def main():
    service = LLMService()
    sys_prompt = "You are an ATS resume optimizer. Always output valid JSON matching the schema."
    user_prompt = """Return valid JSON with exactly this structure:
    {
      "customized_resume": {
        "summary": "Proven Full Stack Engineer",
        "skills": ["Python", "FastAPI", "React", "TypeScript"],
        "experience": [],
        "education": [],
        "certifications": [],
        "projects": []
      },
      "match_score": 92,
      "ats_score": 95,
      "missing_keywords": ["Kubernetes"],
      "changes_made": [
        {"section": "skills", "description": "Added FastAPI and TypeScript", "impact": "improved"}
      ]
    }"""
    
    print("Sending request to LLMService...")
    res = await service.customize_resume("Raw resume text", "Target job description", sys_prompt, user_prompt)
    print("SUCCESS!")
    print("Match Score:", res.match_score)
    print("ATS Score:", res.ats_score)
    print("Customized Summary:", res.customized_resume.summary)
    print("Model Used:", res.model_used)

if __name__ == "__main__":
    asyncio.run(main())

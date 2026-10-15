"""
Resume Customizer Backend — FastAPI Application Entry Point
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.routers import customize, cover_letter, ats_score
from app.middleware.error_handler import register_exception_handlers
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.utils.logger import setup_logging

setup_logging()
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown events"""
    logger.info("🚀 Resume Customizer API starting up...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"LLM Model: {settings.GEMINI_MODEL}")
    yield
    logger.info("👋 Resume Customizer API shutting down...")


app = FastAPI(
    title="Resume Customizer API",
    description="AI-powered resume customization using Google Gemini",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT != "production" else settings.allowed_origins_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,
)

# Security headers
app.add_middleware(SecurityHeadersMiddleware)

# Register exception handlers
register_exception_handlers(app)

# Routers
app.include_router(customize.router, prefix="/api", tags=["Customize"])
app.include_router(cover_letter.router, prefix="/api", tags=["Cover Letter"])
app.include_router(ats_score.router, prefix="/api", tags=["ATS Score"])


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Resume Customizer API",
        "docs": "/docs",
        "health": "/health",
    }

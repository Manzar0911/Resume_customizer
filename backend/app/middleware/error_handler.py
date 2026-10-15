"""Global exception handlers"""
import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    """Register all global exception handlers"""

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = exc.errors()
        # Format pydantic errors into human-readable messages
        messages = []
        for error in errors:
            field = " -> ".join(str(loc) for loc in error["loc"])
            messages.append(f"{field}: {error['msg']}")
        
        return JSONResponse(
            status_code=422,
            content={
                "error": "Validation Error",
                "detail": "; ".join(messages),
                "code": "VALIDATION_ERROR",
            },
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail,
                "detail": exc.detail,
                "code": f"HTTP_{exc.status_code}",
            },
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "error": "An unexpected error occurred. Please try again.",
                "code": "INTERNAL_ERROR",
            },
        )

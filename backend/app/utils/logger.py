"""Structured logging setup"""
import logging
import sys
from app.config import settings


def setup_logging() -> None:
    """Configure application logging"""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
    )
    
    # Reduce noise from third-party libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("google").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)

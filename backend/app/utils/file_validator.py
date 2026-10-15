"""File validation utilities"""
import logging
from pathlib import Path
from typing import Set

logger = logging.getLogger(__name__)

# Allowed MIME types
ALLOWED_MIME_TYPES: Set[str] = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

# Extension to MIME mapping
EXTENSION_MIME_MAP = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

# PDF magic bytes
PDF_MAGIC = b"%PDF-"
# DOCX magic bytes (it's a ZIP file)
ZIP_MAGIC = b"PK\x03\x04"


class FileValidationError(ValueError):
    pass


def validate_file_content(content: bytes, filename: str, max_size_bytes: int = 10 * 1024 * 1024) -> None:
    """
    Comprehensive file validation:
    1. Extension check
    2. Size check
    3. Magic bytes validation
    4. Extension/content consistency check

    Raises FileValidationError on any failure.
    """
    # 1. Extension check
    ext = Path(filename).suffix.lower()
    if ext not in EXTENSION_MIME_MAP:
        raise FileValidationError(
            f"Invalid file extension '{ext}'. Only PDF and DOCX files are accepted."
        )

    # 2. Size check
    if len(content) > max_size_bytes:
        max_mb = max_size_bytes // (1024 * 1024)
        raise FileValidationError(
            f"File is too large. Maximum allowed size is {max_mb}MB."
        )

    if len(content) < 4:
        raise FileValidationError("File is too small or empty.")

    # 3. Magic bytes validation
    if ext == ".pdf":
        if PDF_MAGIC not in content[:1024]:
            raise FileValidationError(
                "File does not appear to be a valid PDF. "
                "Extension and content do not match."
            )

    elif ext == ".docx":
        if ZIP_MAGIC not in content[:100]:
            raise FileValidationError(
                "File does not appear to be a valid DOCX. "
                "Extension and content do not match."
            )
        # Additional DOCX check: should contain [Content_Types].xml
        if b"[Content_Types].xml" not in content[:5000]:
            raise FileValidationError(
                "File does not appear to be a valid DOCX document."
            )

    logger.debug(f"File validation passed: {filename} ({len(content)} bytes)")

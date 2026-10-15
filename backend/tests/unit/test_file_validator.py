"""Unit tests for file validator utility"""
import pytest
from app.utils.file_validator import (
    validate_file_content,
    FileValidationError,
    PDF_MAGIC,
    ZIP_MAGIC,
)


class TestFileValidator:
    def test_valid_pdf_content(self, sample_pdf_bytes):
        """Should succeed on valid PDF content"""
        # Should not raise any error
        validate_file_content(sample_pdf_bytes, "resume.pdf")

    def test_invalid_extension_raises_error(self):
        """Should reject unsupported extensions"""
        with pytest.raises(FileValidationError, match="Invalid file extension"):
            validate_file_content(b"%PDF-test", "resume.txt")

        with pytest.raises(FileValidationError, match="Invalid file extension"):
            validate_file_content(b"%PDF-test", "resume.exe")

    def test_mismatched_pdf_magic_bytes(self):
        """Should detect extension spoofing where filename is .pdf but content is not PDF"""
        fake_pdf = b"Hello, I am a plain text file pretending to be PDF"
        with pytest.raises(FileValidationError, match="Extension and content do not match"):
            validate_file_content(fake_pdf, "fake.pdf")

    def test_mismatched_docx_magic_bytes(self):
        """Should detect extension spoofing for docx"""
        fake_docx = b"Not a zip file at all"
        with pytest.raises(FileValidationError, match="Extension and content do not match"):
            validate_file_content(fake_docx, "fake.docx")

    def test_empty_or_too_small_file(self):
        """Should reject files smaller than 4 bytes"""
        with pytest.raises(FileValidationError, match="too small or empty"):
            validate_file_content(b"12", "resume.pdf")

    def test_oversized_file(self):
        """Should reject files exceeding max_size_bytes"""
        max_bytes = 1024
        oversized_content = PDF_MAGIC + b"X" * 2000
        with pytest.raises(FileValidationError, match="too large"):
            validate_file_content(oversized_content, "large.pdf", max_size_bytes=max_bytes)

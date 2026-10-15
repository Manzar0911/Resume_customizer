"""Unit tests for ResumeParser"""
import io
import pytest
from unittest.mock import patch, MagicMock
from app.services.resume_parser import ResumeParser, ResumeParserError


class TestResumeParser:
    def test_clean_text_normalizes_spaces_and_newlines(self):
        """Should reduce repeated spaces and triple newlines to double newlines"""
        parser = ResumeParser()
        dirty = "Software    Engineer   \n\n\n\n\nFastAPI   Expert\r\n\r\nRemote"
        cleaned = parser._clean_text(dirty)

        assert "    " not in cleaned
        assert "\n\n\n" not in cleaned
        assert "\r" not in cleaned
        assert "Software Engineer" in cleaned
        assert "FastAPI Expert" in cleaned

    def test_clean_text_strips_control_characters(self):
        """Should remove non-printable control characters"""
        parser = ResumeParser()
        text_with_null = "Resume\x00Header\x07With\x1bNoise"
        cleaned = parser._clean_text(text_with_null)
        assert "\x00" not in cleaned
        assert "\x07" not in cleaned
        assert "\x1b" not in cleaned
        assert "ResumeHeaderWithNoise" in cleaned

    def test_parse_unsupported_extension_raises_error(self):
        """Should raise ResumeParserError for unsupported file formats"""
        parser = ResumeParser()
        with pytest.raises(ResumeParserError, match="Unsupported file type"):
            parser.parse(b"dummy content", "resume.png")

    def test_parse_short_content_raises_error(self):
        """Should raise ResumeParserError if extracted text is too short (< 100 chars)"""
        parser = ResumeParser()
        with patch.object(parser, "parse_pdf", return_value="Too short"):
            with pytest.raises(ResumeParserError, match="Could not extract sufficient text"):
                parser.parse(b"%PDF-short", "resume.pdf")

    def test_parse_pdf_via_pymupdf(self):
        """Should extract text via PyMuPDF"""
        parser = ResumeParser()
        mock_doc = MagicMock()
        mock_page = MagicMock()
        mock_page.get_text.return_value = "Alex Morgan Software Engineer Experience with Python and React for multiple years."
        mock_doc.__len__.return_value = 1
        mock_doc.__getitem__.return_value = mock_page

        with patch("fitz.open", return_value=mock_doc):
            text = parser.parse_pdf(b"%PDF-sample")
            assert "Alex Morgan" in text
            mock_doc.close.assert_called_once()

    def test_parse_pdf_fallback_to_pdfplumber(self):
        """Should fallback to pdfplumber when PyMuPDF fails"""
        parser = ResumeParser()

        with patch.object(parser, "_parse_pdf_pymupdf", side_effect=Exception("PyMuPDF failed")):
            with patch.object(parser, "_parse_pdf_pdfplumber", return_value="Fallback text extracted successfully from resume."):
                text = parser.parse_pdf(b"%PDF-fallback")
                assert "Fallback text" in text

    def test_parse_docx_with_paragraphs_and_tables(self):
        """Should extract text from docx paragraphs and tables"""
        parser = ResumeParser()
        mock_doc = MagicMock()

        p1 = MagicMock()
        p1.text = "John Doe Resume Title"
        mock_doc.paragraphs = [p1]

        mock_cell = MagicMock()
        mock_cell.text = "Python Skill"
        mock_row = MagicMock()
        mock_row.cells = [mock_cell]
        mock_table = MagicMock()
        mock_table.rows = [mock_row]
        mock_doc.tables = [mock_table]

        with patch("docx.Document", return_value=mock_doc):
            text = parser.parse_docx(b"fake docx")
            assert "John Doe Resume Title" in text
            assert "Python Skill" in text

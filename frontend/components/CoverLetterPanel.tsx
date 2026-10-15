"use client";

import React, { useState } from "react";
import { generateCoverLetter, CoverLetterResult, ResumeAPIError } from "@/lib/api";
import { Sparkles, Copy, Download, Check, AlertCircle, Building2, FileText, Loader2 } from "lucide-react";

interface CoverLetterPanelProps {
  jobDescription?: string;
  resumeText: string;
}

export function CoverLetterPanel({
  jobDescription = "",
  resumeText,
}: CoverLetterPanelProps) {
  const [companyName, setCompanyName] = useState("");
  const [jd, setJd] = useState(jobDescription);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CoverLetterResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!jd.trim() || jd.trim().length < 20) {
      setError("Please provide a job description (at least 20 characters).");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await generateCoverLetter(
        { resumeText },
        jd.trim(),
        companyName.trim() || undefined
      );
      setResult(res);
    } catch (err) {
      if (err instanceof ResumeAPIError) {
        setError(err.message);
      } else {
        setError("Failed to generate cover letter. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.cover_letter) return;
    navigator.clipboard.writeText(result.cover_letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result?.cover_letter) return;
    const blob = new Blob([result.cover_letter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${companyName ? companyName.replace(/\s+/g, "_") + "_" : ""}Cover_Letter.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Configuration row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        <div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "8px",
            }}
          >
            <Building2 size={15} color="var(--color-primary)" />
            Target Company Name (Optional)
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Google, Stripe, Microsoft"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--border-medium)",
              background: "#FFFFFF",
              color: "var(--text-primary)",
              fontSize: "13.5px",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "8px",
            }}
          >
            <FileText size={15} color="var(--color-secondary)" />
            Job Description Reference
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="Paste role keywords or job description snippet..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--border-medium)",
              background: "#FFFFFF",
              color: "var(--text-primary)",
              fontSize: "13.5px",
            }}
          />
        </div>
      </div>

      {/* Action button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          className="btn-primary"
          onClick={handleGenerate}
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating Cover Letter with Gemini...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Tailored Cover Letter
            </>
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            color: "var(--color-danger)",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Generated cover letter output */}
      {result && (
        <div
          className="animate-fade-in-up"
          style={{
            marginTop: "12px",
            background: "#FFFFFF",
            border: "1px solid rgba(203, 213, 225, 0.8)",
            borderRadius: "var(--radius-xl)",
            padding: "32px",
            boxShadow: "0 8px 24px -6px rgba(15, 23, 42, 0.06)",
          }}
        >
          {/* Header row with stats and actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              paddingBottom: "16px",
              marginBottom: "20px",
              borderBottom: "1.5px solid rgba(226, 232, 240, 0.9)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="badge badge-success">Generated by Gemini</span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
                {result.word_count} words · {(result.processing_time_ms / 1000).toFixed(1)}s
              </span>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn-ghost"
                onClick={handleCopy}
                style={{
                  padding: "6px 14px",
                  fontSize: "12.5px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {copied ? (
                  <>
                    <Check size={13} color="var(--color-success)" /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={13} /> Copy
                  </>
                )}
              </button>
              <button
                className="btn-secondary"
                onClick={handleDownload}
                style={{
                  padding: "6px 14px",
                  fontSize: "12.5px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Download size={13} /> Download .txt
              </button>
            </div>
          </div>

          {/* Letter Body */}
          <div
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "var(--font-sans)",
              fontSize: "14.5px",
              lineHeight: 1.8,
              color: "#1E293B",
              maxHeight: "500px",
              overflowY: "auto",
              paddingRight: "8px",
            }}
          >
            {result.cover_letter}
          </div>
        </div>
      )}
    </div>
  );
}

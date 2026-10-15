"use client";

import { useCallback, useRef, useState } from "react";
import {
  Upload,
  FileText,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Layers,
  ShieldCheck,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import { formatFileSize, validateFile } from "@/lib/api";

interface InputSectionProps {
  file: File | null;
  jobDescription: string;
  sections: string[];
  error: string | null;
  onFileChange: (file: File | null) => void;
  onJobDescriptionChange: (jd: string) => void;
  onSectionsChange: (sections: string[]) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const SECTION_OPTIONS = [
  { id: "summary", label: "Executive Summary" },
  { id: "skills", label: "Core Competencies" },
  { id: "experience", label: "Work Experience" },
  { id: "projects", label: "Key Projects" },
  { id: "education", label: "Education & Certs" },
];

const SAMPLE_JDS = [
  {
    role: "Senior Full Stack Engineer",
    text: `Senior Full Stack Engineer (Python & React)\n\nWe are looking for an experienced Senior Full Stack Engineer proficient in Python, FastAPI, React, Next.js, and TypeScript. You will architect high-performance APIs, build responsive interfaces, integrate Gemini/OpenAI models, and ensure high test coverage and ATS-ready workflows. Requirements: 4+ years Python, 3+ years React, Docker, cloud deployment on Render/AWS.`,
  },
  {
    role: "Frontend Developer (Next.js)",
    text: `Frontend Software Engineer\n\nLooking for a meticulous Frontend Engineer with strong mastery of Next.js 15, TypeScript, Tailwind CSS, and React 19. You will craft responsive interfaces, implement client-side performance optimizations, state management, and ensure WCAG AA compliance across desktop and mobile.`,
  },
];

export function InputSection({
  file,
  jobDescription,
  sections,
  error,
  onFileChange,
  onJobDescriptionChange,
  onSectionsChange,
  onSubmit,
  isLoading,
}: InputSectionProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [jdError, setJdError] = useState<string | null>(null);
  const [loadingSample, setLoadingSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      const err = validateFile(selectedFile);
      if (err) {
        setFileError(err);
        return;
      }
      setFileError(null);
      onFileChange(selectedFile);
    },
    [onFileChange]
  );

  const handleLoadSampleResume = async () => {
    setLoadingSample(true);
    setFileError(null);
    try {
      const res = await fetch("/sample_resume.pdf");
      if (!res.ok) throw new Error("Could not fetch sample resume file");
      const blob = await res.blob();
      const sampleFile = new File([blob], "Alex_Morgan_Resume.pdf", {
        type: "application/pdf",
      });
      handleFileSelect(sampleFile);
    } catch (err) {
      console.error("Failed to load sample resume:", err);
      setFileError("Could not load sample resume. Please upload your own PDF/DOCX.");
    } finally {
      setLoadingSample(false);
    }
  };

  const handleJDChange = (value: string) => {
    onJobDescriptionChange(value);
    if (value.trim().length > 0 && value.trim().length < 50) {
      setJdError("Minimum 50 characters required for intelligent tailoring.");
    } else {
      setJdError(null);
    }
  };

  const toggleSection = (sectionId: string) => {
    if (sections.includes(sectionId)) {
      if (sections.length > 1) {
        onSectionsChange(sections.filter((s) => s !== sectionId));
      }
    } else {
      onSectionsChange([...sections, sectionId]);
    }
  };

  const charCount = jobDescription.trim().length;
  const canSubmit = Boolean(file) && charCount >= 50 && sections.length > 0;

  return (
    <div
      className="animate-fade-in-up"
      style={{ display: "flex", flexDirection: "column", gap: "24px" }}
    >
      {/* Global alert error */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            padding: "14px 18px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-rose-subtle)",
            border: "1px solid var(--color-rose-border)",
          }}
          role="alert"
        >
          <AlertCircle size={18} color="var(--color-rose)" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <p style={{ fontWeight: 700, color: "var(--color-rose)", fontSize: "13.5px", marginBottom: "2px" }}>
              Customization Error
            </p>
            <p style={{ color: "#7F1D1D", fontSize: "13px" }}>{error}</p>
          </div>
        </div>
      )}

      {/* Bento Grid: 2-Column Responsive Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "24px",
          alignItems: "stretch",
        }}
      >
        {/* ─── Column 1: Job Description Input ─── */}
        <div
          className="glass-card"
          style={{
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#FFFFFF",
          }}
        >
          <div>
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-slate-100)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <Briefcase size={17} color="var(--color-slate-700)" />
                </div>
                <div>
                  <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                    Target Job Description
                  </h2>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Paste the requirements or role description
                  </p>
                </div>
              </div>

              {/* Sample JDs Dropdown/Pills */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {SAMPLE_JDS.map((sample, i) => (
                  <button
                    key={i}
                    id={i === 0 ? "btn-sample-fullstack" : "btn-sample-frontend"}
                    data-testid={i === 0 ? "sample-fullstack" : "sample-frontend"}
                    type="button"
                    onClick={() => handleJDChange(sample.text)}
                    className="btn-ghost"
                    style={{
                      fontSize: "11.5px",
                      padding: "4px 10px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--color-slate-100)",
                      border: "1px solid var(--border-light)",
                      color: "var(--color-slate-700)",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    + {i === 0 ? "Full Stack" : "Frontend"} Sample
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div style={{ position: "relative" }}>
              <textarea
                className="input-field"
                placeholder="Paste full job description here (e.g. Responsibilities, Requirements, Preferred Tech Stack)..."
                value={jobDescription}
                onChange={(e) => handleJDChange(e.target.value)}
                rows={9}
                style={{
                  resize: "vertical",
                  minHeight: "220px",
                  fontSize: "13px",
                  lineHeight: 1.6,
                  color: "var(--text-primary)",
                  backgroundColor: "#FFFFFF",
                }}
              />
              {jobDescription && (
                <button
                  type="button"
                  onClick={() => onJobDescriptionChange("")}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "var(--color-slate-100)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "4px",
                    width: "22px",
                    height: "22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "var(--color-slate-500)",
                  }}
                  title="Clear text"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Counter and status */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "8px",
                fontSize: "12px",
              }}
            >
              <span
                style={{
                  color: jdError
                    ? "var(--color-rose)"
                    : charCount >= 50
                    ? "var(--color-emerald)"
                    : "var(--text-muted)",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {charCount >= 50 ? (
                  <>
                    <CheckCircle2 size={13} color="var(--color-emerald)" />
                    Verified Job Description
                  </>
                ) : (
                  jdError || "Minimum 50 characters required"
                )}
              </span>
              <span
                style={{
                  color: "var(--text-muted)",
                  fontWeight: 600,
                  fontSize: "11.5px",
                }}
              >
                {charCount.toLocaleString()} chars
              </span>
            </div>
          </div>

          {/* Section Customizer Options */}
          <div
            style={{
              marginTop: "24px",
              paddingTop: "18px",
              borderTop: "1px solid var(--border-light)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
              <Layers size={14} color="var(--color-slate-600)" />
              <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)" }}>
                Sections to Target
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {SECTION_OPTIONS.map((sec) => {
                const isSelected = sections.includes(sec.id);
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => toggleSection(sec.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "5px 12px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                      background: isSelected
                        ? "var(--color-slate-900)"
                        : "#FFFFFF",
                      border: isSelected
                        ? "1px solid var(--color-slate-900)"
                        : "1px solid var(--border-light)",
                      color: isSelected ? "#FFFFFF" : "var(--color-slate-700)",
                    }}
                  >
                    {sec.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Column 2: Resume Upload Zone ─── */}
        <div
          className="glass-card"
          style={{
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#FFFFFF",
          }}
        >
          <div>
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-slate-100)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <FileText size={17} color="var(--color-slate-700)" />
                </div>
                <div>
                  <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                    Original Resume
                  </h2>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Upload PDF or Word DOCX (up to 10MB)
                  </p>
                </div>
              </div>

              {/* Sample Resume Button */}
              <button
                type="button"
                id="btn-sample-resume"
                data-testid="load-sample-resume"
                onClick={handleLoadSampleResume}
                disabled={loadingSample}
                className="btn-ghost"
                style={{
                  fontSize: "11.5px",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-slate-100)",
                  border: "1px solid var(--border-light)",
                  color: "var(--color-slate-700)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {loadingSample ? "Loading..." : "+ Sample Resume (PDF)"}
              </button>
            </div>

            {/* Drop Zone or Selected File Card */}
            {!file ? (
              <div
                id="drop-zone-container"
                data-testid="drop-zone"
                className={`drop-zone ${isDragOver ? "drag-over" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOver(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOver(false);
                  const f = e.dataTransfer?.files?.[0];
                  if (f) {
                    handleFileSelect(f);
                  }
                }}
                style={{
                  position: "relative",
                  minHeight: "220px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                {/* Real, native file input covering the entire drop zone */}
                <input
                  id="resume-file-input"
                  ref={fileInputRef}
                  data-testid="file-upload-input"
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                    zIndex: 10,
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragOver(true);
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragOver(false);
                    const f = e.dataTransfer?.files?.[0];
                    if (f) {
                      handleFileSelect(f);
                    }
                  }}
                  onChange={(e) => {
                    setIsDragOver(false);
                    const f = e.target.files?.[0];
                    if (f) {
                      handleFileSelect(f);
                    }
                    e.target.value = "";
                  }}
                />

                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-slate-100)",
                    border: "1px solid var(--border-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <Upload size={20} color="var(--color-slate-600)" />
                </div>

                <div style={{ textAlign: "center", pointerEvents: "none" }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "3px" }}>
                    Click to browse or drop resume here
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Supports PDF and Microsoft Word DOCX
                  </p>
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "var(--radius-sm)",
                    background: "#FFFFFF",
                    border: "1px solid var(--border-light)",
                    color: "var(--color-slate-800)",
                    boxShadow: "var(--shadow-xs)",
                    pointerEvents: "none",
                    marginTop: "4px",
                  }}
                >
                  <FolderOpen size={13} />
                  Select Document
                </div>
              </div>
            ) : (
              /* Selected file state card */
              <div
                className="animate-fade-in-up"
                style={{
                  minHeight: "220px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "24px",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--color-slate-50)",
                  border: "1px solid var(--border-strong)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "var(--radius-md)",
                        background: "var(--color-slate-900)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FileText size={20} color="white" />
                    </div>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {file.name}
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {formatFileSize(file.size)} · Verified File
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onFileChange(null)}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid var(--border-light)",
                      borderRadius: "var(--radius-sm)",
                      padding: "6px 10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      cursor: "pointer",
                      color: "var(--color-rose)",
                      fontSize: "11.5px",
                      fontWeight: 600,
                    }}
                    title="Remove file"
                  >
                    <X size={13} /> Remove
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--color-emerald-subtle)",
                    border: "1px solid var(--color-emerald-border)",
                    fontSize: "12px",
                    color: "var(--color-emerald)",
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={15} />
                  Document ready for extraction & tailoring
                </div>
              </div>
            )}

            {fileError && (
              <p style={{ color: "var(--color-rose)", fontSize: "12px", marginTop: "8px", fontWeight: 600 }}>
                {fileError}
              </p>
            )}
          </div>

          {/* AI Optimization Guarantees */}
          <div
            style={{
              marginTop: "24px",
              paddingTop: "18px",
              borderTop: "1px solid var(--border-light)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
              <ShieldCheck size={14} color="var(--color-emerald)" />
              <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)" }}>
                Optimization Standards
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
              <span>✓ Semantic keyword alignment</span>
              <span>✓ 100% Fact fidelity guarantee</span>
              <span>✓ Standard ATS-compliant parsing</span>
              <span>✓ Impact-driven action metrics</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Full-Width Action Panel ─── */}
      <div
        className="glass-card"
        style={{
          padding: "20px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          background: "#FFFFFF",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
            <span style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--text-primary)" }}>
              Ready to Customize
            </span>
            <span className="badge badge-primary">
              Gemini 3.5 & 3.8
            </span>
          </div>
          <p style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
            {!file
              ? "Select your resume file above to proceed"
              : charCount < 50
              ? "Add at least 50 characters of job description"
              : "All inputs validated. Ready to tailor resume."}
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={onSubmit}
          disabled={!canSubmit || isLoading}
          style={{
            padding: "12px 28px",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          <Sparkles size={16} />
          Tailor Resume for ATS
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

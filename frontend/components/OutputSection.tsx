"use client";

import { useState } from "react";
import { CustomizeResult } from "@/lib/api";
import { MatchScore } from "./MatchScore";
import { ResumeDisplay } from "./ResumeDisplay";
import { DiffView } from "./DiffView";
import { DownloadBar } from "./DownloadBar";
import { KeywordBadges } from "./KeywordBadges";
import { CoverLetterPanel } from "./CoverLetterPanel";
import {
  RotateCcw,
  TrendingUp,
  Lightbulb,
  GitCompare,
  FileText,
  Sparkles,
  Clock,
  Cpu,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface OutputSectionProps {
  result: CustomizeResult;
  onReset: () => void;
  jobDescription?: string;
}

type ActiveTab = "customized" | "original" | "diff";

export function OutputSection({
  result,
  onReset,
  jobDescription = "",
}: OutputSectionProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("customized");
  const [showCoverLetter, setShowCoverLetter] = useState(false);

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "customized",
      label: "Customized Resume",
      icon: <Sparkles size={14} />,
    },
    {
      id: "original",
      label: "Original Source",
      icon: <FileText size={14} />,
    },
    {
      id: "diff",
      label: "Changes & Diff",
      icon: <GitCompare size={14} />,
    },
  ];

  return (
    <div
      className="animate-fade-in-up"
      style={{ display: "flex", flexDirection: "column", gap: "22px" }}
    >
      {/* Executive Report Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          paddingBottom: "4px",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "22px",
              fontWeight: 800,
              color: "var(--color-slate-900)",
              letterSpacing: "-0.02em",
              marginBottom: "3px",
            }}
          >
            ATS Optimization Report & Tailored Resume
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Review keyword alignment, structural diff, and export your publication-ready document.
          </p>
        </div>

        <button
          className="btn-secondary"
          onClick={onReset}
          style={{
            padding: "8px 16px",
            fontSize: "12.5px",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <RotateCcw size={13} />
          Customize Another Resume
        </button>
      </div>

      {/* Top metrics Bento Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        {/* Match score Card */}
        <div
          className="glass-card"
          style={{
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: "18px",
            background: "#FFFFFF",
          }}
        >
          <MatchScore score={result.match_score} label="Match Score" size={76} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "var(--color-slate-900)",
                }}
              >
                Role Alignment
              </span>
              <span className="badge badge-primary" style={{ fontSize: "10.5px" }}>
                Verified
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>
              Direct keyword and capability overlap with role requirements
            </p>
          </div>
        </div>

        {/* ATS score Card */}
        <div
          className="glass-card"
          style={{
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: "18px",
            background: "#FFFFFF",
          }}
        >
          <MatchScore score={result.ats_score} label="ATS Score" size={76} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "var(--color-slate-900)",
                }}
              >
                ATS Compatibility
              </span>
              <span className="badge badge-success" style={{ fontSize: "10.5px" }}>
                Pass Safe
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>
              Structure compliant with Greenhouse, Lever, and Workday
            </p>
          </div>
        </div>

        {/* Optimization Stats Card */}
        <div
          className="glass-card"
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            justifyContent: "center",
            background: "#FFFFFF",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12.5px",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-slate-600)" }}>
              <Lightbulb size={13} color="var(--color-amber)" />
              <span>Keywords added:</span>
            </span>
            <span style={{ color: "var(--color-amber)", fontWeight: 700 }}>
              +{result.missing_keywords.length} terms
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12.5px",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-slate-600)" }}>
              <TrendingUp size={13} color="var(--color-primary)" />
              <span>Sections updated:</span>
            </span>
            <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>
              {result.changes_made.length} sections
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12.5px",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-slate-600)" }}>
              <Clock size={13} color="var(--color-slate-400)" />
              <span>Response time:</span>
            </span>
            <span style={{ color: "var(--color-slate-900)", fontWeight: 700 }}>
              {(result.processing_time_ms / 1000).toFixed(1)}s
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12.5px",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-slate-600)" }}>
              <Cpu size={13} color="var(--color-slate-500)" />
              <span>Model engine:</span>
            </span>
            <span
              style={{
                color: "var(--color-slate-800)",
                fontWeight: 600,
                fontSize: "11.5px",
              }}
            >
              {result.model_used.replace("models/", "").replace("-latest", "")}
            </span>
          </div>
        </div>
      </div>

      {/* Suggested keywords card */}
      {result.missing_keywords.length > 0 && (
        <div className="glass-card" style={{ padding: "18px 24px", background: "#FFFFFF" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Lightbulb size={15} color="var(--color-amber)" />
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  color: "var(--color-slate-900)",
                }}
              >
                Injected ATS Keywords
              </h3>
            </div>
            <span className="badge badge-warning">
              {result.missing_keywords.length} keywords integrated
            </span>
          </div>
          <KeywordBadges keywords={result.missing_keywords} variant="missing" />
        </div>
      )}

      {/* Changes summary card */}
      {result.changes_made.length > 0 && (
        <div className="glass-card" style={{ padding: "18px 24px", background: "#FFFFFF" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "14px",
            }}
          >
            <TrendingUp size={15} color="var(--color-primary)" />
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "13.5px",
                fontWeight: 700,
                color: "var(--color-slate-900)",
              }}
            >
              Section Customization Summary
            </h3>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "220px",
              overflowY: "auto",
            }}
          >
            {result.changes_made.map((change, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-slate-50)",
                  border: "1px solid var(--border-light)",
                }}
              >
                <span
                  className={`badge ${
                    change.impact === "improved"
                      ? "badge-success"
                      : change.impact === "added"
                      ? "badge-primary"
                      : "badge-warning"
                  }`}
                  style={{ flexShrink: 0, textTransform: "capitalize", fontSize: "11px" }}
                >
                  {change.section}
                </span>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--color-slate-700)",
                    lineHeight: 1.5,
                  }}
                >
                  {change.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Resume Viewer Tabs */}
      <div className="glass-card" style={{ padding: "0", background: "#FFFFFF" }}>
        {/* Tab header */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border-light)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div className="tab-list">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 500 }}>
            {activeTab === "customized"
              ? "Previewing Optimized Resume"
              : activeTab === "original"
              ? "Original Extracted Text"
              : "Side-by-Side Comparison"}
          </span>
        </div>

        {/* Tab content */}
        <div style={{ padding: "24px" }} data-testid="result-section">
          {activeTab === "customized" && (
            <ResumeDisplay
              data-testid="customized-resume"
              resume={result.customized_resume}
            />
          )}
          {activeTab === "original" && (
            <div
              className="resume-output"
              style={{
                whiteSpace: "pre-wrap",
                fontSize: "13px",
                lineHeight: 1.7,
                color: "var(--color-slate-800)",
                fontFamily: "var(--font-mono)",
                background: "var(--color-slate-50)",
                border: "1px solid var(--border-light)",
                borderRadius: "var(--radius-md)",
                padding: "28px 32px",
                maxHeight: "650px",
                overflowY: "auto",
              }}
            >
              {result.original_resume_text}
            </div>
          )}
          {activeTab === "diff" && (
            <DiffView
              original={result.original_resume_text}
              customized={JSON.stringify(result.customized_resume, null, 2)}
            />
          )}
        </div>
      </div>

      {/* Download Action Bar */}
      <DownloadBar result={result} />

      {/* Tailored Cover Letter Accordion */}
      <div className="glass-card" style={{ overflow: "hidden", background: "#FFFFFF" }}>
        <button
          onClick={() => setShowCoverLetter(!showCoverLetter)}
          style={{
            width: "100%",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--text-primary)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "var(--radius-sm)",
                background: "var(--color-slate-100)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={14} color="var(--color-slate-700)" />
            </div>
            <div style={{ textAlign: "left" }}>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "14px",
                  fontWeight: 700,
                  display: "block",
                  color: "var(--color-slate-900)",
                }}
              >
                Generate Tailored Cover Letter
              </span>
              <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                AI-written letter matching this tailored resume and job description
              </span>
            </div>
            <span className="badge badge-primary" style={{ fontSize: "10.5px" }}>
              Gemini 3.5
            </span>
          </div>

          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "var(--radius-sm)",
              background: "var(--color-slate-100)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-slate-600)",
            }}
          >
            {showCoverLetter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </button>

        {showCoverLetter && (
          <div
            style={{
              borderTop: "1px solid var(--border-light)",
              padding: "24px",
              background: "var(--color-slate-50)",
            }}
          >
            <CoverLetterPanel
              jobDescription={jobDescription}
              resumeText={result.original_resume_text}
            />
          </div>
        )}
      </div>

      {/* Reset button */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
        <button
          className="btn-secondary"
          onClick={onReset}
          style={{
            padding: "10px 22px",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          <RotateCcw size={14} />
          Customize Another Resume
        </button>
      </div>
    </div>
  );
}

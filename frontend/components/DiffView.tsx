"use client";

import React, { useMemo, useState } from "react";
import { diffLines, Change } from "diff";
import { Columns, Rows, Plus, Minus } from "lucide-react";

interface DiffViewProps {
  original: string;
  customized: string;
}

/**
 * Helper to convert structured JSON string into clean readable resume text
 * if the customized string passed is JSON.
 */
function toReadableResumeText(raw: string): string {
  try {
    const data = JSON.parse(raw);
    const lines: string[] = [];

    if (data.contact) {
      if (data.contact.name) lines.push(data.contact.name.toUpperCase());
      const contactBits = [
        data.contact.email,
        data.contact.phone,
        data.contact.location,
        data.contact.linkedin,
      ].filter(Boolean);
      if (contactBits.length) lines.push(contactBits.join(" | "));
      lines.push("");
    }

    if (data.summary) {
      lines.push("PROFESSIONAL SUMMARY");
      lines.push(data.summary);
      lines.push("");
    }

    if (data.skills && Array.isArray(data.skills)) {
      lines.push("SKILLS");
      lines.push(data.skills.join(", "));
      lines.push("");
    }

    if (data.experience && Array.isArray(data.experience)) {
      lines.push("EXPERIENCE");
      data.experience.forEach((exp: any) => {
        lines.push(`${exp.role} - ${exp.company} (${exp.duration})`);
        if (exp.bullets && Array.isArray(exp.bullets)) {
          exp.bullets.forEach((b: string) => lines.push(`• ${b}`));
        }
        lines.push("");
      });
    }

    if (data.education && Array.isArray(data.education)) {
      lines.push("EDUCATION");
      data.education.forEach((edu: any) => {
        lines.push(`${edu.degree} - ${edu.institution} (${edu.year})`);
      });
      lines.push("");
    }

    if (data.projects && Array.isArray(data.projects)) {
      lines.push("PROJECTS");
      data.projects.forEach((proj: any) => {
        lines.push(`${proj.name}: ${proj.description}`);
      });
      lines.push("");
    }

    return lines.join("\n");
  } catch {
    // If it's already plain text, return as is
    return raw;
  }
}

export function DiffView({ original, customized }: DiffViewProps) {
  const [viewMode, setViewMode] = useState<"unified" | "split">("unified");

  const readableCustomized = useMemo(() => {
    return toReadableResumeText(customized);
  }, [customized]);

  const diffResult = useMemo(() => {
    return diffLines(original.trim(), readableCustomized.trim());
  }, [original, readableCustomized]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {/* Controls row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          paddingBottom: "12px",
          borderBottom: "1.5px solid rgba(226, 232, 240, 0.9)",
        }}
      >
        <div style={{ display: "flex", gap: "16px", alignItems: "center", fontSize: "12.5px", fontWeight: 600 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#065F46",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#10B981",
              }}
            />
            Added / Improved for ATS
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#991B1B",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#EF4444",
              }}
            />
            Original / Removed
          </span>
        </div>

        {/* View Mode Toggle */}
        <div
          style={{
            display: "inline-flex",
            background: "rgba(241, 245, 249, 0.9)",
            padding: "3px",
            borderRadius: "var(--radius-md)",
            border: "1px solid rgba(203, 213, 225, 0.8)",
          }}
        >
          <button
            onClick={() => setViewMode("unified")}
            style={{
              padding: "5px 14px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: viewMode === "unified" ? "#FFFFFF" : "transparent",
              color: viewMode === "unified" ? "var(--color-primary-dark)" : "var(--text-secondary)",
              boxShadow: viewMode === "unified" ? "0 1px 3px rgba(15, 23, 42, 0.08)" : "none",
              transition: "all var(--transition-fast)",
            }}
          >
            <Rows size={13} /> Unified
          </button>
          <button
            onClick={() => setViewMode("split")}
            style={{
              padding: "5px 14px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: viewMode === "split" ? "#FFFFFF" : "transparent",
              color: viewMode === "split" ? "var(--color-primary-dark)" : "var(--text-secondary)",
              boxShadow: viewMode === "split" ? "0 1px 3px rgba(15, 23, 42, 0.08)" : "none",
              transition: "all var(--transition-fast)",
            }}
          >
            <Columns size={13} /> Split
          </button>
        </div>
      </div>

      {/* Diff content view */}
      {viewMode === "unified" ? (
        <div
          className="resume-diff-box"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(203, 213, 225, 0.8)",
            borderRadius: "var(--radius-lg)",
            padding: "16px",
            fontFamily: "var(--font-mono)",
            fontSize: "12.5px",
            lineHeight: 1.7,
            maxHeight: "550px",
            overflowY: "auto",
            boxShadow: "inset 0 1px 3px rgba(15, 23, 42, 0.03)",
          }}
        >
          {diffResult.map((part: Change, index: number) => {
            const isAdded = part.added;
            const isRemoved = part.removed;
            const bgColor = isAdded
              ? "rgba(16, 185, 129, 0.08)"
              : isRemoved
              ? "rgba(239, 68, 68, 0.08)"
              : "transparent";
            const textColor = isAdded
              ? "#065F46"
              : isRemoved
              ? "#991B1B"
              : "#334155";
            const borderLeft = isAdded
              ? "3px solid #10B981"
              : isRemoved
              ? "3px solid #EF4444"
              : "3px solid transparent";

            return (
              <div
                key={index}
                style={{
                  background: bgColor,
                  color: textColor,
                  borderLeft: borderLeft,
                  padding: "3px 10px",
                  borderRadius: "2px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  marginBottom: "2px",
                }}
              >
                <span
                  style={{
                    userSelect: "none",
                    fontWeight: 700,
                    width: "12px",
                    flexShrink: 0,
                  }}
                >
                  {isAdded ? "+" : isRemoved ? "-" : " "}
                </span>
                <span style={{ flex: 1 }}>{part.value}</span>
              </div>
            );
          })}
        </div>
      ) : (
        /* Split Side-by-side view */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            maxHeight: "550px",
          }}
        >
          {/* Original Column */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(203, 213, 225, 0.8)",
              borderRadius: "var(--radius-lg)",
              padding: "18px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              lineHeight: 1.6,
              overflowY: "auto",
              boxShadow: "inset 0 1px 3px rgba(15, 23, 42, 0.03)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#991B1B",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "12px",
                paddingBottom: "6px",
                borderBottom: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              Original Source
            </div>
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                color: "#475569",
                fontFamily: "inherit",
              }}
            >
              {original}
            </pre>
          </div>

          {/* Customized Column */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(203, 213, 225, 0.8)",
              borderRadius: "var(--radius-lg)",
              padding: "18px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              lineHeight: 1.6,
              overflowY: "auto",
              boxShadow: "inset 0 1px 3px rgba(15, 23, 42, 0.03)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#065F46",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "12px",
                paddingBottom: "6px",
                borderBottom: "1px solid rgba(16, 185, 129, 0.2)",
              }}
            >
              Tailored Content
            </div>
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                color: "#0F172A",
                fontFamily: "inherit",
              }}
            >
              {readableCustomized}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

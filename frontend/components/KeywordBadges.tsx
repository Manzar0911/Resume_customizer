"use client";

import React, { useState } from "react";
import { Check, Plus, Copy } from "lucide-react";

interface KeywordBadgesProps {
  keywords: string[];
  variant?: "matching" | "missing" | "neutral";
  onKeywordClick?: (keyword: string) => void;
}

export function KeywordBadges({
  keywords,
  variant = "neutral",
  onKeywordClick,
}: KeywordBadgesProps) {
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  if (!keywords || keywords.length === 0) {
    return (
      <p style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic" }}>
        No keywords detected.
      </p>
    );
  }

  const handleCopy = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    setCopiedKeyword(keyword);
    setTimeout(() => setCopiedKeyword(null), 1500);
    if (onKeywordClick) onKeywordClick(keyword);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "matching":
        return {
          background: "rgba(16, 185, 129, 0.1)",
          color: "#065F46",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          icon: <Check size={12} strokeWidth={2.5} />,
        };
      case "missing":
        return {
          background: "rgba(245, 158, 11, 0.1)",
          color: "#B45309",
          border: "1px solid rgba(245, 158, 11, 0.25)",
          icon: <Plus size={12} strokeWidth={2.5} />,
        };
      default:
        return {
          background: "rgba(99, 102, 241, 0.08)",
          color: "var(--color-primary-dark)",
          border: "1px solid rgba(99, 102, 241, 0.2)",
          icon: null,
        };
    }
  };

  const styleConfig = getVariantStyles();

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        alignItems: "center",
      }}
    >
      {keywords.map((kw, idx) => {
        const isCopied = copiedKeyword === kw;
        return (
          <button
            key={`${kw}-${idx}`}
            onClick={() => handleCopy(kw)}
            title="Click to copy keyword"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "var(--radius-full, 9999px)",
              fontSize: "12px",
              fontWeight: 500,
              background: styleConfig.background,
              color: styleConfig.color,
              border: styleConfig.border,
              cursor: "pointer",
              transition: "all var(--transition-fast, 150ms ease)",
              userSelect: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.filter = "brightness(1.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.filter = "none";
            }}
          >
            {isCopied ? (
              <>
                <Check size={12} strokeWidth={2.5} color="var(--color-secondary)" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                {styleConfig.icon}
                <span>{kw}</span>
                <Copy size={10} style={{ opacity: 0.5, marginLeft: "2px" }} />
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

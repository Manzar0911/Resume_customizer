"use client";

import React, { useEffect, useState } from "react";

interface MatchScoreProps {
  score: number;
  label?: string;
  size?: number;
}

export function MatchScore({ score, label, size = 80 }: MatchScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(Math.min(100, Math.max(0, Math.round(score))));
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  // Radius and circumference for SVG circle
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * animatedScore) / 100;

  // Dynamic colors based on score
  const getColor = (val: number) => {
    if (val >= 75) return "#059669"; // Executive Emerald
    if (val >= 55) return "#D97706"; // Executive Amber
    return "#DC2626"; // Executive Rose
  };

  const ringColor = getColor(animatedScore);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width={size}
          height={size}
          style={{ transform: "rotate(-90deg)", overflow: "visible" }}
        >
          {/* Background track - light premium slate */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(226, 232, 240, 0.9)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
              filter: `drop-shadow(0 2px 6px ${ringColor}40)`,
            }}
          />
        </svg>

        {/* Center score percentage */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: size > 80 ? "24px" : "20px",
              fontWeight: 800,
              color: "var(--text-primary)",
              lineHeight: 1,
            }}
          >
            {animatedScore}
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: ringColor,
              marginLeft: "1px",
            }}
          >
            %
          </span>
        </div>
      </div>
      {label && (
        <span
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            marginTop: "6px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

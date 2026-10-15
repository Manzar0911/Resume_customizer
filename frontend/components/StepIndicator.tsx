"use client";

import { Check, Sparkles, FileText, Award } from "lucide-react";

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  { number: 1, label: "Input Documents" },
  { number: 2, label: "AI Optimization" },
  { number: 3, label: "Tailored Result" },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div
      style={{
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: "480px",
        margin: "0 auto",
        borderRadius: "var(--radius-full)",
        border: "1px solid var(--border-light)",
        background: "#FFFFFF",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      {STEPS.map((step, index) => {
        const isCompleted = step.number < currentStep;
        const isActive = step.number === currentStep;

        return (
          <div
            key={step.number}
            style={{ display: "flex", alignItems: "center", flex: index < STEPS.length - 1 ? 1 : "none" }}
          >
            {/* Step item */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flex: "none",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  transition: "all var(--transition-base)",
                  background: isCompleted
                    ? "var(--color-emerald)"
                    : isActive
                    ? "var(--color-slate-900)"
                    : "var(--color-slate-100)",
                  color: isCompleted || isActive ? "#FFFFFF" : "var(--color-slate-500)",
                  border: isActive || isCompleted ? "none" : "1px solid var(--border-light)",
                }}
              >
                {isCompleted ? <Check size={13} strokeWidth={2.5} /> : step.number}
              </div>

              <span
                style={{
                  fontSize: "12px",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive
                    ? "var(--color-slate-900)"
                    : isCompleted
                    ? "var(--color-slate-700)"
                    : "var(--text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {index < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  background: isCompleted
                    ? "var(--color-emerald)"
                    : "var(--border-light)",
                  margin: "0 10px",
                  transition: "background var(--transition-base)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

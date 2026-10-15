"use client";

import { Loader2, CheckCircle2, FileSearch, Brain, Wand2, ShieldCheck } from "lucide-react";

interface ProcessingSectionProps {
  progress: number;
  message: string;
}

const STEPS = [
  { icon: FileSearch, label: "Extracting and verifying resume structure" },
  { icon: Brain, label: "Analyzing job description & ATS requirements" },
  { icon: Wand2, label: "Aligning achievements & optimizing keywords" },
  { icon: ShieldCheck, label: "Finalizing executive output & scoring" },
];

export function ProcessingSection({ progress, message }: ProcessingSectionProps) {
  const activeStepIndex =
    progress < 30
      ? 0
      : progress < 55
      ? 1
      : progress < 80
      ? 2
      : 3;

  return (
    <div
      className="animate-fade-in-up"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "28px",
        padding: "48px 24px",
        maxWidth: "540px",
        margin: "0 auto",
      }}
    >
      {/* Executive Clean Loader */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "var(--radius-lg)",
          background: "var(--color-slate-900)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <Loader2 size={26} color="white" className="animate-spin" />
      </div>

      {/* Status text */}
      <div style={{ textAlign: "center", maxWidth: "440px" }}>
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "20px",
            fontWeight: 800,
            marginBottom: "6px",
            color: "var(--color-slate-900)",
          }}
        >
          Customizing Resume for ATS
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          {message || "Realigning credentials with job description requirements..."}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: "460px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
            Optimization Progress
          </span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--color-slate-900)",
            }}
          >
            {progress}%
          </span>
        </div>
        <div
          style={{
            height: "6px",
            width: "100%",
            background: "var(--color-slate-200)",
            borderRadius: "var(--radius-full)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "var(--color-slate-900)",
              borderRadius: "var(--radius-full)",
              transition: "width 0.3s ease-out",
            }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Processing: ${progress}% complete`}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          background: "#FFFFFF",
        }}
      >
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < activeStepIndex;
          const isActive = index === activeStepIndex;

          return (
            <div
              key={step.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                opacity: index > activeStepIndex ? 0.4 : 1,
                transition: "opacity var(--transition-base)",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: isCompleted
                    ? "var(--color-emerald-subtle)"
                    : isActive
                    ? "var(--color-slate-100)"
                    : "var(--color-slate-50)",
                  border: isCompleted
                    ? "1px solid var(--color-emerald-border)"
                    : isActive
                    ? "1px solid var(--border-strong)"
                    : "1px solid var(--border-light)",
                }}
              >
                {isCompleted ? (
                  <CheckCircle2 size={15} color="var(--color-emerald)" />
                ) : (
                  <Icon
                    size={14}
                    color={isActive ? "var(--color-slate-900)" : "var(--color-slate-400)"}
                    className={isActive ? "animate-spin" : undefined}
                  />
                )}
              </div>

              <span
                style={{
                  fontSize: "13px",
                  fontWeight: isActive ? 700 : isCompleted ? 600 : 400,
                  color: isCompleted
                    ? "var(--color-slate-900)"
                    : isActive
                    ? "var(--color-slate-900)"
                    : "var(--color-slate-500)",
                }}
              >
                {step.label}
              </span>

              {isCompleted && (
                <span
                  className="badge badge-success"
                  style={{ marginLeft: "auto", fontSize: "10.5px", padding: "2px 7px" }}
                >
                  Completed
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Tip */}
      <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
        Powered by Gemini 3.5 & 3.8 Flash for low-latency ATS extraction
      </p>
    </div>
  );
}

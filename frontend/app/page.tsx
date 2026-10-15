"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { StepIndicator } from "@/components/StepIndicator";
import { InputSection } from "@/components/InputSection";
import { ProcessingSection } from "@/components/ProcessingSection";
import { OutputSection } from "@/components/OutputSection";
import { useCustomize } from "@/hooks/useCustomize";
import { Target, Zap, Award } from "lucide-react";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [sections, setSections] = useState<string[]>([
    "summary",
    "skills",
    "experience",
  ]);

  const { status, result, error, progress, progressMessage, customize, reset } =
    useCustomize();

  // Automatically scroll to top when moving between workflow steps so the header never obscures content
  useEffect(() => {
    if (status === "loading" || status === "success" || status === "error") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [status]);

  const currentStep =
    status === "success" ? 3 : status === "loading" || status === "streaming" ? 2 : 1;

  const handleSubmit = async () => {
    if (!file || !jobDescription) return;
    await customize(file, jobDescription, sections);
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription("");
    setSections(["summary", "skills", "experience"]);
    reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-8 pb-20">
        {/* Hero section */}
        {currentStep === 1 && (
          <div className="container-page">
            <div
              className="text-center mb-8 animate-fade-in-up"
              style={{ paddingTop: "20px" }}
            >
              {/* Feature Pill */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "5px 14px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--color-slate-100)",
                  border: "1px solid var(--border-light)",
                  marginBottom: "16px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--color-slate-800)",
                    letterSpacing: "0.03em",
                  }}
                >
                  ENTERPRISE ATS OPTIMIZATION
                </span>
                <span style={{ color: "var(--color-slate-300)" }}>•</span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
                  Gemini 3.5 & 3.8 Engine
                </span>
              </div>

              {/* Headline */}
              <h1
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(32px, 4vw, 54px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.15,
                  maxWidth: "840px",
                  margin: "0 auto 16px",
                  color: "var(--color-slate-900)",
                }}
              >
                Precision Resume Customization for Modern Job Screening
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: "16px",
                  color: "var(--color-slate-600)",
                  maxWidth: "600px",
                  margin: "0 auto 28px",
                  lineHeight: 1.6,
                }}
              >
                Realign your career achievements, core competencies, and executive summary
                against specific role requirements to maximize ATS compatibility.
              </p>

              {/* Value stats pills */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginBottom: "32px",
                }}
              >
                {[
                  {
                    icon: <Target size={15} color="var(--color-emerald)" />,
                    stat: "94%+",
                    label: "ATS Match Benchmark",
                  },
                  {
                    icon: <Zap size={15} color="var(--color-primary)" />,
                    stat: "< 4s",
                    label: "AI Processing Speed",
                  },
                  {
                    icon: <Award size={15} color="var(--color-amber)" />,
                    stat: "3.4×",
                    label: "Recruiter Engagement",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "8px 18px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      borderRadius: "var(--radius-full)",
                      background: "#FFFFFF",
                      border: "1px solid var(--border-light)",
                      boxShadow: "var(--shadow-xs)",
                    }}
                  >
                    <div>{item.icon}</div>
                    <div style={{ textAlign: "left" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: "14px",
                          fontWeight: 800,
                          color: "var(--color-slate-900)",
                          marginRight: "6px",
                        }}
                      >
                        {item.stat}
                      </span>
                      <span
                        style={{
                          fontSize: "11.5px",
                          color: "var(--text-muted)",
                          fontWeight: 500,
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step indicator */}
        <div className="container-page" style={{ marginBottom: "28px" }}>
          <StepIndicator currentStep={currentStep} />
        </div>

        {/* Main interactive workflow views */}
        <div className="container-page">
          {(currentStep === 1 || status === "error") && (
            <InputSection
              file={file}
              jobDescription={jobDescription}
              sections={sections}
              error={error}
              onFileChange={setFile}
              onJobDescriptionChange={setJobDescription}
              onSectionsChange={setSections}
              onSubmit={handleSubmit}
              isLoading={false}
            />
          )}

          {(status === "loading" || status === "streaming") && (
            <ProcessingSection
              progress={progress}
              message={progressMessage}
            />
          )}

          {status === "success" && result && (
            <OutputSection
              result={result}
              onReset={handleReset}
              jobDescription={jobDescription}
            />
          )}
        </div>
      </main>
    </>
  );
}

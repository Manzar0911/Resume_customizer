"use client";

import { FileText, Sparkles, ShieldCheck } from "lucide-react";

export function Navbar() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 50,
        padding: "0 28px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-light)",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
      }}
    >
      {/* Brand */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          textDecoration: "none",
          cursor: "default",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "var(--radius-sm)",
            background: "var(--color-slate-900)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.12)",
          }}
        >
          <FileText size={17} color="white" />
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: "15px",
              color: "var(--color-slate-900)",
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
            }}
          >
            ThePrepLab <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>Resume Customizer</span>
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              letterSpacing: "0.06em",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Enterprise ATS Optimization
          </div>
        </div>
      </div>

      {/* Right badges & links */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          className="badge badge-success"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "11.5px",
          }}
        >
          <ShieldCheck size={13} />
          <span>ATS Verified</span>
        </div>

        <div
          className="badge badge-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "11.5px",
          }}
        >
          <Sparkles size={13} />
          <span>Gemini Intelligence</span>
        </div>
      </div>
    </nav>
  );
}

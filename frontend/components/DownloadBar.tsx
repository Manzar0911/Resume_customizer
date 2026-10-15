"use client";

import React, { useState } from "react";
import { CustomizeResult } from "@/lib/api";
import { Download, FileText, Code2, Copy, Check, Printer } from "lucide-react";

interface DownloadBarProps {
  result: CustomizeResult;
}

function generatePlainText(result: CustomizeResult): string {
  const data = result.customized_resume;
  const lines: string[] = [];

  if (data.contact) {
    if (data.contact.name) lines.push(data.contact.name.toUpperCase());
    const bits = [
      data.contact.email,
      data.contact.phone,
      data.contact.location,
      data.contact.linkedin,
      data.contact.github,
    ].filter(Boolean);
    if (bits.length) lines.push(bits.join(" | "));
    lines.push("==================================================");
    lines.push("");
  }

  if (data.summary) {
    lines.push("PROFESSIONAL SUMMARY");
    lines.push("--------------------");
    lines.push(data.summary);
    lines.push("");
  }

  if (data.skills && data.skills.length > 0) {
    lines.push("SKILLS");
    lines.push("------");
    lines.push(data.skills.join(", "));
    lines.push("");
  }

  if (data.experience && data.experience.length > 0) {
    lines.push("EXPERIENCE");
    lines.push("----------");
    data.experience.forEach((exp) => {
      lines.push(`${exp.role} - ${exp.company} (${exp.duration})`);
      if (exp.bullets) {
        exp.bullets.forEach((b) => lines.push(`  * ${b}`));
      }
      lines.push("");
    });
  }

  if (data.projects && data.projects.length > 0) {
    lines.push("PROJECTS");
    lines.push("--------");
    data.projects.forEach((proj) => {
      lines.push(`${proj.name}: ${proj.description}`);
      if (proj.technologies?.length) {
        lines.push(`Technologies: ${proj.technologies.join(", ")}`);
      }
      lines.push("");
    });
  }

  if (data.education && data.education.length > 0) {
    lines.push("EDUCATION");
    lines.push("---------");
    data.education.forEach((edu) => {
      lines.push(`${edu.degree} - ${edu.institution} (${edu.year})`);
    });
    lines.push("");
  }

  if (data.certifications && data.certifications.length > 0) {
    lines.push("CERTIFICATIONS");
    lines.push("--------------");
    data.certifications.forEach((cert) => lines.push(`* ${cert}`));
    lines.push("");
  }

  return lines.join("\n");
}

export function DownloadBar({ result }: DownloadBarProps) {
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleDownloadTxt = () => {
    const text = generatePlainText(result);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.customized_resume.contact?.name?.replace(/\s+/g, "_") || "Customized"}_Resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(result.customized_resume, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customized_resume.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const text = generatePlainText(result);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const element = document.getElementById("printable-resume");
      if (!element) {
        window.print();
        return;
      }

      // Dynamically import jspdf & html2canvas for browser client
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFFFF",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const name = result.customized_resume.contact?.name?.replace(/\s+/g, "_") || "Customized";
      pdf.save(`${name}_Tailored_Resume.pdf`);
    } catch (err) {
      console.error("PDF generation failed, falling back to window.print():", err);
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Download size={18} color="var(--color-primary-light, #8B85FF)" />
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "14px",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          Export Tailored Resume
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {/* PDF Download */}
        <button
          className="btn-primary"
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          style={{
            padding: "8px 16px",
            fontSize: "13px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <FileText size={14} />
          {downloadingPdf ? "Generating PDF..." : "Download PDF"}
        </button>

        {/* Plain Text Download */}
        <button
          className="btn-secondary"
          onClick={handleDownloadTxt}
          style={{
            padding: "8px 16px",
            fontSize: "13px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Download size={14} /> Plain Text (.txt)
        </button>

        {/* JSON Export */}
        <button
          className="btn-ghost"
          onClick={handleDownloadJson}
          style={{
            padding: "8px 14px",
            fontSize: "13px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Code2 size={14} /> JSON
        </button>

        {/* Copy to Clipboard */}
        <button
          className="btn-ghost"
          onClick={handleCopy}
          style={{
            padding: "8px 14px",
            fontSize: "13px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {copied ? (
            <>
              <Check size={14} color="var(--color-secondary)" /> Copied!
            </>
          ) : (
            <>
              <Copy size={14} /> Copy
            </>
          )}
        </button>

        {/* Print */}
        <button
          className="btn-ghost"
          onClick={() => window.print()}
          title="Print or Save as System PDF"
          style={{
            padding: "8px 12px",
            fontSize: "13px",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <Printer size={14} />
        </button>
      </div>
    </div>
  );
}

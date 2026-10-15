import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Customizer — AI-Powered Resume Tailoring | ThePrepLab",
  description:
    "Instantly tailor your resume to any job description using AI. Upload your resume, paste the job description, and get a customized version with match score in seconds.",
  keywords: [
    "resume customizer",
    "AI resume",
    "job application",
    "ATS optimization",
    "resume tailoring",
    "job description matching",
  ],
  authors: [{ name: "ThePrepLab" }],
  openGraph: {
    title: "Resume Customizer — AI-Powered Resume Tailoring",
    description:
      "Tailor your resume to any job description instantly with AI.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F8FAFC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Ambient background orbs */}
        <div className="ambient-bg" aria-hidden="true">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        {/* Page content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}

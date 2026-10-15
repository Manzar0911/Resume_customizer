/**
 * API client for the Resume Customizer backend.
 */

export function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    // In production behind reverse proxy (port 80, 443, or default origin)
    if (!window.location.port || window.location.port === "80" || window.location.port === "443") {
      return window.location.origin;
    }
    // Local dev server fallback (e.g., localhost:3000 -> localhost:8000)
    const host = window.location.hostname;
    return `http://${host}:8000`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

export interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  duration: string;
  bullets: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  year: string;
  gpa?: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies: string[];
}

export interface CustomizedResumeData {
  contact?: ContactInfo;
  summary: string;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: string[];
  projects: ProjectEntry[];
}

export interface ChangeEntry {
  section: string;
  description: string;
  impact: "improved" | "added" | "rephrased" | "reordered";
}

export interface CustomizeResult {
  customized_resume: CustomizedResumeData;
  original_resume_text: string;
  match_score: number;
  ats_score: number;
  missing_keywords: string[];
  changes_made: ChangeEntry[];
  processing_time_ms: number;
  model_used: string;
}

export interface CoverLetterResult {
  cover_letter: string;
  word_count: number;
  processing_time_ms: number;
}

export interface ATSScoreResult {
  ats_score: number;
  keyword_match_rate: number;
  formatting_score: number;
  readability_score: number;
  suggestions: string[];
  matched_keywords: string[];
  missing_keywords: string[];
}

export interface APIError {
  error: string;
  detail?: string;
  code?: string;
}

export class ResumeAPIError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ResumeAPIError";
    this.status = status;
    this.code = code;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorData: APIError = { error: "An unexpected error occurred" };
    try {
      errorData = await res.json();
    } catch {
      errorData.error = res.statusText || "Network error";
    }
    throw new ResumeAPIError(
      errorData.error || errorData.detail || "Request failed",
      res.status,
      errorData.code
    );
  }
  return res.json() as Promise<T>;
}

/**
 * Customize a resume (non-streaming)
 */
export async function customizeResume(
  file: File,
  jobDescription: string,
  sections?: string[]
): Promise<CustomizeResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_description", jobDescription);
  if (sections?.length) {
    formData.append("sections", sections.join(","));
  }

  const res = await fetch(`${getApiUrl()}/api/customize`, {
    method: "POST",
    body: formData,
  });

  return handleResponse<CustomizeResult>(res);
}

/**
 * Generate a cover letter
 */
export async function generateCoverLetter(
  source: { file?: File; resumeText?: string } | File,
  jobDescription: string,
  companyName?: string
): Promise<CoverLetterResult> {
  const formData = new FormData();
  if (source instanceof File) {
    formData.append("file", source);
  } else {
    if (source.file) formData.append("file", source.file);
    if (source.resumeText) formData.append("resume_text", source.resumeText);
  }
  formData.append("job_description", jobDescription);
  if (companyName) formData.append("company_name", companyName);

  const res = await fetch(`${getApiUrl()}/api/cover-letter`, {
    method: "POST",
    body: formData,
  });

  return handleResponse<CoverLetterResult>(res);
}

/**
 * Get ATS score
 */
export async function getATSScore(
  source: { file?: File; resumeText?: string } | File,
  jobDescription: string
): Promise<ATSScoreResult> {
  const formData = new FormData();
  if (source instanceof File) {
    formData.append("file", source);
  } else {
    if (source.file) formData.append("file", source.file);
    if (source.resumeText) formData.append("resume_text", source.resumeText);
  }
  formData.append("job_description", jobDescription);

  const res = await fetch(`${getApiUrl()}/api/ats-score`, {
    method: "POST",
    body: formData,
  });

  return handleResponse<ATSScoreResult>(res);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Validate file before upload - robust across Windows, Mac, and Linux
 */
export function validateFile(file: File): string | null {
  if (!file) return "No file selected.";
  if (file.size === 0) return "The selected file is empty (0 bytes). Please select a valid document.";
  const name = file.name ? file.name.toLowerCase() : "";
  const type = file.type ? file.type.toLowerCase() : "";

  const isPdf =
    name.endsWith(".pdf") ||
    type.includes("pdf");

  const isDocx =
    name.endsWith(".docx") ||
    type.includes("word") ||
    type.includes("officedocument") ||
    type.includes("document");

  if (!isPdf && !isDocx) {
    return "Please upload a valid PDF (.pdf) or Word document (.docx).";
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return "File size exceeds the 10MB limit. Please upload a smaller file.";
  }

  return null;
}

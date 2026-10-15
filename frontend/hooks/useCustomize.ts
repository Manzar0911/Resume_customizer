"use client";

import { useState, useCallback } from "react";
import {
  customizeResume,
  CustomizeResult,
  ResumeAPIError,
  validateFile,
} from "@/lib/api";

export type CustomizeStatus =
  | "idle"
  | "validating"
  | "loading"
  | "streaming"
  | "success"
  | "error";

export interface CustomizeState {
  status: CustomizeStatus;
  result: CustomizeResult | null;
  error: string | null;
  progress: number;
  progressMessage: string;
}

const PROGRESS_MESSAGES = [
  { at: 10, msg: "Parsing resume content..." },
  { at: 30, msg: "Analyzing job requirements..." },
  { at: 55, msg: "Crafting customized content..." },
  { at: 80, msg: "Scoring keyword matches..." },
  { at: 95, msg: "Finalizing output..." },
];

export function useCustomize() {
  const [state, setState] = useState<CustomizeState>({
    status: "idle",
    result: null,
    error: null,
    progress: 0,
    progressMessage: "",
  });

  const reset = useCallback(() => {
    setState({
      status: "idle",
      result: null,
      error: null,
      progress: 0,
      progressMessage: "",
    });
  }, []);

  const customize = useCallback(
    async (
      file: File,
      jobDescription: string,
      sections?: string[]
    ): Promise<void> => {
      // Validate inputs
      const fileError = validateFile(file);
      if (fileError) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: fileError,
        }));
        return;
      }

      if (jobDescription.trim().length < 50) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: "Please provide a more detailed job description (at least 50 characters).",
        }));
        return;
      }

      // Start loading with simulated progress
      setState({
        status: "loading",
        result: null,
        error: null,
        progress: 5,
        progressMessage: "Uploading resume...",
      });

      // Simulate progress updates
      let progressInterval: ReturnType<typeof setInterval>;
      let currentStep = 0;

      progressInterval = setInterval(() => {
        if (currentStep < PROGRESS_MESSAGES.length) {
          const step = PROGRESS_MESSAGES[currentStep];
          setState((prev) => {
            if (prev.status !== "loading") return prev;
            return {
              ...prev,
              progress: step.at,
              progressMessage: step.msg,
            };
          });
          currentStep++;
        }
      }, 2000);

      try {
        const result = await customizeResume(file, jobDescription, sections);

        clearInterval(progressInterval);

        setState({
          status: "success",
          result,
          error: null,
          progress: 100,
          progressMessage: "Complete!",
        });
      } catch (err) {
        clearInterval(progressInterval);

        let errorMessage = "Something went wrong. Please try again.";

        if (err instanceof ResumeAPIError) {
          if (err.status === 429) {
            errorMessage =
              "You've made too many requests. Please wait a minute and try again.";
          } else if (err.status === 400) {
            errorMessage = err.message;
          } else if (err.status === 413) {
            errorMessage = "File is too large. Please use a file under 10MB.";
          } else if (err.status >= 500) {
            errorMessage =
              "The AI service is temporarily unavailable. Please try again in a moment.";
          } else {
            errorMessage = err.message;
          }
        }

        setState({
          status: "error",
          result: null,
          error: errorMessage,
          progress: 0,
          progressMessage: "",
        });
      }
    },
    []
  );

  return {
    ...state,
    customize,
    reset,
  };
}

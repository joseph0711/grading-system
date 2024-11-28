import { useEffect, useRef, useState } from "react";

interface AutoSaveOptions {
  onSave: (value?: any) => Promise<void>;
  debounceMs?: number;
  successMessage?: string;
  errorMessage?: string;
}

export const useAutoSave = ({
  onSave,
  debounceMs = 1000,
  successMessage = "Changes saved automatically",
  errorMessage = "Failed to save changes",
}: AutoSaveOptions) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success");
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isFirstRender = useRef(true);
  const pendingValueRef = useRef<any>(null);

  const handleAutoSave = async (value?: any) => {
    console.log("AutoSave triggered with value:", value);

    if (isFirstRender.current) {
      console.log("Skipping first render auto-save");
      isFirstRender.current = false;
      return;
    }

    if (timeoutRef.current) {
      console.log("Clearing previous timeout");
      clearTimeout(timeoutRef.current);
    }

    pendingValueRef.current = value;

    timeoutRef.current = setTimeout(async () => {
      try {
        console.log("Executing auto-save with value:", pendingValueRef.current);
        setIsSaving(true);
        await onSave(pendingValueRef.current);
        setLastSaved(new Date());
        setFeedbackType("success");
        setFeedbackMessage(successMessage);
      } catch (error) {
        console.error("Auto-save error:", error);
        setFeedbackType("error");
        setFeedbackMessage(
          error instanceof Error ? error.message : errorMessage
        );
      } finally {
        setIsSaving(false);
        setTimeout(() => setFeedbackMessage(""), 3000);
      }
    }, debounceMs);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    feedbackMessage,
    feedbackType,
    handleAutoSave,
  };
}; 
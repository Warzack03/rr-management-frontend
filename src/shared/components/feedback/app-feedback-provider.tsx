import { Alert, Snackbar } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type FeedbackSeverity = "success" | "error" | "info" | "warning";

type FeedbackState = {
  open: boolean;
  message: string;
  severity: FeedbackSeverity;
};

type AppFeedbackContextValue = {
  showFeedback: (message: string, severity?: FeedbackSeverity) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
};

const AppFeedbackContext = createContext<AppFeedbackContextValue | null>(null);

export function AppFeedbackProvider({ children }: PropsWithChildren) {
  const [feedback, setFeedback] = useState<FeedbackState>({
    open: false,
    message: "",
    severity: "success"
  });

  const showFeedback = useCallback((message: string, severity: FeedbackSeverity = "success") => {
    setFeedback({
      open: true,
      message,
      severity
    });
  }, []);

  const handleClose = useCallback(() => {
    setFeedback((current) => ({
      ...current,
      open: false
    }));
  }, []);

  const value = useMemo<AppFeedbackContextValue>(
    () => ({
      showFeedback,
      showSuccess: (message) => showFeedback(message, "success"),
      showError: (message) => showFeedback(message, "error")
    }),
    [showFeedback]
  );

  return (
    <AppFeedbackContext.Provider value={value}>
      {children}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        autoHideDuration={2800}
        onClose={handleClose}
        open={feedback.open}
      >
        <Alert elevation={6} onClose={handleClose} severity={feedback.severity} sx={{ width: "100%" }} variant="filled">
          {feedback.message}
        </Alert>
      </Snackbar>
    </AppFeedbackContext.Provider>
  );
}

export function useAppFeedback() {
  const context = useContext(AppFeedbackContext);

  if (!context) {
    throw new Error("useAppFeedback must be used within AppFeedbackProvider");
  }

  return context;
}

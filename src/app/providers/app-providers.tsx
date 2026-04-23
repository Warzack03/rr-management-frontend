import type { PropsWithChildren } from "react";
import { CssBaseline, GlobalStyles, ThemeProvider } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../../shared/api/query-client";
import { AppFeedbackProvider } from "../../shared/components/feedback/app-feedback-provider";
import { muiTheme } from "../../shared/theme/mui-theme";

const globalStyles = (
  <GlobalStyles
    styles={{
      ":root": {
        colorScheme: "light"
      },
      "html, body, #root": {
        minHeight: "100%"
      },
      body: {
        margin: 0,
        background:
          "radial-gradient(circle at top right, rgba(231, 206, 116, 0.28), transparent 26%), linear-gradient(180deg, #f7f9fc 0%, #edf3fa 100%)"
      },
      "*": {
        boxSizing: "border-box"
      },
      a: {
        color: "inherit",
        textDecoration: "none"
      }
    }}
  />
);

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppFeedbackProvider>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          {globalStyles}
          {children}
        </ThemeProvider>
      </AppFeedbackProvider>
    </QueryClientProvider>
  );
}

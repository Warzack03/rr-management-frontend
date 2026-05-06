import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useState } from "react";
import { alpha, CssBaseline, GlobalStyles, ThemeProvider } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../../shared/api/query-client";
import { AppFeedbackProvider } from "../../shared/components/feedback/app-feedback-provider";
import { createAppTheme } from "../../shared/theme/mui-theme";
import { THEME_MODE_STORAGE_KEY, ThemeModeContext } from "../../shared/theme/theme-mode";
import { ThemeToggleFab } from "../../shared/theme/theme-toggle-fab";
import type { ThemeMode } from "../../shared/theme/tokens";

function resolveInitialMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedMode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);
  return storedMode === "dark" ? "dark" : "light";
}

export function AppProviders({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>(resolveInitialMode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  useEffect(() => {
    window.localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  }, [mode]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppFeedbackProvider>
        <ThemeModeContext.Provider
          value={{
            mode,
            toggleMode: () => setMode((currentMode) => (currentMode === "light" ? "dark" : "light"))
          }}
        >
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <GlobalStyles
              styles={{
                ":root": {
                  colorScheme: mode
                },
                "html, body, #root": {
                  minHeight: "100%"
                },
                body: {
                  margin: 0,
                  background:
                    mode === "dark"
                      ? "radial-gradient(circle at top left, rgba(243, 203, 69, 0.18), transparent 24%), radial-gradient(circle at top right, rgba(58, 104, 168, 0.26), transparent 22%), linear-gradient(165deg, #06111d 0%, #0b223d 52%, #07111b 100%)"
                      : "radial-gradient(circle at top right, rgba(231, 206, 116, 0.28), transparent 26%), linear-gradient(180deg, #f7f9fc 0%, #edf3fa 100%)",
                  color: theme.palette.text.primary,
                  transition: "background 240ms ease, color 240ms ease"
                },
                "*": {
                  boxSizing: "border-box"
                },
                "*, *::before, *::after": {
                  transition: "background-color 180ms ease, border-color 180ms ease, color 180ms ease, box-shadow 180ms ease"
                },
                "::-webkit-scrollbar": {
                  width: 10,
                  height: 10
                },
                "::-webkit-scrollbar-thumb": {
                  backgroundColor: alpha(theme.palette.text.primary, mode === "dark" ? 0.22 : 0.18),
                  borderRadius: 999
                },
                a: {
                  color: "inherit",
                  textDecoration: "none"
                }
              }}
            />
            {children}
            <ThemeToggleFab />
          </ThemeProvider>
        </ThemeModeContext.Provider>
      </AppFeedbackProvider>
    </QueryClientProvider>
  );
}

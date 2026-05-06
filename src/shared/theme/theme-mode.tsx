import { createContext, useContext } from "react";
import type { ThemeMode } from "./tokens";

type ThemeModeContextValue = {
  mode: ThemeMode;
  toggleMode: () => void;
};

export const THEME_MODE_STORAGE_KEY = "rr-management-theme-mode";

export const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function useThemeMode() {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error("useThemeMode must be used inside AppProviders.");
  }

  return context;
}

import { DarkModeRounded, LightModeRounded } from "@mui/icons-material";
import { alpha, Fab, useTheme } from "@mui/material";
import { useThemeMode } from "./theme-mode";

export function ThemeToggleFab() {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === "dark";

  return (
    <Fab
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      color="primary"
      onClick={toggleMode}
      variant="extended"
      sx={{
        position: "fixed",
        right: { xs: 16, md: 24 },
        bottom: { xs: 16, md: 24 },
        zIndex: (currentTheme) => currentTheme.zIndex.tooltip + 1,
        minHeight: 58,
        px: 2.2,
        gap: 1,
        color: isDark ? theme.palette.primary.contrastText : theme.palette.text.primary,
        background: isDark
          ? "linear-gradient(135deg, #F3CB45 0%, #FFE596 100%)"
          : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.96)} 0%, ${alpha(theme.palette.background.paper, 0.82)} 100%)`,
        border: `1px solid ${isDark ? alpha("#F3CB45", 0.34) : theme.palette.divider}`,
        boxShadow: isDark
          ? "0 18px 34px rgba(243, 203, 69, 0.22)"
          : "0 18px 34px rgba(32, 59, 95, 0.12)",
        backdropFilter: "blur(18px)",
        "&:hover": {
          background: isDark
            ? "linear-gradient(135deg, #FFD95C 0%, #FFF0B8 100%)"
            : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`
        }
      }}
    >
      {isDark ? <LightModeRounded /> : <DarkModeRounded />}
      {isDark ? "Modo claro" : "Modo oscuro"}
    </Fab>
  );
}

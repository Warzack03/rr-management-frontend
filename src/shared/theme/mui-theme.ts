import { alpha, createTheme } from "@mui/material/styles";
import { tokens } from "./tokens";

export const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: tokens.colors.primary,
      dark: tokens.colors.primary900,
      light: "#5E89C9",
      contrastText: "#FFFFFF"
    },
    secondary: {
      main: tokens.colors.secondary,
      dark: "#C6AE57",
      light: "#F2E5AB",
      contrastText: tokens.colors.primary900
    },
    background: {
      default: tokens.colors.surface,
      paper: tokens.colors.panel
    },
    text: {
      primary: tokens.colors.text,
      secondary: tokens.colors.muted
    },
    success: {
      main: tokens.colors.success
    },
    warning: {
      main: tokens.colors.warning
    },
    error: {
      main: tokens.colors.danger
    },
    divider: tokens.colors.border
  },
  shape: {
    borderRadius: tokens.radius.sm
  },
  typography: {
    fontFamily: "'IBM Plex Sans', sans-serif",
    h1: {
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 700,
      fontSize: "3.5rem",
      lineHeight: 0.95
    },
    h2: {
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 700,
      fontSize: "2.6rem",
      lineHeight: 1
    },
    h3: {
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 600,
      fontSize: "2rem",
      lineHeight: 1.05
    },
    h4: {
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 600,
      fontSize: "1.55rem"
    },
    h5: {
      fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 600,
      fontSize: "1.2rem"
    },
    button: {
      fontWeight: 600,
      textTransform: "none"
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "0 18px 42px rgba(32, 59, 95, 0.08)"
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          border: `1px solid ${tokens.colors.border}`,
          boxShadow: "0 20px 45px rgba(32, 59, 95, 0.08)"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 20,
          minHeight: 44
        },
        containedPrimary: {
          boxShadow: "0 10px 26px rgba(58, 104, 168, 0.28)"
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background:
            "linear-gradient(180deg, rgba(32, 59, 95, 0.98) 0%, rgba(45, 87, 136, 0.98) 100%)",
          color: "#FFFFFF",
          borderRight: "none"
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: alpha("#FFFFFF", 0.84),
          color: tokens.colors.text,
          backdropFilter: "blur(16px)",
          boxShadow: "none",
          borderBottom: `1px solid ${tokens.colors.border}`
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999
        }
      }
    }
  }
});

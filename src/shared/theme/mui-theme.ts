import { alpha, createTheme } from "@mui/material/styles";
import { getColorTokens, tokens, type ThemeMode } from "./tokens";

export function createAppTheme(mode: ThemeMode) {
  const colors = getColorTokens(mode);
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary,
        dark: isDark ? "#8FB8FF" : colors.primary900,
        light: isDark ? "#8CB6FF" : "#5E89C9",
        contrastText: isDark ? "#07111D" : "#FFFFFF"
      },
      secondary: {
        main: colors.secondary,
        dark: isDark ? "#D7AF31" : "#C6AE57",
        light: isDark ? "#FFE596" : "#F2E5AB",
        contrastText: isDark ? "#10161D" : colors.primary900
      },
      background: {
        default: colors.surface,
        paper: colors.panel
      },
      text: {
        primary: colors.text,
        secondary: colors.muted
      },
      success: {
        main: colors.success
      },
      warning: {
        main: colors.warning
      },
      error: {
        main: colors.danger
      },
      divider: colors.border
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
            boxShadow: isDark ? "0 24px 56px rgba(0, 0, 0, 0.28)" : "0 18px 42px rgba(32, 59, 95, 0.08)"
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.md,
            border: `1px solid ${colors.border}`,
            background: isDark
              ? "linear-gradient(160deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.03))"
              : colors.panel,
            boxShadow: isDark ? "0 24px 70px rgba(0, 0, 0, 0.32)" : "0 20px 45px rgba(32, 59, 95, 0.08)"
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
            boxShadow: isDark ? "0 14px 30px rgba(107, 159, 255, 0.24)" : "0 10px 26px rgba(58, 104, 168, 0.28)"
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: isDark
              ? "linear-gradient(180deg, rgba(6, 17, 29, 0.98) 0%, rgba(12, 35, 65, 0.98) 100%)"
              : "linear-gradient(180deg, rgba(32, 59, 95, 0.98) 0%, rgba(45, 87, 136, 0.98) 100%)",
            color: "#FFFFFF",
            borderRight: "none"
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isDark ? alpha("#071629", 0.78) : alpha("#FFFFFF", 0.84),
            color: colors.text,
            backdropFilter: "blur(16px)",
            boxShadow: "none",
            borderBottom: `1px solid ${colors.border}`
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.sm,
            backgroundColor: isDark ? alpha("#FFFFFF", 0.04) : alpha("#FFFFFF", 0.84),
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.border
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? alpha("#FFFFFF", 0.24) : alpha(colors.primary, 0.32)
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderWidth: 1,
              borderColor: isDark ? colors.secondary : colors.primary
            }
          }
        }
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: colors.muted
          }
        }
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            border: `1px solid ${colors.border}`,
            background: isDark
              ? "linear-gradient(160deg, rgba(18, 39, 66, 0.98), rgba(10, 27, 48, 0.98))"
              : colors.panel
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottomColor: colors.border
          },
          head: {
            fontWeight: 700
          }
        }
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: colors.border
          }
        }
      }
    }
  });
}

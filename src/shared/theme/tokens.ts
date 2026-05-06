export type ThemeMode = "light" | "dark";

export const colorTokens = {
  light: {
    primary: "#3A68A8",
    primary900: "#203B5F",
    primary700: "#2F5788",
    primary100: "#DCE7F5",
    secondary: "#E7CE74",
    accent: "#EDCB50",
    surface: "#F7F9FC",
    panel: "#FFFFFF",
    border: "#D8E0EA",
    text: "#16202B",
    muted: "#627283",
    success: "#2D8A57",
    warning: "#C98D16",
    danger: "#C34747"
  },
  dark: {
    primary: "#6B9FFF",
    primary900: "#D9E7FF",
    primary700: "#4F7ED5",
    primary100: "#173154",
    secondary: "#F3CB45",
    accent: "#FFE28A",
    surface: "#071629",
    panel: "#0D2037",
    border: "rgba(255, 255, 255, 0.12)",
    text: "#EEF4FF",
    muted: "#AABDD8",
    success: "#46B97B",
    warning: "#E1AF3E",
    danger: "#DD6C70"
  }
} as const;

export const tokens = {
  layout: {
    sidebarWidth: 288,
    contentMaxWidth: 1440
  },
  radius: {
    xs: 10,
    sm: 14,
    md: 20,
    lg: 28
  }
} as const;

export function getColorTokens(mode: ThemeMode) {
  return colorTokens[mode];
}

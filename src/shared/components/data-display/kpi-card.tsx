import type { ReactNode } from "react";
import { ArrowOutwardRounded } from "@mui/icons-material";
import { alpha, Box, Card, CardContent, Stack, Typography } from "@mui/material";

type KpiCardProps = {
  label: string;
  value: string;
  accent?: "blue" | "gold" | "neutral";
  helper?: string;
  icon?: ReactNode;
};

const accentMap = {
  blue: {
    bg: "rgba(58, 104, 168, 0.12)",
    color: "primary.main"
  },
  gold: {
    bg: "rgba(237, 203, 80, 0.22)",
    color: "warning.main"
  },
  neutral: {
    bg: "rgba(98, 114, 131, 0.12)",
    color: "text.secondary"
  }
} as const;

export function KpiCard({ label, value, helper, icon, accent = "blue" }: KpiCardProps) {
  const palette = accentMap[accent];

  return (
    <Card
      sx={{
        overflow: "hidden",
        position: "relative"
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${alpha("#FFFFFF", 0)} 30%, ${palette.bg} 100%)`,
          pointerEvents: "none"
        }}
      />
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
              {label}
            </Typography>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: palette.bg,
                color: palette.color
              }}
            >
              {icon ?? <ArrowOutwardRounded fontSize="small" />}
            </Box>
          </Stack>

          <Typography
            variant="h2"
            sx={{
              lineHeight: 0.95
            }}
          >
            {value}
          </Typography>

          {helper && <Typography color="text.secondary">{helper}</Typography>}
        </Stack>
      </CardContent>
    </Card>
  );
}

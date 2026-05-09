import type { ReactNode } from "react";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  media?: ReactNode;
};

export function EmptyState({
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
  media
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ alignItems: { xs: "flex-start", sm: "center" } }}>
          {media && <Box sx={{ minWidth: { sm: 140 }, width: { xs: "100%", sm: "auto" } }}>{media}</Box>}
          <Box>
            {eyebrow && (
              <Typography
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  fontWeight: 700,
                  fontSize: 12,
                  color: "primary.main",
                  mb: 0.75
                }}
              >
                {eyebrow}
              </Typography>
            )}
            <Typography variant="h4" sx={{ fontSize: { xs: "1.35rem", sm: "1.55rem" } }}>{title}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 520, fontSize: { xs: "0.95rem", sm: "1rem" } }}>
              {description}
            </Typography>
            {actionLabel && (
              <Button sx={{ mt: 2.5 }} variant="contained" onClick={onAction}>
                {actionLabel}
              </Button>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

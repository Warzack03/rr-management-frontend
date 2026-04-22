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
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
          {media && <Box sx={{ minWidth: 140 }}>{media}</Box>}
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
            <Typography variant="h4">{title}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 520 }}>
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

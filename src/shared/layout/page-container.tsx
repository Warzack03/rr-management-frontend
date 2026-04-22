import type { PropsWithChildren, ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { tokens } from "../theme/tokens";

type PageContainerProps = PropsWithChildren<{
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
}>;

export function PageContainer({
  eyebrow,
  title,
  description,
  actions,
  children
}: PageContainerProps) {
  return (
    <Box
      sx={{
        px: 4,
        py: 4,
        width: "100%"
      }}
    >
      <Box
        sx={{
          mx: "auto",
          maxWidth: tokens.layout.contentMaxWidth
        }}
      >
        {(eyebrow || title || description || actions) && (
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "flex-end",
              justifyContent: "space-between",
              mb: 3.5
            }}
          >
            <Box>
              {eyebrow && (
                <Typography
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: 1.4,
                    fontSize: 12,
                    color: "primary.main",
                    fontWeight: 700,
                    mb: 0.75
                  }}
                >
                  {eyebrow}
                </Typography>
              )}
              {title && <Typography variant="h3">{title}</Typography>}
              {description && (
                <Typography color="text.secondary" sx={{ mt: 0.9, maxWidth: 760 }}>
                  {description}
                </Typography>
              )}
            </Box>
            {actions}
          </Stack>
        )}

        {children}
      </Box>
    </Box>
  );
}

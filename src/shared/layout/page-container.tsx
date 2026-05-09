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
        px: { xs: 2, sm: 3, lg: 4 },
        py: { xs: 2.5, sm: 3, lg: 4 },
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
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              alignItems: { xs: "stretch", sm: "flex-end" },
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
              {title && <Typography variant="h3" sx={{ fontSize: { xs: "1.75rem", sm: "2rem" } }}>{title}</Typography>}
              {description && (
                <Typography color="text.secondary" sx={{ mt: 0.9, maxWidth: 760, fontSize: { xs: "0.95rem", sm: "1rem" } }}>
                  {description}
                </Typography>
              )}
            </Box>
            {actions && (
              <Box
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  "& > .MuiButton-root": {
                    width: { xs: "100%", sm: "auto" }
                  },
                  "& > .MuiStack-root": {
                    width: { xs: "100%", sm: "auto" }
                  }
                }}
              >
                {actions}
              </Box>
            )}
          </Stack>
        )}

        {children}
      </Box>
    </Box>
  );
}

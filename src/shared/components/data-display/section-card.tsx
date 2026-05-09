import type { PropsWithChildren, ReactNode } from "react";
import { Card, CardContent, Stack, Typography } from "@mui/material";

type SectionCardProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  action?: ReactNode;
}>;

export function SectionCard({ title, subtitle, action, children }: SectionCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, overflowX: "auto" }}>
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", sm: "flex-start" }, gap: 2 }}
          >
            <Stack spacing={0.5}>
              <Typography variant="h5" sx={{ fontSize: { xs: "1.1rem", sm: "1.2rem" } }}>{title}</Typography>
              {subtitle && <Typography color="text.secondary" sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}>{subtitle}</Typography>}
            </Stack>
            {action}
          </Stack>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

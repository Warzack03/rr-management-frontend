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
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
            <Stack spacing={0.5}>
              <Typography variant="h5">{title}</Typography>
              {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
            </Stack>
            {action}
          </Stack>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

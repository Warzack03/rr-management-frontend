import { ResponsiveContainer, Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis, Tooltip } from "recharts";
import { alpha, Box, useTheme } from "@mui/material";

type PositionDatum = {
  position: string;
  activePlayers: number;
};

type PositionSummaryChartProps = {
  data: PositionDatum[];
};

const COLORS = ["#3A68A8", "#4F7EC0", "#6A96D1", "#85ADD9", "#D6B84B", "#EDCB50"];

function formatPositionLabel(value: string) {
  return value.replace(/_/g, " ");
}

export function PositionSummaryChart({ data }: PositionSummaryChartProps) {
  const theme = useTheme();
  const colors =
    theme.palette.mode === "dark"
      ? ["#5B90E8", "#76A5F4", "#8DB7FF", "#A5C5FF", "#D6B84B", "#F3CB45"]
      : COLORS;

  return (
    <Box sx={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 6, right: 12, left: 8, bottom: 6 }}>
          <CartesianGrid horizontal={false} stroke={alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.1 : 0.08)} />
          <XAxis
            type="number"
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            width={110}
            dataKey="position"
            tickLine={false}
            axisLine={false}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            tickFormatter={formatPositionLabel}
          />
          <Tooltip
            cursor={{ fill: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.12 : 0.06) }}
            formatter={(value) => [value, "Jugadores activos"]}
            labelFormatter={(label) => formatPositionLabel(String(label))}
            contentStyle={{
              borderRadius: 16,
              border: `1px solid ${theme.palette.divider}`,
              background: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.96 : 0.98),
              color: theme.palette.text.primary,
              boxShadow:
                theme.palette.mode === "dark" ? "0 18px 40px rgba(0, 0, 0, 0.28)" : "0 18px 40px rgba(32, 59, 95, 0.1)"
            }}
          />
          <Bar dataKey="activePlayers" radius={[0, 14, 14, 0]} barSize={18}>
            {data.map((entry, index) => (
              <Cell key={entry.position} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

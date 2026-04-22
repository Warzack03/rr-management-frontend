import { ResponsiveContainer, Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis, Tooltip } from "recharts";
import { Box } from "@mui/material";

type PositionDatum = {
  position: string;
  activePlayers: number;
};

type PositionSummaryChartProps = {
  data: PositionDatum[];
};

const COLORS = ["#3A68A8", "#4F7EC0", "#6A96D1", "#85ADD9", "#D6B84B", "#EDCB50"];

export function PositionSummaryChart({ data }: PositionSummaryChartProps) {
  return (
    <Box sx={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 6, right: 12, left: 8, bottom: 6 }}>
          <CartesianGrid horizontal={false} stroke="#E5ECF4" />
          <XAxis type="number" tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            width={110}
            dataKey="position"
            tickLine={false}
            axisLine={false}
            style={{ fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "rgba(58, 104, 168, 0.06)" }}
            contentStyle={{
              borderRadius: 16,
              border: "1px solid #D8E0EA",
              boxShadow: "0 18px 40px rgba(32, 59, 95, 0.1)"
            }}
          />
          <Bar dataKey="activePlayers" radius={[0, 14, 14, 0]} barSize={18}>
            {data.map((entry, index) => (
              <Cell key={entry.position} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

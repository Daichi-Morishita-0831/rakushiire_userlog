"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface ChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[];
  xKey: string;
  yKey: string;
  yKey2?: string;
  color?: string;
  color2?: string;
  type?: "line" | "bar";
  formatY?: (value: number) => string;
  height?: number;
}

export function SimpleChart({
  data,
  xKey,
  yKey,
  yKey2,
  color = "#2563eb",
  color2 = "#f59e0b",
  type = "line",
  formatY,
  height = 250,
}: ChartProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatXLabel = (value: any) => {
    const str = String(value);
    if (str.includes("-")) {
      const parts = str.split("-");
      if (parts.length === 3) return `${parts[1]}/${parts[2]}`;
      if (parts.length === 2) return `${parts[1]}月`;
    }
    return str;
  };

  if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={xKey} tickFormatter={formatXLabel} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={formatY} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value: number | undefined) => {
              const v = value ?? 0;
              return formatY ? formatY(v) : v;
            }}
            labelFormatter={formatXLabel}
          />
          <Bar dataKey={yKey} fill={color} radius={[2, 2, 0, 0]} />
          {yKey2 && <Bar dataKey={yKey2} fill={color2} radius={[2, 2, 0, 0]} />}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey={xKey} tickFormatter={formatXLabel} tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={formatY} tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(value: number | undefined) => {
            const v = value ?? 0;
            return formatY ? formatY(v) : v;
          }}
          labelFormatter={formatXLabel}
        />
        <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={false} />
        {yKey2 && (
          <Line type="monotone" dataKey={yKey2} stroke={color2} strokeWidth={2} dot={false} />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

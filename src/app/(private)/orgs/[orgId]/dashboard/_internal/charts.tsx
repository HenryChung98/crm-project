import React from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ["#2563eb", "#7c3aed", "#db2777", "#ea580c", "#ca8a04", "#16a34a"];

interface ChartProps {
  data: Array<{ name: string; value: number }>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    [key: string]: any;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 text-slate-100 text-xs rounded-lg px-3 py-2 shadow-md">
      <p className="font-medium">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name}>
          <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

export const BarChartComponent = ({ data }: ChartProps) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const PieChartComponent = ({ data }: ChartProps) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name}: ${(percent! * 100).toFixed(0)}%`}
        outerRadius={100}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
    </PieChart>
  </ResponsiveContainer>
);

export const LineChartComponent = ({ data }: ChartProps) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
      <Tooltip content={<CustomTooltip />} />
      <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);

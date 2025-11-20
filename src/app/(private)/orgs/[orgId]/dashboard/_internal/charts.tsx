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
  LabelList,
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
    dataKey?: string;
    [key: string]: any;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 text-slate-100 text-xs rounded-lg px-3 py-2 shadow-md">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }}>
          <span className="font-medium">{entry.dataKey || entry.name}: </span>
          <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

export const BarChartComponent = ({ data }: ChartProps) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 40, right: 10, left: 0, bottom: 20 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          tickFormatter={(name, index) => `${name} (${data[index].value})`}
        />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <text
          x="50%"
          y={20}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#9e9e9e"
          className="font-semibold"
        >
          Total: {total}
        </text>
        <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

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

interface LineChartProps {
  data: Array<{ name: string; [key: string]: string | number }>;
  dataKeys?: string[];
}

export const LineChartComponent = ({ data, dataKeys }: LineChartProps) => {
  const keys =
    dataKeys || (data.length > 0 ? Object.keys(data[0]).filter((k) => k !== "name") : ["value"]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        {keys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={key}
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
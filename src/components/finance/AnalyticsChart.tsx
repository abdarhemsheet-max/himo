"use client";

import { GlassCard } from "@/components/ui";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { name: "يناير", income: 18000, expenses: 8500 },
  { name: "فبراير", income: 22000, expenses: 9200 },
  { name: "مارس", income: 19500, expenses: 7800 },
  { name: "أبريل", income: 25000, expenses: 10500 },
  { name: "مايو", income: 23000, expenses: 9800 },
  { name: "يونيو", income: 25400, expenses: 10780 },
];

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[rgba(15,20,30,0.9)] backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-xl">
        <p className="text-sm text-primary mb-1">{label}</p>
        {payload.map((entry) => (
          <p
            key={entry.name}
            className="text-xs tabular-nums"
            style={{ color: entry.color }}
          >
            {entry.name === "income" ? "الدخل: " : "المصروفات: "}
            {entry.value.toLocaleString("ar-SA")} ر.س
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsChart() {
  return (
    <GlassCard className="p-5" hover={false}>
      <h3 className="text-sm font-medium text-secondary mb-4">
        الدخل مقابل المصروفات
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 8 }}
              formatter={(value) =>
                value === "income" ? "الدخل" : "المصروفات"
              }
            />
            <Bar
              dataKey="income"
              fill="#10B981"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="expenses"
              fill="#EF4444"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

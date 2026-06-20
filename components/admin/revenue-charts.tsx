"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type MonthlyRevenue = { month: string; revenue: number };

function formatIDR(value: number) {
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `Rp${(value / 1_000).toFixed(0)}rb`;
  return `Rp${value}`;
}

export default function RevenueCharts({ monthlyRevenue }: { monthlyRevenue: MonthlyRevenue[] }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthlyRevenue} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatIDR} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={56} />
          <Tooltip
            formatter={(value) => [`Rp${Number(value).toLocaleString("id-ID")}`, "Revenue"]}
            contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff", fontSize: 12, color: "#1e293b" }}
            cursor={{ fill: "rgba(0,0,0,0.03)" }}
          />
          <Bar dataKey="revenue" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

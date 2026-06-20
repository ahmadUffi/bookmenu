"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type GrowthPoint = { month: string; users: number };
type ScanPoint = { name: string; scans: number };
type PlanPoint = { plan: string; count: number };

type Props = {
  userGrowth: GrowthPoint[];
  topScans: ScanPoint[];
  planDistribution: PlanPoint[];
};

const PIE_COLORS = ["#94a3b8", "#3b82f6", "#22c55e", "#f97316", "#ef4444"];

const tooltipStyle = {
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  fontSize: 12,
  color: "#1e293b",
};

export default function AnalyticsCharts({ userGrowth, topScans, planDistribution }: Props) {
  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-800">User Growth</h2>
          <p className="text-xs text-slate-400">Kumulatif user baru per bulan (12 bulan)</p>
        </div>
        <div className="p-5 h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userGrowth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#e2e8f0" }} />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: "#3b82f6" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-800">Top QR Scans</h2>
            <p className="text-xs text-slate-400">10 user terbanyak scan</p>
          </div>
          <div className="p-5 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topScans} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                <Bar dataKey="scans" fill="#dc2626" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-800">Plan Distribution</h2>
            <p className="text-xs text-slate-400">Distribusi plan aktif</p>
          </div>
          <div className="p-5 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planDistribution}
                  dataKey="count"
                  nameKey="plan"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {planDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}

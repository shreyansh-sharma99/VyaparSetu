import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  UserPlus,
  RefreshCcw,
  TrendingDown,
  ArrowUpRight,
  XCircle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import ComponentCard from "@/components/common/ComponentCard";
import PageMeta from "@/components/common/PageMeta";
import type { AppDispatch, RootState } from "@/store";
import { fetchSubscriptionReport } from "./services/subscriptionReportSlice";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const TENURE_COLORS: Record<string, string> = {
  monthly: "#3b82f6",
  yearly: "#10b981",
  halfYearly: "#f59e0b",
  quarterly: "#8b5cf6",
};

export default function SubscriptionReport() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.subscriptionReport
  );

  useEffect(() => {
    dispatch(fetchSubscriptionReport());
  }, [dispatch]);

  /* ── Loading ─────────────────────────────────────── */
  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 px-4">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-500 animate-pulse text-center">
          Loading subscription report…
        </p>
      </div>
    );
  }

  /* ── Error ───────────────────────────────────────── */
  if (error && !data) {
    return (
      <div className="p-6 sm:p-12 text-center bg-white dark:bg-gray-900 rounded-3xl border border-red-100 shadow-2xl max-w-lg mx-auto my-8">
        <XCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to Load</h3>
        <p className="text-sm text-gray-500 mb-5">{error}</p>
        <button
          onClick={() => dispatch(fetchSubscriptionReport())}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const pieData = Object.entries(data.byTenure).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    tenure: key,
  }));

  const kpiCards = [
    { label: "New This Month", value: data.newThisMonth, icon: UserPlus, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", positive: true },
    { label: "Renewals", value: data.renewals, icon: RefreshCcw, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", positive: true },
    { label: "Upgrades", value: data.upgrades, icon: ArrowUpRight, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20", positive: true },
    { label: "Cancellations", value: data.cancellations, icon: TrendingDown, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20", positive: false },
  ];

  const totalByTenure = Object.values(data.byTenure).reduce((a, b) => a + b, 0);

  return (
    <>
      <PageMeta
        title="Subscription Report | VyaparSetu"
        description="Monthly subscription metrics including new signups, renewals, upgrades, cancellations and tenure distribution."
      />

      <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* ── Header + KPI Cards ─────────────────────── */}
        <ComponentCard
          title="Subscription Report"
          desc="Monthly subscription lifecycle metrics and tenure distribution"
          rightButtonNode={
            <button
              onClick={() => dispatch(fetchSubscriptionReport())}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-md"
            >
              <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden xs:inline">Refresh</span>
            </button>
          }
        >
          {/* 2 col mobile → 4 col lg */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
            {kpiCards.map((stat, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border bg-white dark:bg-gray-900 p-4 sm:p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className={`p-2.5 sm:p-3 rounded-xl ${stat.bg} ${stat.color} w-fit mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</p>
                <div className={`mt-2 text-[10px] font-black px-2 py-0.5 rounded-full w-fit ${stat.positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                  {stat.positive ? "↑" : "↓"} This Month
                </div>
                <div className="absolute -bottom-8 -right-8 h-20 w-20 bg-gray-50 dark:bg-white/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
              </div>
            ))}
          </div>
        </ComponentCard>

        {/* ── Tenure Distribution ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

          {/* Pie chart */}
          <ComponentCard title="Tenure Distribution" desc="Subscription breakdown by billing cycle">
            <div className="h-[240px] sm:h-[280px] mt-3 sm:mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={6}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                    cornerRadius={8}
                    animationDuration={1500}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={TENURE_COLORS[entry.tenure] || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)", fontSize: "12px" }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ComponentCard>

          {/* Progress bars */}
          <ComponentCard title="Tenure Breakdown" desc="Detailed count per billing frequency">
            <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              {Object.entries(data.byTenure).map(([tenure, count], i) => {
                const pct = ((count / (totalByTenure || 1)) * 100).toFixed(1);
                const color = TENURE_COLORS[tenure] || COLORS[i % COLORS.length];
                return (
                  <div key={tenure} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300 capitalize">{tenure}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-gray-900 dark:text-white">{count}</span>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded-full">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}

              <div className="mt-4 p-3 sm:p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-between">
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">Total Subscriptions</span>
                <span className="text-xl font-black text-blue-700 dark:text-blue-300">{totalByTenure}</span>
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* ── Monthly Activity Summary ───────────────── */}
        <ComponentCard
          title="Monthly Activity Summary"
          desc="Key lifecycle events this month at a glance"
        >
          {/* 2 col mobile → 4 col sm */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4">
            {[
              {
                label: "Net New",
                value: data.newThisMonth - data.cancellations,
                bg: data.newThisMonth - data.cancellations >= 0
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100"
                  : "bg-rose-50 dark:bg-rose-900/20 border-rose-100",
                textColor: data.newThisMonth - data.cancellations >= 0 ? "text-emerald-700" : "text-rose-700",
              },
              {
                label: "Churn",
                value: `${((data.cancellations / (data.newThisMonth || 1)) * 100).toFixed(1)}%`,
                bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-100",
                textColor: "text-amber-700",
              },
              {
                label: "Renewal Rate",
                value: data.renewals,
                bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-100",
                textColor: "text-blue-700",
              },
              {
                label: "Upgrades",
                value: data.upgrades,
                bg: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100",
                textColor: "text-indigo-700",
              },
            ].map((item, i) => (
              <div key={i} className={`p-4 sm:p-5 rounded-2xl border ${item.bg} text-center`}>
                <p className={`text-[10px] font-black uppercase tracking-widest ${item.textColor} opacity-70 leading-tight`}>
                  {item.label}
                </p>
                <p className={`text-xl sm:text-2xl font-black ${item.textColor} mt-2`}>{item.value}</p>
              </div>
            ))}
          </div>
        </ComponentCard>

      </div>
    </>
  );
}

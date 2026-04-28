import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IndianRupee,
  TrendingUp,
  CheckCircle2,
  Clock,
  X,
  Search,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import ComponentCard from "@/components/common/ComponentCard";
import PageMeta from "@/components/common/PageMeta";
import type { AppDispatch, RootState } from "@/store";
import { fetchRevenueReport } from "./services/revenueReportSlice";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatRaw(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function RevenueReport() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.revenueReport
  );

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const isFiltered = !!(appliedFrom && appliedTo);

  useEffect(() => {
    dispatch(fetchRevenueReport({}));
  }, [dispatch]);

  const handleApply = () => {
    if (!fromDate || !toDate) return;
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    dispatch(fetchRevenueReport({ from: fromDate, to: toDate }));
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setAppliedFrom("");
    setAppliedTo("");
    dispatch(fetchRevenueReport({}));
  };

  /* ── Loading ─────────────────────────────────────── */
  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 px-4">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-500 animate-pulse text-center">
          Loading revenue report…
        </p>
      </div>
    );
  }

  /* ── Error ───────────────────────────────────────── */
  if (error && !data) {
    return (
      <div className="p-6 sm:p-12 text-center bg-white dark:bg-gray-900 rounded-3xl border border-red-100 shadow-2xl max-w-lg mx-auto my-8">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
          Failed to Load
        </h3>
        <p className="text-sm text-gray-500 mb-5">{error}</p>
        <button
          onClick={() => dispatch(fetchRevenueReport({}))}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  /* ── Date Picker ─────────────────────────────────── */
  // Stacks vertically on mobile, row on sm+
  const DatePickerNode = (
    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-2 w-full sm:w-auto">
      {/* From */}
      <div className="flex flex-col gap-1 w-full sm:w-auto">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">From</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      {/* To */}
      <div className="flex flex-col gap-1 w-full sm:w-auto">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">To</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="w-full sm:w-auto border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 sm:self-end">
        <button
          onClick={handleApply}
          disabled={!fromDate || !toDate || loading}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-md"
        >
          <Search className="h-3.5 w-3.5" />
          Apply
        </button>
        {isFiltered && (
          <button
            onClick={handleReset}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-xl font-bold text-sm transition-all"
          >
            <X className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <PageMeta
        title="Revenue Report | VyaparSetu"
        description="Detailed revenue analytics showing MRR, ARR, collections, and plan-wise breakdown."
      />

      <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* ── Header + Date Filter + KPI Cards ─────── */}
        <ComponentCard
          title="Revenue Report"
          desc={isFiltered ? `Filtered: ${appliedFrom} → ${appliedTo}` : "All-time revenue analytics"}
          rightButtonNode={DatePickerNode}
        >
          {data && (
            /* 1 col → 2 sm → 4 lg */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
              {[
                { label: "MRR", value: formatRaw(data.mrr), icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", desc: "Monthly Recurring Revenue" },
                { label: "ARR", value: formatRaw(data.arr), icon: IndianRupee, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20", desc: "Annual Recurring Revenue" },
                { label: "Collected", value: formatRaw(data.totalCollected), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", desc: "Total amount received" },
                { label: "Pending", value: formatRaw(data.totalPending), icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", desc: "Awaiting payment" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border bg-white dark:bg-gray-900 p-4 sm:p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className={`p-2.5 sm:p-3 rounded-xl ${stat.bg} ${stat.color} w-fit mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1 break-all">{stat.value}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1">{stat.desc}</p>
                  <div className="absolute -bottom-8 -right-8 h-20 w-20 bg-gray-50 dark:bg-white/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
                </div>
              ))}
            </div>
          )}
        </ComponentCard>

        {data && (
          <>
            {/* ── Monthly Trend + By Plan ──────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

              {/* Area chart — full width on mobile */}
              <ComponentCard
                title="Monthly Revenue Trend"
                desc="Revenue collected month by month"
                className="lg:col-span-7"
              >
                <div className="h-[200px] sm:h-[260px] mt-3 sm:mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.monthlyTrend.map((t) => ({
                        name: `${MONTHS[t._id.month - 1]} ${String(t._id.year).slice(-2)}`,
                        total: t.total,
                      }))}
                      margin={{ left: 0, right: 8, top: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 10 }}
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                        width={48}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)", fontSize: "12px" }}
                        formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fill="url(#revGrad)"
                        dot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 3, stroke: "#fff" }}
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ComponentCard>

              {/* Plan progress bars */}
              <ComponentCard
                title="Revenue by Plan"
                desc="Plan-wise revenue contribution"
                className="lg:col-span-5"
              >
                <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                  {data.byPlan.map((p, i) => {
                    const pct = ((p.total / (data.totalCollected || 1)) * 100).toFixed(1);
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold gap-2">
                          <span className="text-gray-600 dark:text-gray-300 truncate">{p.planName}</span>
                          <span className="text-gray-900 dark:text-white whitespace-nowrap shrink-0">{formatRaw(p.total)}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                          />
                        </div>
                        <p className="text-[10px] font-bold text-gray-400">{pct}% of collected</p>
                      </div>
                    );
                  })}
                </div>
              </ComponentCard>
            </div>

            {/* ── By Tenure ─────────────────────────── */}
            <ComponentCard
              title="Revenue by Tenure"
              desc="Breakdown of revenue by subscription tenure"
            >
              {/* Wraps: 1 col on xs, then flex-wrap on larger */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
                {Object.entries(data.byTenure).map(([tenure, amount], i) => (
                  <div
                    key={tenure}
                    className="p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-center hover:border-blue-200 transition-all"
                  >
                    <div className="h-3 w-3 rounded-full mx-auto mb-2 sm:mb-3" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 capitalize">{tenure}</p>
                    <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mt-1">{formatRaw(amount)}</p>
                  </div>
                ))}
              </div>
            </ComponentCard>
          </>
        )}
      </div>
    </>
  );
}

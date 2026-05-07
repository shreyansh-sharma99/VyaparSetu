import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  TrendingDown,
  UserCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import ComponentCard from "@/components/common/ComponentCard";
import PageMeta from "@/components/common/PageMeta";
import type { AppDispatch, RootState } from "@/store";
import { fetchAdminReport } from "./services/adminReportSlice";
import { formatDateWithTiming } from "@/components/common/dateFormat";
import AdvanceTable from "@/components/Tables/AdvanceTable";
import Loader from "@/components/UI/Loader";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

export default function AdminReport() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.adminReport
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchAdminReport());
  }, [dispatch]);

  /* ── Loading ─────────────────────────────────────── */
  if (loading && !data) {
    return (
      <ComponentCard title="Admin Report"><Loader /></ComponentCard>
    );
  }

  /* ── Error ───────────────────────────────────────── */
  if (error) {
    return (
      <div className="p-6 sm:p-12 text-center bg-white dark:bg-gray-900 rounded-3xl border border-red-100 shadow-2xl max-w-lg mx-auto my-8">
        <XCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
          Failed to Load
        </h3>
        <p className="text-sm text-gray-500 mb-5">{error}</p>
        <button
          onClick={() => dispatch(fetchAdminReport())}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  /* ── Data ────────────────────────────────────────── */
  const statCards = [
    { label: "Total", value: data.total, icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Active", value: data.active, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Trialing", value: data.trialing, icon: Clock, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Suspended", value: data.suspended, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20" },
    { label: "Expired", value: data.expired, icon: TrendingDown, color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-900/20" },
    { label: "Cancelled", value: data.cancelled, icon: XCircle, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
  ];

  const byPlanData = data.byPlan.filter((p) => p._id !== null);

  const tableHeaders = [
    { label: "Name", key: "name" as const },
    { label: "Email", key: "email" as const },
    { label: "Business", key: "businessName" as const },
    { label: "Plan", key: "planName" as const },
    { label: "Tenure", key: "planTenure" as const },
    { label: "Status", key: "subscriptionStatus" as const },
    { label: "Extensions", key: "trialExtensionsCount" as const },
    { label: "Registered", key: "createdAt" as const },
  ];

  const tableRows = data.recentAdmins.map((a) => ({
    ...a,
    planName: a.plan?.name || "No Plan",
    planTenure: a.planTenure || "—",
    createdAt: formatDateWithTiming(a.createdAt),
  }));

  const filteredRows = tableRows.filter((row) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      row.name?.toLowerCase().includes(query) ||
      row.email?.toLowerCase().includes(query) ||
      row.businessName?.toLowerCase().includes(query) ||
      row.planName?.toLowerCase().includes(query) ||
      row.subscriptionStatus?.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <PageMeta
        title="Admin Report | VyaparSetu"
        description="Comprehensive admin report showing total admins, status breakdown, plan distribution and recent signups."
      />

      <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* ── Header + KPI Cards ─────────────────────── */}
        <ComponentCard
          title="Admin Report"
        // desc="Overview of all admins, subscription statuses, and plan distribution"
        >
          {/* 2 cols mobile → 3 sm → 6 lg */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 pt-2">
            {statCards.map((stat, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border bg-white dark:bg-gray-900 p-4 sm:p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className={`p-2.5 sm:p-3 rounded-xl ${stat.bg} ${stat.color} w-fit mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 sm:mt-1 leading-tight">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </ComponentCard>

        {/* ── Chart Row ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

          {/* Bar chart */}
          <ComponentCard
            title="Admins by Plan"
            desc="Distribution of admins across subscription plans"
          >
            {/* Adaptive height: smaller on mobile */}
            <div className="h-[220px] sm:h-[280px] mt-3 sm:mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={byPlanData}
                  layout="vertical"
                  margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="planName"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                    width={90}
                  />
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={18}>
                    {byPlanData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend grid: 1 col on xs, 2 on sm */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
              {byPlanData.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs font-bold text-gray-500 truncate">{p.planName}</span>
                  </div>
                  <span className="text-xs font-black text-gray-800 dark:text-white ml-2 shrink-0">{p.count}</span>
                </div>
              ))}
            </div>
          </ComponentCard>

          {/* Status breakdown */}
          <ComponentCard
            title="Status Breakdown"
            desc="Admin subscription lifecycle status"
          >
            <div className="space-y-3 mt-3 sm:mt-4">
              {[
                { label: "Active", value: data.active, color: "bg-emerald-500" },
                { label: "Trialing", value: data.trialing, color: "bg-blue-500" },
                { label: "Cancelled", value: data.cancelled, color: "bg-orange-500" },
                { label: "Suspended", value: data.suspended, color: "bg-rose-500" },
                { label: "Expired", value: data.expired, color: "bg-gray-400" },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                    <span className="text-gray-900 dark:text-white tabular-nums">
                      {item.value} / {data.total}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-700`}
                      style={{ width: `${((item.value / (data.total || 1)) * 100).toFixed(1)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-3">
              <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-center">
                <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Active Rate</p>
                <p className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-300">
                  {((data.active / (data.total || 1)) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-center">
                <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Trial Rate</p>
                <p className="text-lg sm:text-xl font-black text-blue-700 dark:text-blue-300">
                  {((data.trialing / (data.total || 1)) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* ── Recent Admins Table ────────────────────── */}
        <ComponentCard
          title="Recent Admins"
          desc="Latest admin registrations and their subscription status"
          rightButtonNode={
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <UserCheck className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-black text-blue-600">{filteredRows.length} Shown</span>
            </div>
          }
        >
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[600px] sm:min-w-0 px-4 sm:px-0">
              <AdvanceTable
                headers={tableHeaders}
                rows={filteredRows}
                loading={loading}
                maxHeight="380px"
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
          </div>
        </ComponentCard>

      </div>
    </>
  );
}

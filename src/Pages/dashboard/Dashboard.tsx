import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  TrendingUp,
  IndianRupee,
  Activity,
  CreditCard,
  UserPlus,
  RefreshCcw,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  PieChart as PieChartIcon,
  BarChart3,
  AlertCircle,
  Zap,
  ArrowRightLeft,
  ShieldCheck,
  Receipt,
  Layers,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
  type TooltipProps,
} from "recharts";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import type { AppDispatch, RootState } from "../../store";
import { fetchDashboardData } from "./services/dashboardSlice";
import { formatDateWithTiming } from "../../components/common/dateFormat";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-white/10 p-5 rounded-[2rem] shadow-2xl ring-1 ring-black/5">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">{label}</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-6 p-2 rounded-xl bg-blue-50/50 dark:bg-blue-500/10">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Revenue</span>
            </div>
            <span className="text-sm font-black text-blue-600 dark:text-blue-400">₹{payload[0].value?.toLocaleString()}</span>
          </div>
          {payload[1] && (
            <div className="flex items-center justify-between gap-6 p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/10">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Invoices</span>
              </div>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{payload[1].value}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.dashboard);
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
        </div>
        <p className="text-sm font-medium text-gray-500 animate-pulse">Syncing dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-3xl border border-red-100 dark:border-red-900/20 shadow-2xl max-w-2xl mx-auto my-12">
        <div className="h-20 w-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sync Failed</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{error}</p>
        <button
          onClick={() => dispatch(fetchDashboardData())}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/25 active:scale-95"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { revenue, admins, subscriptions, invoices, plans, activity, reconciliation } = data;

  const mainStats = [
    {
      label: "MRR (Monthly)",
      value: `₹${revenue.mrr.inr}`,
      trend: revenue.mrrGrowthPercent ? `${revenue.mrrGrowthPercent > 0 ? '+' : ''}${revenue.mrrGrowthPercent}%` : null,
      positive: (revenue.mrrGrowthPercent || 0) >= 0,
      icon: IndianRupee,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      description: `ARR: ₹${revenue.arr.inr}`
    },
    {
      label: "This Month",
      value: `₹${revenue.thisMonthRevenue.inr}`,
      trend: revenue.lastMonthRevenue.paise > 0 ? `vs ₹${revenue.lastMonthRevenue.inr}` : "First Month",
      positive: revenue.thisMonthRevenue.paise >= revenue.lastMonthRevenue.paise,
      icon: TrendingUp,
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      description: `Last Month: ₹${revenue.lastMonthRevenue.inr}`
    },
    {
      label: "Total Collected",
      value: `₹${revenue.totalCollected.inr}`,
      trend: `${revenue.totalCollected.invoiceCount} Invoices`,
      positive: true,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      description: "Successfully processed"
    },
    {
      label: "Total Pending",
      value: `₹${revenue.totalPending.inr}`,
      trend: `${revenue.totalPending.invoiceCount} Invoices`,
      positive: false,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      description: "Awaiting payment"
    },
    {
      label: "Total Failed",
      value: `₹${revenue.totalFailed.inr}`,
      trend: `${revenue.totalFailed.invoiceCount} Events`,
      positive: false,
      icon: XCircle,
      color: "text-rose-600",
      bg: "bg-rose-50 dark:bg-rose-900/20",
      description: "Payment failures"
    },
    {
      label: "Active Businesses",
      value: admins.totals.total.toString(),
      trend: `+${admins.growth.newThisMonth}`,
      positive: true,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      description: `${admins.growth.newToday} joined today`
    },
    {
      label: "Subscriptions",
      value: subscriptions.totals.total.toString(),
      trend: `${subscriptions.thisMonth.netNew} Net New`,
      positive: subscriptions.thisMonth.netNew > 0,
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      description: `${subscriptions.totals.active} Active • ${subscriptions.totals.trialing} Trial`
    },
    {
      label: "Churn Rate",
      value: `${admins.churnRatePercent}%`,
      trend: admins.atRiskCount > 0 ? `${admins.atRiskCount} at risk` : "Healthy",
      positive: parseFloat(admins.churnRatePercent) < 5,
      icon: AlertCircle,
      color: "text-rose-600",
      bg: "bg-rose-50 dark:bg-rose-900/20",
      description: "Admin churn index"
    },
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // To make the graph look better when there's only one data point, we add a zero-baseline point
  const rawTrend = [...revenue.monthlyTrend];
  if (rawTrend.length === 1) {
    const first = rawTrend[0];
    const prevMonth = first.month === 1 ? 12 : first.month - 1;
    const prevYear = first.month === 1 ? first.year - 1 : first.year;
    rawTrend.unshift({
      invoiceCount: 0,
      year: prevYear,
      month: prevMonth,
      totalPaise: 0,
      totalINR: 0
    });
  }

  const trendData = rawTrend.map(item => ({
    name: months[item.month - 1],
    revenue: item.totalINR,
    invoices: item.invoiceCount
  }));

  return (
    <>
      <PageMeta
        title="Executive Dashboard | VyaparSetu"
        description="Detailed business intelligence and executive dashboard for VyaparSetu platform monitoring."
      />

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Header Card */}
        <ComponentCard
          title="Dashboard"
          desc={`Live System Status • ${formatDateWithTiming(data.generatedAt)}`}
          rightButtonNode={
            <div className="flex items-center gap-3">
              <button
                onClick={() => dispatch(fetchDashboardData())}
                className="group p-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
              >
                <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              </button>
            </div>
          }
        >
          {/* Hero Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
            {mainStats.map((stat, i) => (
              <div key={i} className="group relative overflow-hidden rounded-3xl border bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-all group-hover:scale-110 group-hover:rotate-3`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  {stat.trend && (
                    <div className={`flex items-center text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${stat.positive ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"}`}>
                      {stat.trend}
                      {stat.positive ? <ArrowUpRight className="ml-1 h-3 w-3" /> : <ArrowDownRight className="ml-1 h-3 w-3" />}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{stat.value}</p>
                  <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-amber-500" />
                    {stat.description}
                  </p>
                </div>
                <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-gray-50 dark:bg-white/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all duration-700" />
              </div>
            ))}
          </div>
        </ComponentCard>

        {/* Revenue Analytics & Plan Mix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <ComponentCard
            title="Revenue Performance"
            className="lg:col-span-8 overflow-hidden"
            desc="Monthly growth and invoice volume visualization"
          >
            <div className="h-[400px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="invoiceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#10b981', fontSize: 10, fontWeight: 700 }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                    dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 4, stroke: "#fff", fill: '#3b82f6' }}
                    animationBegin={0}
                    animationDuration={2000}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="invoices"
                    stroke="#10b981"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#invoiceGrad)"
                    dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 4, stroke: "#fff", fill: '#10b981' }}
                    animationBegin={500}
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-8 mt-4 pb-2 border-t border-gray-50 dark:border-white/5 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenue Growth</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice Volume</span>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard
            title="Revenue by Tenure"
            className="lg:col-span-4"
            desc="Monthly vs Annual commitment"
          >
            <div className="h-[300px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenue.byTenure}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={10}
                    dataKey="totalPaise"
                    nameKey="tenure"
                    stroke="#fff"
                    strokeWidth={2}
                    cornerRadius={12}
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {revenue.byTenure.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)', fontSize: '12px', padding: '12px 20px' }}
                  />
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
                  <p className="text-lg font-black text-gray-900 dark:text-white">₹{revenue.mrr.inr}</p>
                </div>
              </ResponsiveContainer>
              <div className="mt-6 space-y-3">
                {revenue.byTenure.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs font-bold text-gray-500 capitalize">{t.tenure}</span>
                    </div>
                    <span className="text-xs font-black text-gray-900 dark:text-white">₹{t.totalINR}</span>
                  </div>
                ))}
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* Collection & Financial Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ComponentCard title="Collection Pipeline" desc="Current month invoicing status">
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase mb-1">Collected</p>
                  <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">₹{revenue.totalCollected.inr}</p>
                  <p className="text-[10px] font-bold text-emerald-600/60">{revenue.totalCollected.invoiceCount} Invoices</p>
                </div>
                <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                  <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase mb-1">Pending</p>
                  <p className="text-xl font-black text-amber-700 dark:text-amber-300">₹{revenue.totalPending.inr}</p>
                  <p className="text-[10px] font-bold text-amber-600/60">{revenue.totalPending.invoiceCount} Invoices</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-400">Aging (30-60 Days)</span>
                  <span className="text-gray-900 dark:text-white">₹{invoices.agingBuckets['31_60_days'].inr}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${(parseFloat(invoices.agingBuckets['31_60_days'].inr) / (parseFloat(revenue.totalPending.inr) || 1)) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-400">Aging (90+ Days)</span>
                  <span className="text-gray-900 dark:text-white">₹{invoices.agingBuckets['90_plus_days'].inr}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-900 rounded-full"
                    style={{ width: `${(parseFloat(invoices.agingBuckets['90_plus_days'].inr) / (parseFloat(revenue.totalPending.inr) || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-100 dark:border-rose-500/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="text-[10px] font-bold uppercase">Total Failed: ₹{revenue.totalFailed.inr} ({revenue.totalFailed.invoiceCount} events)</span>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Admin Growth Mix" desc="New registrations by product plan">
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={admins.byPlan} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="planName"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={20}>
                    {admins.byPlan.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Most Popular</p>
                <p className="text-sm font-black text-gray-900 dark:text-white">{plans.mostPopularPlan.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase">Retention Rate</p>
                <p className="text-sm font-black text-blue-600">{(100 - parseFloat(admins.churnRatePercent)).toFixed(1)}%</p>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Platform Health" desc="System reconciliation & events">
            <div className="space-y-6 mt-4">
              <div className="flex items-center gap-4 p-4 rounded-3xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase">Discrepancies</p>
                  <p className="text-2xl font-black text-blue-900 dark:text-blue-300">{reconciliation.totalDiscrepanciesLast7Days}</p>
                  <p className="text-[10px] font-bold text-blue-600/60">Last 7 days scan</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Payment Status</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                    <p className="text-[10px] font-bold text-emerald-600">Success</p>
                    <p className="text-lg font-black text-emerald-700">{activity.paymentEventStats.success}</p>
                  </div>
                  <div className="text-center p-2 rounded-2xl bg-rose-50 dark:bg-rose-500/10">
                    <p className="text-[10px] font-bold text-rose-600">Failed</p>
                    <p className="text-lg font-black text-rose-700">{activity.paymentEventStats.failed}</p>
                  </div>
                  <div className="text-center p-2 rounded-2xl bg-gray-50 dark:bg-gray-500/10">
                    <p className="text-[10px] font-bold text-gray-500">Ignored</p>
                    <p className="text-lg font-black text-gray-700">{activity.paymentEventStats.ignored}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button className="w-full py-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                  <ArrowRightLeft className="h-4 w-4" />
                  Run Reconciliation
                </button>
              </div>
            </div>
          </ComponentCard>
        </div>

        {/* Data Lists Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Invoices */}
          <div className="lg:col-span-2">
            <ComponentCard title="Recent Transactions" desc="Latest billing collection events">
              <div className="overflow-x-auto mt-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/5">
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Business</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                    {invoices.recentInvoices.slice(0, 6).map((inv) => (
                      <tr key={inv._id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-gray-400" />
                            <span className="text-xs font-bold text-gray-900 dark:text-white">{inv.invoiceNumber}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{inv.adminId.name}</p>
                          <p className="text-[10px] font-bold text-gray-400">{inv.planId.name}</p>
                        </td>
                        <td className="py-4">
                          <span className="text-xs font-black text-gray-900 dark:text-white">₹{inv.totalAmount.toLocaleString()}</span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                              inv.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'
                            }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <span className="text-[10px] font-bold text-gray-400">{formatDateWithTiming(inv.createdAt)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="w-full mt-6 py-3 text-xs font-black text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-2xl transition-all flex items-center justify-center gap-1 uppercase tracking-widest">
                View Ledger <ChevronRight className="h-4 w-4" />
              </button>
            </ComponentCard>
          </div>

          {/* Subscriptions Activity */}
          <ComponentCard title="Subscription Pulse" desc="Recent lifecycle events">
            <div className="space-y-4 mt-4">
              {subscriptions.recentActivity.slice(0, 6).map((activity) => (
                <div key={activity._id} className="relative pl-6 pb-6 last:pb-0 border-l-2 border-gray-100 dark:border-white/5">
                  <div className={`absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${activity.status === 'active' ? 'bg-emerald-500' :
                      activity.status === 'trialing' ? 'bg-blue-500' :
                        'bg-rose-500'
                    }`} />
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{activity.adminId.name}</p>
                      <span className="text-[10px] font-black text-gray-400 whitespace-nowrap">{formatDateWithTiming(activity.updatedAt)}</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 mb-2">
                      {activity.planId.name} • {activity.tenure}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${activity.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          activity.status === 'trialing' ? 'bg-blue-100 text-blue-700' :
                            'bg-rose-100 text-rose-700'
                        }`}>
                        {activity.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-[9px] font-black text-gray-500 uppercase">
                        {activity.history[0]?.action}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ComponentCard>
        </div>

        {/* Plans Adoption Full Table */}
        <ComponentCard title="Plan Adoption Details" desc="Usage and capacity by plan tier">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {plans.adoption.map((plan) => (
              <div key={plan._id} className="p-5 rounded-3xl border border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/5 hover:border-blue-200 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                    <Layers className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-[10px] font-black text-blue-600 uppercase">Tier: {plan.planName.split(' ')[0]}</span>
                </div>
                <p className="text-sm font-black text-gray-900 dark:text-white mb-4 line-clamp-1">{plan.planName}</p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-gray-400">Utilization</span>
                    <span className="text-gray-900 dark:text-white">{plan.active} / {plan.total}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500" style={{ width: `${(plan.active / (plan.total || 1)) * 100}%` }} />
                    <div className="h-full bg-blue-200" style={{ width: `${(plan.trialing / (plan.total || 1)) * 100}%` }} />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Trialing</span>
                      <span className="text-xs font-black text-gray-900 dark:text-white">{plan.trialing}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Base Price</span>
                      <span className="text-xs font-black text-emerald-600">₹{(plan.basePricePaise / 100).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ComponentCard>

        {/* Recent Signups Full Table */}
        <ComponentCard title="Recent Signups" desc="New business registrations and onboarding status">
          <div className="overflow-x-auto mt-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5">
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Business</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan & Tenure</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {admins.recentSignups.map((signup) => (
                  <tr key={signup._id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{signup.businessName}</p>
                      <p className="text-[10px] font-bold text-gray-400">{signup.onboardingStatus.replace('_', ' ')}</p>
                    </td>
                    <td className="py-4">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{signup.name}</p>
                      <p className="text-[10px] font-bold text-gray-400">{signup.email}</p>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`w-fit px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${signup.subscriptionStatus === 'active' ? 'bg-emerald-50 text-emerald-600' :
                            signup.subscriptionStatus === 'trialing' ? 'bg-blue-50 text-blue-600' :
                              'bg-amber-50 text-amber-600'
                          }`}>
                          {signup.subscriptionStatus}
                        </span>
                        {signup.trialExtensionsCount > 0 && (
                          <span className="text-[8px] font-bold text-blue-500 uppercase">
                            {signup.trialExtensionsCount} Extension(s)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{signup.plan?.name || 'No Plan Selected'}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{signup.planTenure || 'N/A'}</p>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-[10px] font-bold text-gray-400">{formatDateWithTiming(signup.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}

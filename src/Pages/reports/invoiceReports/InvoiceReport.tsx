import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  RefreshCcw,
} from "lucide-react";
import ComponentCard from "@/components/common/ComponentCard";
import PageMeta from "@/components/common/PageMeta";
import type { AppDispatch, RootState } from "@/store";
import { fetchInvoiceReport } from "./services/invoiceReportSlice";
import { formatDateWithTiming } from "@/components/common/dateFormat";
import AdvanceTable from "@/components/Tables/AdvanceTable";

export default function InvoiceReport() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector(
    (state: RootState) => state.invoiceReport
  );

  useEffect(() => {
    dispatch(fetchInvoiceReport());
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
          Loading invoice report…
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
          onClick={() => dispatch(fetchInvoiceReport())}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  /* ── Table data ──────────────────────────────────── */
  const tableHeaders = [
    { label: "Invoice #", key: "invoiceNumber" as const },
    { label: "Admin", key: "adminName" as const },
    { label: "Email", key: "adminEmail" as const },
    { label: "Plan", key: "planName" as const },
    { label: "Tenure", key: "tenure" as const },
    { label: "Amount", key: "totalAmountFormatted" as const },
    { label: "Status", key: "status" as const },
    { label: "Due Date", key: "dueDateFormatted" as const },
    { label: "Paid At", key: "paidAtFormatted" as const },
  ];

  const tableRows = data.recentInvoices.map((inv) => ({
    ...inv,
    adminName: inv.adminId.name,
    adminEmail: inv.adminId.email,
    planName: inv.planId.name,
    totalAmountFormatted: `₹${inv.totalAmount.toLocaleString("en-IN")}`,
    dueDateFormatted: formatDateWithTiming(inv.dueDate),
    paidAtFormatted: inv.paidAt ? formatDateWithTiming(inv.paidAt) : "—",
  }));

  const collectionPct = (
    (data.totalPaid / ((data.totalPaid + data.totalPending) || 1)) * 100
  ).toFixed(1);

  const agingTotal = data.aging["0_30"] + data.aging["30_60"] + data.aging["60_plus"];

  return (
    <>
      <PageMeta
        title="Invoice Report | VyaparSetu"
        description="Invoice analytics showing paid, pending, overdue amounts and aging buckets."
      />

      <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* ── Header + KPI Cards ─────────────────────── */}
        <ComponentCard
          title="Invoice Report"
          desc="Invoice collection status, aging analysis and recent transactions"
          rightButtonNode={
            <button
              onClick={() => dispatch(fetchInvoiceReport())}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-md"
            >
              <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden xs:inline">Refresh</span>
            </button>
          }
        >
          {/* 1 col → 3 col sm */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
            {[
              { label: "Total Paid", value: `₹${data.totalPaid.toLocaleString("en-IN")}`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", desc: "Successfully collected" },
              { label: "Total Pending", value: `₹${data.totalPending.toLocaleString("en-IN")}`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", desc: "Awaiting payment" },
              { label: "Total Overdue", value: `₹${data.totalOverdue.toLocaleString("en-IN")}`, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20", desc: "Past due date" },
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
        </ComponentCard>

        {/* ── Collection Health + Aging ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

          {/* Collection Health */}
          <ComponentCard title="Collection Health" desc="Ratio of paid vs pending invoices">
            <div className="mt-3 sm:mt-4 space-y-4 sm:space-y-5">

              {/* Rate + Bar */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
                <div className="shrink-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Collection Rate</p>
                  <p className="text-3xl sm:text-4xl font-black text-emerald-600 mt-1">{collectionPct}%</p>
                </div>
                <div className="flex-1 sm:pb-1">
                  <div className="h-3 sm:h-4 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${collectionPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Paid / Pending mini-cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                  <p className="text-[10px] font-black text-emerald-600 uppercase">Paid</p>
                  <p className="text-base sm:text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1 break-all">
                    ₹{data.totalPaid.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                  <p className="text-[10px] font-black text-amber-600 uppercase">Pending</p>
                  <p className="text-base sm:text-xl font-black text-amber-700 dark:text-amber-300 mt-1 break-all">
                    ₹{data.totalPending.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Overdue alert */}
              {data.totalOverdue > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 text-rose-600">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="text-xs font-bold uppercase leading-snug">
                    Overdue: ₹{data.totalOverdue.toLocaleString("en-IN")} — Requires attention
                  </span>
                </div>
              )}
            </div>
          </ComponentCard>

          {/* Aging Buckets */}
          <ComponentCard title="Invoice Aging" desc="Pending invoice distribution by age">
            <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              {[
                { label: "0–30 Days", value: data.aging["0_30"], color: "bg-amber-400", textColor: "text-amber-700", bg: "bg-amber-50 dark:bg-amber-900/20" },
                { label: "30–60 Days", value: data.aging["30_60"], color: "bg-orange-500", textColor: "text-orange-700", bg: "bg-orange-50 dark:bg-orange-900/20" },
                { label: "60+ Days", value: data.aging["60_plus"], color: "bg-rose-600", textColor: "text-rose-700", bg: "bg-rose-50 dark:bg-rose-900/20" },
              ].map((bucket, i) => {
                const pct = agingTotal > 0 ? ((bucket.value / agingTotal) * 100).toFixed(1) : "0";
                return (
                  <div key={i} className={`p-3 sm:p-4 rounded-2xl border ${bucket.bg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-bold ${bucket.textColor}`}>{bucket.label}</span>
                      <span className={`text-base sm:text-lg font-black ${bucket.textColor} break-all ml-2`}>
                        ₹{bucket.value.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/60 dark:bg-black/20 rounded-full overflow-hidden">
                      <div className={`h-full ${bucket.color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className={`text-[10px] font-bold ${bucket.textColor} mt-1 opacity-70`}>{pct}% of aging</p>
                  </div>
                );
              })}
            </div>
          </ComponentCard>
        </div>

        {/* ── Recent Invoices Table ──────────────────── */}
        <ComponentCard
          title="Recent Invoices"
          desc="Latest invoice transactions across all admins"
          rightButtonNode={
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <Receipt className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-black text-blue-600">{data.recentInvoices.length} Records</span>
            </div>
          }
        >
          {/* Horizontal scroll on mobile */}
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[700px] sm:min-w-0 px-4 sm:px-0">
              <AdvanceTable
                headers={tableHeaders}
                rows={tableRows}
                loading={loading}
                maxHeight="420px"
              />
            </div>
          </div>
        </ComponentCard>

      </div>
    </>
  );
}

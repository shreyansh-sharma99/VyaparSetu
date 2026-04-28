import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { fetchInvoices } from "./services/invoiceSlice";
import AdvanceTable from "../../components/Tables/AdvanceTable";
import ComponentCard from "../../components/common/ComponentCard";
import { formatDateWithTiming } from "../../components/common/dateFormat";
import PageMeta from "@/components/common/PageMeta";
import StatusToggle from "../../components/form/input/StatusToggle";

const Invoice: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { invoices, loading, error, meta } = useSelector((state: RootState) => state.invoice);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [status, setStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setCurrentPage(1);
    }, [status]);

    useEffect(() => {
        dispatch(fetchInvoices({
            page: currentPage,
            limit: pageSize,
            status: status === "all" ? undefined : status
        }));
    }, [dispatch, currentPage, pageSize, status]);

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        // Backend search might not be implemented for invoices, but we'll keep the state
    };

    const tableRows = invoices.map((invoice) => ({
        ...invoice,
        id: invoice._id,
        adminName: invoice.adminId?.name || "N/A",
        adminEmail: invoice.adminId?.email || "N/A",
        planName: invoice.planId?.name || "N/A",
        amount: `${invoice.currency} ${invoice.totalAmount.toLocaleString()}`,
        statusDisplay: invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1),
        invoiceDate: formatDateWithTiming(invoice.createdAt),
        dueDateDisplay: formatDateWithTiming(invoice.dueDate),
    }));

    const headers = [
        { label: "Invoice Number", key: "invoiceNumber", value: "checked" as const },
        { label: "Admin Name", key: "adminName", value: "checked" as const },
        { label: "Email", key: "adminEmail", value: "checked" as const },
        { label: "Plan", key: "planName", value: "checked" as const },
        { label: "Amount", key: "amount", value: "checked" as const },
        { label: "Status", key: "statusDisplay", value: "checked" as const },
        { label: "Created At", key: "invoiceDate", value: "checked" as const },
        { label: "Due Date", key: "dueDateDisplay", value: "checked" as const },
    ];

    const handlePageChange = (page: number, size?: number) => {
        setCurrentPage(page);
        if (size) setPageSize(size);
    };

    const statusOptions = [
        { label: "All Status", value: "all" },
        { label: "Paid", value: "paid" },
        { label: "Pending", value: "pending" },
        { label: "Failed", value: "failed" },
        { label: "Free", value: "free" },
    ];

    return (
        <div className="">
            <PageMeta title="Invoices | VyaparSetu" description="Manage and view all system invoices" />
            <ComponentCard
                title="Invoice List"
                rightButtonNode={
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-gray-100 dark:bg-white/5 p-1 rounded-lg h-11">
                            {statusOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setStatus(opt.value)}
                                    className={`h-full px-4 rounded-md text-sm font-medium transition-all duration-200 ${status === opt.value
                                        ? "bg-white dark:bg-blue-600 shadow-sm text-blue-600 dark:text-white"
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                }
            >
                <AdvanceTable
                    headers={headers as any}
                    rows={tableRows}
                    loading={loading}
                    error={error}
                    searchQuery={searchQuery}
                    setSearchQuery={handleSearchChange}
                    showAddButton={false}
                    checkboxHeading="Action"
                    currentPage={currentPage}
                    total={meta?.total || 0}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    maxHeight="calc(100vh - 350px)"
                />
            </ComponentCard>
        </div>
    );
};

export default Invoice;

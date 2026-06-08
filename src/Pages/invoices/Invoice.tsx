import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import { fetchInvoices, setSearchQuery, setStatusFilter, setPagination } from "./services/invoiceSlice";
import AdvanceTable from "../../components/Tables/AdvanceTable";
import ComponentCard from "../../components/common/ComponentCard";
import { formatDateWithTiming } from "../../components/common/dateFormat";
import PageMeta from "@/components/common/PageMeta";
import { encryptData } from "@/utility/crypto";
import { usePermission } from "@/utility/permission";
import Select from "../../components/form/Select";

const Invoice: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { pagePermissions } = usePermission();
    const { invoices, loading, error, meta, searchQuery, statusFilter, pagination } = useSelector((state: RootState) => state.invoice);

    useEffect(() => {
        dispatch(fetchInvoices({
            page: pagination.currentPage,
            limit: pagination.pageSize,
            status: statusFilter === "all" ? undefined : statusFilter,
            search: searchQuery
        }));
    }, [dispatch, pagination.currentPage, pagination.pageSize, statusFilter, searchQuery]);

    const handleSearchChange = (query: string) => {
        console.log(query, "query")
        dispatch(setSearchQuery(query));
    };

    const handleStatusChange = (val: string) => {
        dispatch(setStatusFilter(val));
    };

    const handlePageChange = (page: number, size?: number) => {
        dispatch(setPagination({ currentPage: page, pageSize: size || pagination.pageSize }));
    };

    const handleViewInvoice = (id: string) => {
        const encryptedId = encodeURIComponent(encryptData(id));
        navigate(`/Invoices/view/${encryptedId}`);
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status?.toLowerCase()) {
            case "paid": return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400";
            case "pending": return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400";
            case "failed": return "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-400";
            case "free": return "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400";
            case "waived": return "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-400";
            default: return "bg-gray-50 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400";
        }
    };
    // draft, open, paid, overdue, cancelled, waived
    const tableRows = invoices.map((invoice) => ({
        ...invoice,
        id: invoice._id,
        adminName: invoice.adminId?.name || "N/A",
        adminEmail: invoice.adminId?.email || "N/A",
        planName: invoice.planId?.name || "N/A",
        amount: `${invoice.currency} ${invoice.totalAmount.toLocaleString()}`,
        statusDisplay: (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide ${getStatusBadgeClass(invoice.status)}`}>
                {invoice.status}
            </span>
        ),
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


    const statusOptions = [
        { label: "All Status", value: "all" },
        { label: "Draft", value: "draft" },
        { label: "Open", value: "open" },
        { label: "Paid", value: "paid" },
        { label: "Overdue", value: "overdue" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Waived", value: "waived" },
    ];

    return (
        <div className="">
            <PageMeta title="Invoices | VyaparSetu" description="Manage and view all system invoices" />
            <ComponentCard
                title="Invoice List"
                rightButtonNode={
                    <div className="w-44">
                        <Select
                            options={statusOptions}
                            value={statusFilter}
                            onChange={handleStatusChange}
                            placeholder="Filter by Status"
                        />
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
                    currentPage={pagination.currentPage}
                    total={meta?.total || 0}
                    pageSize={pagination.pageSize}
                    onPageChange={handlePageChange}
                    maxHeight="calc(100vh - 350px)"
                    onView={pagePermissions.canRead ? (row: any) => handleViewInvoice(row._id) : undefined}
                />
            </ComponentCard>
        </div>
    );
};

export default Invoice;

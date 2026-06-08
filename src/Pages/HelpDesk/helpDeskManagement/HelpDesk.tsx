import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import { fetchTickets } from "../services/helpDeskSlice";
import AdvanceTable from "../../../components/Tables/AdvanceTable";
import ComponentCard from "../../../components/common/ComponentCard";
import { formatDateWithTiming } from "../../../components/common/dateFormat";
import PageMeta from "@/components/common/PageMeta";
import Select from "../../../components/form/Select";
import { usePermission } from "@/utility/permission";

const HelpDesk: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { pagePermissions } = usePermission();

    const { tickets, loading, error, pagination } = useSelector((state: RootState) => state.helpDesk);

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    useEffect(() => {
        const params: any = {
            page: currentPage,
            limit: pageSize,
            search: searchQuery
        };

        if (statusFilter !== "all") params.status = statusFilter;
        if (categoryFilter !== "all") params.category = categoryFilter;
        if (priorityFilter !== "all") params.priority = priorityFilter;

        dispatch(fetchTickets(params));
    }, [dispatch, currentPage, pageSize, searchQuery, statusFilter, categoryFilter, priorityFilter]);

    const handleSearchChange = (query: string) => setSearchQuery(query);
    const handlePageChange = (page: number, size?: number) => {
        setCurrentPage(page);
        if (size) setPageSize(size);
    };

    const handleView = (ticket: any) => {
        navigate(`/HelpDesk/view/${ticket._id}`);
    };

    const tableRows = tickets?.map((ticket) => ({
        ...ticket,
        id: ticket._id,
        date: formatDateWithTiming(ticket.createdAt),
        category: ticket?.category?.replace('_', ' ')?.toUpperCase(),
        statusBadge: (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ticket.status === 'open' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    ticket.status === 'closed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                {(ticket.status || "N/A").toUpperCase().replace('_', ' ')}
            </span>
        ),
        priorityBadge: (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ticket.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                ticket.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                {(ticket.priority || "N/A").toUpperCase()}
            </span>
        )
    })) || [];

    const headers = [
        { label: "Ticket ID", key: "ticketId", value: "checked" as const },
        { label: "Subject", key: "subject", value: "checked" as const },
        { label: "Category", key: "category", value: "checked" as const },
        { label: "Priority", key: "priorityBadge", value: "checked" as const },
        { label: "Status", key: "statusBadge", value: "checked" as const },
        { label: "Created At", key: "date", value: "checked" as const }
    ];

    return (
        <div>
            <PageMeta title="HelpDesk | VyaparSetu" description="Manage all support tickets" />
            <ComponentCard
                title="Support Tickets"
                rightButtonNode={
                    <div className="flex items-center gap-3">
                        <div className="w-40">
                            <Select
                                value={statusFilter}
                                options={[
                                    { label: "All Statuses", value: "all" },
                                    { label: "Open", value: "open" },
                                    { label: "Assigned", value: "assigned" },
                                    { label: "In Progress", value: "in_progress" },
                                    { label: "Waiting", value: "waiting_on_merchant" },
                                    { label: "Resolved", value: "resolved" },
                                    { label: "Closed", value: "closed" },
                                ]}
                                onChange={(val: string) => setStatusFilter(val)}
                            />
                        </div>
                        <div className="w-40">
                            <Select
                                value={categoryFilter}
                                options={[
                                    { label: "All Categories", value: "all" },
                                    { label: "Billing", value: "billing" },
                                    { label: "Technical", value: "technical" },
                                    { label: "Storefront", value: "storefront" },
                                    { label: "Custom Domain", value: "custom_domain" },
                                    { label: "Other", value: "other" },
                                ]}
                                onChange={(val: string) => setCategoryFilter(val)}
                            />
                        </div>
                        <div className="w-40">
                            <Select
                                value={priorityFilter}
                                options={[
                                    { label: "All Priorities", value: "all" },
                                    { label: "Low", value: "low" },
                                    { label: "Medium", value: "medium" },
                                    { label: "High", value: "high" },
                                    { label: "Urgent", value: "urgent" },
                                ]}
                                onChange={(val: string) => setPriorityFilter(val)}
                            />
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
                    onView={pagePermissions.canRead ? handleView : undefined}
                    // customActions={(row: any) => (
                    //     <button onClick={() => handleView(row)} className="text-blue-600 hover:text-blue-800 transition-colors" title="View Ticket">
                    //         <Eye className="w-5 h-5" strokeWidth={1.75} />
                    //     </button>
                    // )}
                    checkboxHeading="Action"
                    currentPage={pagination?.page || 1}
                    total={pagination?.total || 0}
                    pageSize={pagination?.limit || 20}
                    onPageChange={handlePageChange}
                    maxHeight="calc(100vh - 350px)"
                />
            </ComponentCard>
        </div>
    );
};

export default HelpDesk;

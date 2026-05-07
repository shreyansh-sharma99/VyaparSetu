import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { fetchSubscriptions } from "./services/subscriptionSlice";
import { useNavigate } from "react-router-dom";
import { encryptData } from "@/utility/crypto";

import AdvanceTable from "../../components/Tables/AdvanceTable";
import ComponentCard from "../../components/common/ComponentCard";
import { formatDateWithTiming } from "../../components/common/dateFormat";

import PageMeta from "@/components/common/PageMeta";
import Select from "../../components/form/Select";

const Subscription: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { subscriptions, loading, error, meta } = useSelector(
        (state: RootState) => state.subscription
    );


    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [status, setStatus] = useState("all");
    const [tenure, setTenure] = useState("all");


    useEffect(() => {
        setCurrentPage(1);
    }, [status, tenure, searchQuery]);

    useEffect(() => {
        dispatch(
            fetchSubscriptions({
                page: currentPage,
                limit: pageSize,
                search: searchQuery,
                status: status === "all" ? undefined : status,
                tenure: tenure === "all" ? undefined : tenure,
            })
        );
    }, [dispatch, currentPage, pageSize, searchQuery, status, tenure]);

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
    };

    const handlePageChange = (page: number, size?: number) => {
        setCurrentPage(page);
        if (size) setPageSize(size);
    };

    const handleView = (sub: any) => {
        const encryptedId = encodeURIComponent(encryptData(sub._id));
        navigate(`/Subscriptions/view/${encryptedId}`);
    };

    const tableRows = subscriptions.map((sub) => ({
        ...sub,
        id: sub._id,
        adminName: sub.adminId?.name || "N/A",
        adminEmail: sub.adminId?.email || "N/A",
        planName: sub.planId?.name || "N/A",
        formattedStartDate: formatDateWithTiming(sub.startDate),
        formattedEndDate: formatDateWithTiming(sub.endDate),
        statusBadge: (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sub.status === "active"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : sub.status === "cancelled"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : sub.status === "trialing"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}>
                {(sub.status || "inactive").toUpperCase()}
            </span>
        ),
    }));

    const headers = [
        { label: "Admin Name", key: "adminName", value: "checked" as const },
        { label: "Email", key: "adminEmail", value: "checked" as const },
        { label: "Plan", key: "planName", value: "checked" as const },
        { label: "Tenure", key: "tenure", value: "checked" as const },
        { label: "Status", key: "statusBadge", value: "checked" as const },
        { label: "Start Date", key: "formattedStartDate", value: "checked" as const },
        { label: "End Date", key: "formattedEndDate", value: "checked" as const },
        // { label: "Razorpay ID", key: "razorpaySubscriptionId", value: "checked" as const },
    ];

    const statusOptions = [
        { label: "All Status", value: "all" },
        { label: "Trialing", value: "trialing" },
        { label: "Active", value: "active" },
        { label: "Past Due", value: "past_due" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Expired", value: "expired" },
    ];

    const tenureOptions = [
        { label: "All Tenure", value: "all" },
        { label: "Trial", value: "trial" },
        { label: "Monthly", value: "monthly" },
        { label: "Quarterly", value: "quarterly" },
        { label: "Half Yearly", value: "halfYearly" },
        { label: "Yearly", value: "yearly" },
    ];

    return (
        <div className="">
            <PageMeta
                title="Subscriptions | VyaparSetu"
                description="Manage all owner subscriptions"
            />
            <ComponentCard
                title="Subscription Lists"
                rightButtonNode={
                    <div className="flex gap-3">
                        <div className="w-44">
                            <Select
                                options={statusOptions}
                                value={status}
                                onChange={(val) => setStatus(val)}
                                placeholder="Filter by Status"
                            />
                        </div>
                        <div className="w-44">
                            <Select
                                options={tenureOptions}
                                value={tenure}
                                onChange={(val) => setTenure(val)}
                                placeholder="Filter by Tenure"
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
                    onView={handleView}
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

export default Subscription;

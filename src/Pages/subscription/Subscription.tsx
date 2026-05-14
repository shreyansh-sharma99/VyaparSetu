import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { fetchSubscriptions, setSearchQuery, setStatusFilter, setTenureFilter, setPagination } from "./services/subscriptionSlice";
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
    const { subscriptions, loading, error, meta, searchQuery, statusFilter, tenureFilter, pagination } = useSelector(
        (state: RootState) => state.subscription
    );

    useEffect(() => {
        dispatch(
            fetchSubscriptions({
                page: pagination.currentPage,
                limit: pagination.pageSize,
                search: searchQuery,
                status: statusFilter === "all" ? undefined : statusFilter,
                tenure: tenureFilter === "all" ? undefined : tenureFilter,
            })
        );
    }, [dispatch, pagination.currentPage, pagination.pageSize, searchQuery, statusFilter, tenureFilter]);

    const handleSearchChange = (query: string) => {
        dispatch(setSearchQuery(query));
    };

    const handleStatusChange = (val: string) => {
        dispatch(setStatusFilter(val));
    };

    const handleTenureChange = (val: string) => {
        dispatch(setTenureFilter(val));
    };

    const handlePageChange = (page: number, size?: number) => {
        dispatch(setPagination({ currentPage: page, pageSize: size || pagination.pageSize }));
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
                                value={statusFilter}
                                onChange={handleStatusChange}
                                placeholder="Filter by Status"
                            />
                        </div>
                        <div className="w-44">
                            <Select
                                options={tenureOptions}
                                value={tenureFilter}
                                onChange={handleTenureChange}
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
                    currentPage={pagination.currentPage}
                    total={meta?.total || 0}
                    pageSize={pagination.pageSize}
                    onPageChange={handlePageChange}
                    maxHeight="calc(100vh - 350px)"
                />
            </ComponentCard>
        </div>

    );
};

export default Subscription;

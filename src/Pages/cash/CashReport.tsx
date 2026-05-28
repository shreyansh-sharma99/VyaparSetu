import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import { fetchCashReport, handleApproveHandover, handleRejectHandover } from "./services/cashSlice";
import AdvanceTable from "../../components/Tables/AdvanceTable";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "@/components/common/PageMeta";
import { decryptData } from "../../utility/crypto";
import { formatDateWithTiming } from "../../components/common/dateFormat";
import { toast } from "react-toastify";

const CashReport: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { userId } = useParams<{ userId: string }>();
    const { report, reportLoading, error } = useSelector((state: RootState) => state.cash);
    const [activeTab, setActiveTab] = useState<'collections' | 'handovers'>('collections');

    useEffect(() => {
        if (userId) {
            try {
                const decryptedId = decryptData(decodeURIComponent(userId));
                if (decryptedId) {
                    dispatch(fetchCashReport(decryptedId));
                }
            } catch (error) {
                toast.error("Invalid User ID");
                navigate("/Cash/ledger");
            }
        }
    }, [dispatch, userId, navigate]);

    const handleApprove = async (handoverId: string) => {
        const result = await dispatch(handleApproveHandover(handoverId));
        if (handleApproveHandover.fulfilled.match(result)) {
            toast.success("Handover approved successfully");
            if (userId) {
                const decryptedId = decryptData(decodeURIComponent(userId));
                if (decryptedId) {
                    dispatch(fetchCashReport(decryptedId));
                }
            }
        } else {
            toast.error(result.payload as string || "Failed to approve");
        }
    };

    const handleReject = async (handoverId: string) => {
        const result = await dispatch(handleRejectHandover(handoverId));
        if (handleRejectHandover.fulfilled.match(result)) {
            toast.success("Handover rejected successfully");
            if (userId) {
                const decryptedId = decryptData(decodeURIComponent(userId));
                if (decryptedId) {
                    dispatch(fetchCashReport(decryptedId));
                }
            }
        } else {
            toast.error(result.payload as string || "Failed to reject");
        }
    };

    const collectionRows = report?.collections.map((item) => ({
        ...item,
        id: item._id,
        adminName: item.admin?.name || "N/A",
        businessName: item.admin?.businessName || "N/A",
        planName: item.plan?.name || "N/A",
        amountStr: `₹${item.amount.toLocaleString('en-IN')}`,
        date: formatDateWithTiming(item.createdAt),
    })) || [];

    const collectionHeaders = [
        { label: "Date", key: "date", value: "checked" as const },
        { label: "Admin Name", key: "adminName", value: "checked" as const },
        { label: "Business Name", key: "businessName", value: "checked" as const },
        { label: "Plan", key: "planName", value: "checked" as const },
        { label: "Amount", key: "amountStr", value: "checked" as const },
        { label: "Notes", key: "notes", value: "checked" as const },
    ];

    const handoverRows = report?.handovers.map((item: any) => ({
        ...item,
        id: item._id,
        amountStr: `₹${item.amount?.toLocaleString('en-IN') || 0}`,
        status: item.status || "Pending",
        date: formatDateWithTiming(item.createdAt),
        action: item.status === 'pending' ? (
            <div className="flex gap-2">
                <button onClick={() => handleApprove(item._id)} className="px-3 py-1 bg-green-500 text-white rounded text-xs">Approve</button>
                <button onClick={() => handleReject(item._id)} className="px-3 py-1 bg-red-500 text-white rounded text-xs">Reject</button>
            </div>
        ) : item.status
    })) || [];

    const handoverHeaders = [
        { label: "Date", key: "date", value: "checked" as const },
        { label: "Amount", key: "amountStr", value: "checked" as const },
        { label: "Status", key: "status", value: "checked" as const },
        { label: "Action", key: "action", value: "checked" as const },
    ];

    return (
        <div className="">
            <PageMeta title="Cash Report | VyaparSetu" description="View cash report details" />
            
            <div className="flex gap-4 mb-4">
                <button 
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'collections' ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
                    onClick={() => setActiveTab('collections')}
                >
                    Collections
                </button>
                <button 
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'handovers' ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
                    onClick={() => setActiveTab('handovers')}
                >
                    Handovers
                </button>
            </div>

            <ComponentCard title={activeTab === 'collections' ? "Collections" : "Handovers"}>
                {activeTab === 'collections' ? (
                    <AdvanceTable
                        headers={collectionHeaders as any}
                        rows={collectionRows}
                        loading={reportLoading}
                        error={error}
                        showAddButton={false}
                        maxHeight="calc(100vh - 280px)"
                    />
                ) : (
                    <AdvanceTable
                        headers={handoverHeaders as any}
                        rows={handoverRows}
                        loading={reportLoading}
                        error={error}
                        showAddButton={false}
                        maxHeight="calc(100vh - 280px)"
                    />
                )}
            </ComponentCard>
        </div>
    );
};

export default CashReport;

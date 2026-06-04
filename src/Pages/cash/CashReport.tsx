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
import { Loader2 } from "lucide-react";

const CashReport: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { userId } = useParams<{ userId: string }>();
    const { report, reportLoading, reportError, actionLoading } = useSelector((state: RootState) => state.cash);
    const [activeTab, setActiveTab] = useState<'collections' | 'handovers'>('collections');
    const [pendingAction, setPendingAction] = useState<{ id: string, type: 'approve' | 'reject' } | null>(null);

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
        setPendingAction({ id: handoverId, type: 'approve' });
        try {
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
        } finally {
            setPendingAction(null);
        }
    };

    const handleReject = async (handoverId: string) => {
        setPendingAction({ id: handoverId, type: 'reject' });
        try {
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
        } finally {
            setPendingAction(null);
        }
    };

    const collectionRows = report?.collections.map((item) => ({
        ...item,
        id: item._id,
        adminName: item.admin?.name || "N/A",
        businessName: item.admin?.businessName || "N/A",
        planName: item.plan?.name || "N/A",
        amountStr: `₹${(item.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
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
        amountStr: `₹${((item.amount || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        status: item.status === 'pending_approval' ? 'Pending Approval' : item.status.replace('_', ' ').toUpperCase(),
        date: formatDateWithTiming(item.createdAt),
        action: (item.status === 'pending' || item.status === 'pending_approval') ? (
            <div className="flex gap-2">
                <button
                    onClick={() => handleApprove(item._id)}
                    disabled={actionLoading || !!pendingAction}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                >
                    {pendingAction?.id === item._id && pendingAction?.type === 'approve' ? (
                        <>
                            <Loader2 className="h-3 w-3 animate-spin" /> Approving...
                        </>
                    ) : (
                        "Approve"
                    )}
                </button>
                <button
                    onClick={() => handleReject(item._id)}
                    disabled={actionLoading || !!pendingAction}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-rose-500/20 active:scale-95 disabled:opacity-50"
                >
                    {pendingAction?.id === item._id && pendingAction?.type === 'reject' ? (
                        <>
                            <Loader2 className="h-3 w-3 animate-spin" /> Rejecting...
                        </>
                    ) : (
                        "Reject"
                    )}
                </button>
            </div>
        ) : (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                item.status === 'approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                item.status === 'rejected' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
                'bg-gray-100 text-gray-500 dark:bg-gray-800'
            }`}>
                {item.status.replace('_', ' ')}
            </span>
        )
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
                        error={reportError}
                        showAddButton={false}
                        maxHeight="calc(100vh - 280px)"
                    />
                ) : (
                    <AdvanceTable
                        headers={handoverHeaders as any}
                        rows={handoverRows}
                        loading={reportLoading}
                        error={reportError}
                        showAddButton={false}
                        maxHeight="calc(100vh - 280px)"
                    />
                )}
            </ComponentCard>
        </div>
    );
};

export default CashReport;

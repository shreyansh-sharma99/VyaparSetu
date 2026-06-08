import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import {
    fetchCashWallet,
    handleInitiateHandover,
    handleApproveHandover,
    handleRejectHandover,
    fetchCashReport
} from "./services/cashSlice";
import { fetchManagers } from "../teamMember/teamMembers/services/teamMemberSlice";
import PageMeta from "@/components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import {
    Wallet,
    Clock,
    CheckCircle2,
    XCircle,
    TrendingUp,
    Send,
    AlertCircle,
    Check,
    X,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    UserCheck,
    Coins,
    Info,
    Loader2
} from "lucide-react";
import Loader from "../../components/UI/Loader";
import { formatDateWithTiming } from "../../components/common/dateFormat";
import { toast } from "react-toastify";

const CashWallet: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Redux Selectors
    const { wallet, walletLoading, error, report, reportLoading, reportError, actionLoading } = useSelector(
        (state: RootState) => state.cash
    );
    const { managers, loadingManagers } = useSelector((state: RootState) => state.teamMember);
    const { user } = useSelector((state: RootState) => state.auth);
    const { profile } = useSelector((state: RootState) => state.user);

    // Get current user identifiers
    const currentUserId = profile?.id || profile?.user?.id || profile?._id || profile?.user?._id || user?.id || user?._id;
    // const userType = profile?.user?.userType || profile?.userType || user?.userType || localStorage.getItem('userType');

    // Local form state
    const [amount, setAmount] = useState<string>("");
    const [toUserId, setToUserId] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);

    // Active tab: 'incoming' | 'outgoing' | 'collections'
    const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'collections'>('incoming');
    const [pendingAction, setPendingAction] = useState<{ id: string, type: 'approve' | 'reject' } | null>(null);

    // Fetch initial wallet data, managers, and the user's ledger report
    const loadData = () => {
        dispatch(fetchCashWallet());
        dispatch(fetchManagers());
        if (currentUserId) {
            dispatch(fetchCashReport(currentUserId));
        }
    };

    useEffect(() => {
        loadData();
    }, [dispatch, currentUserId]);

    // Helpers
    const formatCurrency = (amountInPaise: number | undefined) => {
        if (amountInPaise === undefined) return "₹0.00";
        return `₹${(amountInPaise / 100).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const getUserDisplay = (userField: any) => {
        if (!userField) return { name: "Reporting Manager (Auto)", email: "Backend resolved" };
        if (typeof userField === 'object') {
            return {
                name: userField.name || "Unknown User",
                email: userField.email || ""
            };
        }
        const foundManager = (managers || []).find((m: any) => m._id === userField);
        if (foundManager) {
            return { name: foundManager.name, email: foundManager.email };
        }
        if (String(userField).trim() === String(currentUserId).trim()) {
            return {
                name: profile?.user?.name || profile?.name || "Me",
                email: profile?.user?.email || profile?.email
            };
        }
        return { name: `Staff (ID: ${userField.substring(0, 8)}...)`, email: "" };
    };

    // Lists logic
    const incomingRequests = wallet?.incomingRequests || report?.handovers?.filter((h: any) => {
        const toId = typeof h.toUser === 'object' ? (h.toUser?._id || h.toUser?.id) : h.toUser;
        return String(toId).trim() === String(currentUserId).trim() && (h.status === 'pending_approval' || h.status === 'pending');
    }) || [];

    const outgoingHandovers = wallet?.outgoingRequests || report?.handovers?.filter((h: any) => {
        const fromId = typeof h.fromUser === 'object' ? (h.fromUser?._id || h.fromUser?.id) : h.fromUser;
        return String(fromId).trim() === String(currentUserId).trim();
    }) || [];

    const collections = wallet?.collections || report?.collections || [];

    // Handlers
    const handleInitiate = async (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            toast.error("Please enter a valid positive amount");
            return;
        }

        const amountInPaise = Math.round(numericAmount * 100);
        if (wallet && amountInPaise > wallet.cashInHand) {
            toast.error("Handover amount cannot exceed cash in hand");
            return;
        }

        setSubmitting(true);
        try {
            const payload: { amount: number; toUserId?: string; notes?: string } = {
                amount: amountInPaise,
                notes: notes.trim()
            };
            if (toUserId) {
                payload.toUserId = toUserId;
            }

            const result = await dispatch(handleInitiateHandover(payload));
            if (handleInitiateHandover.fulfilled.match(result)) {
                toast.success("Handover initiated successfully. Waiting for approval.");
                setAmount("");
                setToUserId("");
                setNotes("");
                loadData();
            } else {
                toast.error((result.payload as string) || "Failed to initiate handover");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprove = async (handoverId: string) => {
        setPendingAction({ id: handoverId, type: 'approve' });
        try {
            const result = await dispatch(handleApproveHandover(handoverId));
            if (handleApproveHandover.fulfilled.match(result)) {
                toast.success("Handover approved successfully");
                loadData();
            } else {
                toast.error((result.payload as string) || "Failed to approve handover");
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
                loadData();
            } else {
                toast.error((result.payload as string) || "Failed to reject handover");
            }
        } finally {
            setPendingAction(null);
        }
    };

    if (walletLoading && !wallet) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <Loader />
            </div>
        );
    }

    if (error && !wallet) {
        return (
            <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-3xl border border-red-100 dark:border-red-900/20 shadow-xl max-w-xl mx-auto my-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Wallet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
                <button
                    onClick={loadData}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all active:scale-95 flex items-center gap-2 mx-auto"
                >
                    <RefreshCw className="h-4 w-4" /> Retry
                </button>
            </div>
        );
    }

    if (!wallet) return null;

    const stats = [
        {
            label: "Cash in Hand",
            value: formatCurrency(wallet.cashInHand),
            icon: Wallet,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            border: "border-emerald-100 dark:border-emerald-500/10",
            description: "Physical cash in your possession"
        },
        {
            label: "Pending Approval Cash",
            value: formatCurrency(wallet.pendingApprovalCash),
            icon: Clock,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-900/20",
            border: "border-amber-100 dark:border-amber-500/10",
            description: "Locked cash awaiting manager approval"
        },
        {
            label: "Incoming Cash to Approve",
            value: formatCurrency(wallet.cashToApprove),
            icon: CheckCircle2,
            color: "text-indigo-600 dark:text-indigo-400",
            bg: "bg-indigo-50 dark:bg-indigo-900/20",
            border: "border-indigo-100 dark:border-indigo-500/10",
            description: "Total cash sent to you by subordinates"
        },
        {
            label: "Pending Approvals Count",
            value: `${wallet.cashToApproveCount} Requests`,
            icon: TrendingUp,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-900/20",
            border: "border-purple-100 dark:border-purple-500/10",
            description: "Pending approvals awaiting your review"
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageMeta title="My Cash Wallet | VyaparSetu" description="Overview of cash wallet, approvals, and handovers" />

            <ComponentCard
                title={
                    <span className="flex items-center gap-2">
                        My Cash Wallet
                    </span>
                }
            // desc="Manage collections, track physical cash handovers, and approve subordinate requests."
            // rightButtonNode={
            //     <>
            //         <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-black uppercase tracking-wider">
            //             {userType === 'owner' ? 'Platform Owner' : 'Team Administrator'}
            //         </span>
            //         <button
            //             onClick={loadData}
            //             className="p-2.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all active:scale-95 shadow-sm"
            //             title="Refresh wallet data"
            //         >
            //             <RefreshCw className="h-4 w-4" />
            //         </button>
            //     </>
            // }
            >

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className={`bg-white dark:bg-gray-900 rounded-3xl p-5 border ${stat.border} shadow-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative group overflow-hidden`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                                    <stat.icon className="w-5.5 h-5.5" />
                                </div>
                            </div>
                            <div className="z-10">
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                                    {stat.label}
                                </p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">
                                    {stat.value}
                                </p>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 leading-snug">
                                    {stat.description}
                                </p>
                            </div>
                            <div className="absolute -bottom-8 -right-8 h-24 w-24 bg-gray-50 dark:bg-white/3 rounded-full blur-2xl group-hover:bg-primary/5 transition-all duration-500" />
                        </div>
                    ))}
                </div>

                {/* Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Requests & History */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
                            {/* Tabs Navigation */}
                            <div className="flex flex-wrap border-b border-gray-100 dark:border-white/5 pb-4 mb-6 gap-2">
                                <button
                                    onClick={() => setActiveTab('incoming')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'incoming'
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
                                        }`}
                                >
                                    <ArrowDownRight className="h-4 w-4" />
                                    Incoming Handovers
                                    {incomingRequests.length > 0 && (
                                        <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-amber-500 text-white rounded-full font-bold animate-pulse">
                                            {incomingRequests.length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('outgoing')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'outgoing'
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
                                        }`}
                                >
                                    <ArrowUpRight className="h-4 w-4" />
                                    My Handovers Sent
                                </button>
                                <button
                                    onClick={() => setActiveTab('collections')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'collections'
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
                                        }`}
                                >
                                    <Wallet className="h-4 w-4" />
                                    Client Collections
                                </button>
                            </div>

                            {/* Tabs Content */}
                            <div className="space-y-4">
                                {/* Tab 1: Incoming Requests (Awaiting approval from me) */}
                                {activeTab === 'incoming' && (
                                    <div>
                                        {reportLoading ? (
                                            <div className="py-12 text-center text-gray-400">Loading requests...</div>
                                        ) : incomingRequests.length === 0 ? (
                                            <div className="py-16 text-center">
                                                <div className="h-16 w-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Check className="h-8 w-8 text-emerald-500" />
                                                </div>
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No Pending Approvals</h4>
                                                <p className="text-xs text-gray-400">You are all caught up! No subordinates have sent pending handovers.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {incomingRequests.map((item: any) => {
                                                    const sender = getUserDisplay(item.fromUser);
                                                    return (
                                                        <div
                                                            key={item._id}
                                                            className="p-5 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 hover:border-gray-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                                                        >
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center text-sm font-black uppercase">
                                                                        {sender.name.substring(0, 2)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-bold text-gray-900 dark:text-white">{sender.name}</p>
                                                                        <p className="text-[10px] text-gray-400">{sender.email}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                                                                    <span className="text-xs font-black text-gray-900 dark:text-white bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-md">
                                                                        {formatCurrency(item.amount)}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" /> {formatDateWithTiming(item.createdAt)}
                                                                    </span>
                                                                </div>
                                                                {item.notes && (
                                                                    <div className="flex items-start gap-1 p-2 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-white/3 text-[11px] text-gray-500">
                                                                        <FileText className="h-3.5 w-3.5 mt-0.5 text-gray-400 shrink-0" />
                                                                        <span>{item.notes}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 shrink-0">
                                                                <button
                                                                    onClick={() => handleReject(item._id)}
                                                                    disabled={actionLoading || !!pendingAction}
                                                                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                                                                >
                                                                    {pendingAction?.id === item._id && pendingAction?.type === 'reject' ? (
                                                                        <>
                                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Rejecting...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <X className="h-3.5 w-3.5" /> Reject
                                                                        </>
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleApprove(item._id)}
                                                                    disabled={actionLoading || !!pendingAction}
                                                                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                                                                >
                                                                    {pendingAction?.id === item._id && pendingAction?.type === 'approve' ? (
                                                                        <>
                                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Approving...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Check className="h-3.5 w-3.5" /> Approve
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tab 2: Handovers Sent (Outgoing transfers sent by user) */}
                                {activeTab === 'outgoing' && (
                                    <div>
                                        {reportLoading ? (
                                            <div className="py-12 text-center text-gray-400">Loading handovers...</div>
                                        ) : outgoingHandovers.length === 0 ? (
                                            <div className="py-16 text-center">
                                                <div className="h-16 w-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Send className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No Handovers Initiated</h4>
                                                <p className="text-xs text-gray-400">You haven't submitted any cash handovers to managers yet.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                                                {outgoingHandovers.map((item: any) => {
                                                    const recipient = getUserDisplay(item.toUser);
                                                    return (
                                                        <div
                                                            key={item._id}
                                                            className="p-5 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 hover:border-gray-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                                                        >
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center text-sm font-black uppercase">
                                                                        {recipient.name.substring(0, 2)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-bold text-gray-900 dark:text-white">To: {recipient.name}</p>
                                                                        <p className="text-[10px] text-gray-400">{recipient.email}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                                                                    <span className="text-xs font-black text-gray-900 dark:text-white bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-md">
                                                                        {formatCurrency(item.amount)}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" /> {formatDateWithTiming(item.createdAt)}
                                                                    </span>
                                                                </div>
                                                                {item.notes && (
                                                                    <div className="flex items-start gap-1 p-2 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-white/3 text-[11px] text-gray-500">
                                                                        <FileText className="h-3.5 w-3.5 mt-0.5 text-gray-400 shrink-0" />
                                                                        <span>{item.notes}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="shrink-0 text-right">
                                                                <span
                                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${item.status === 'pending_approval'
                                                                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20'
                                                                        : item.status === 'approved'
                                                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20'
                                                                            : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20'
                                                                        }`}
                                                                >
                                                                    {item.status === 'pending_approval' && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />}
                                                                    {item.status === 'approved' && <CheckCircle2 className="h-3.5 w-3.5" />}
                                                                    {item.status === 'rejected' && <XCircle className="h-3.5 w-3.5" />}
                                                                    {item.status === 'pending_approval' ? 'Pending Approval' : item.status}
                                                                </span>
                                                                {item.approvedAt && (
                                                                    <p className="text-[9px] text-gray-400 mt-1">Approved: {formatDateWithTiming(item.approvedAt)}</p>
                                                                )}
                                                                {item.rejectedAt && (
                                                                    <p className="text-[9px] text-gray-400 mt-1">Rejected: {formatDateWithTiming(item.rejectedAt)}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tab 3: Client Collections */}
                                {activeTab === 'collections' && (
                                    <div>
                                        {reportLoading ? (
                                            <div className="py-12 text-center text-gray-400">Loading collections...</div>
                                        ) : collections.length === 0 ? (
                                            <div className="py-16 text-center">
                                                <div className="h-16 w-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Wallet className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No Collections Done</h4>
                                                <p className="text-xs text-gray-400">No client merchant collections are recorded for your account.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                                                {collections.map((item: any) => (
                                                    <div
                                                        key={item._id}
                                                        className="p-5 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 hover:border-gray-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                                                    >
                                                        <div className="space-y-2">
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-900 dark:text-white">
                                                                    {item.admin?.businessName || item.admin?.name || "Merchant Merchant"}
                                                                </p>
                                                                <p className="text-[10px] text-gray-400">
                                                                    Admin: {item.admin?.name || "N/A"} • Plan: {item.plan?.name || "Offline Plan"}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                                                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                                                    {formatCurrency(item.amount)}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" /> {formatDateWithTiming(item.createdAt)}
                                                                </span>
                                                            </div>
                                                            {item.notes && (
                                                                <div className="flex items-start gap-1 p-2 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-white/3 text-[11px] text-gray-500">
                                                                    <FileText className="h-3.5 w-3.5 mt-0.5 text-gray-400 shrink-0" />
                                                                    <span>{item.notes}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="shrink-0 text-right text-xs text-gray-400">
                                                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full font-black uppercase text-[9px] tracking-wider border border-emerald-200/30">
                                                                Direct Cash
                                                            </span>
                                                            {item.invoice && (
                                                                <p className="text-[9px] text-gray-400 mt-1.5">Invoice: {item.invoice}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Report Error note inside tabs, rather than failing the whole page */}
                            {reportError && activeTab !== 'incoming' && (
                                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/30 rounded-2xl text-[11px] flex items-center gap-2">
                                    <Info className="h-4 w-4 shrink-0" />
                                    <span>Note: Detailed transaction ledger lists are restricted or not loaded ({reportError}). Wallet totals are fully operational.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Handover Form */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
                            <div className="border-b border-gray-100 dark:border-white/5 pb-4 mb-6">
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <Send className="h-4.5 w-4.5 text-primary" /> Initiate Cash Handover
                                </h3>
                                <p className="text-[11px] text-gray-500 mt-1">
                                    Lock and transfer physical cash to a manager. Requires physical receipt verification to complete.
                                </p>
                            </div>

                            <form onSubmit={handleInitiate} className="space-y-5">
                                {/* Available Balance Helper */}
                                <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-200/40 dark:border-emerald-500/10 rounded-2xl flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none">
                                            Active Cash in Hand
                                        </span>
                                        <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 leading-none">
                                            {formatCurrency(wallet.cashInHand)}
                                        </p>
                                    </div>
                                    <div className="h-9 w-9 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-600">
                                        <Coins className="h-5 w-5" />
                                    </div>
                                </div>

                                {/* Recipient Selector */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Handover Recipient (Manager)
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={toUserId}
                                            onChange={(e) => setToUserId(e.target.value)}
                                            disabled={loadingManagers}
                                            className="w-full h-11 pl-4 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium text-gray-800 dark:text-gray-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">Auto-Resolve (Designated Reporting Manager)</option>
                                            {(managers || []).map((m: any) => (
                                                <option key={m._id} value={m._id}>
                                                    {m.name} ({m.email}) {m.userType === "owner" ? "· Owner" : ""}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            {loadingManagers ? (
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <UserCheck className="h-4.5 w-4.5" />
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-1">
                                        💡 Leaving this blank resolves your reporting manager automatically.
                                    </p>
                                </div>

                                {/* Handover Amount */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Amount to Hand Over <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 dark:text-gray-500 text-sm">
                                            ₹
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="e.g. 5000"
                                            className="w-full h-11 pl-8 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold text-gray-800 dark:text-gray-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    {amount && wallet && parseFloat(amount) * 100 > wallet.cashInHand && (
                                        <p className="text-[10px] font-bold text-rose-500 mt-1 px-1 flex items-center gap-1 animate-pulse">
                                            <AlertCircle className="h-3 w-3 shrink-0" /> Amount exceeds active Cash in Hand balance!
                                        </p>
                                    )}
                                </div>

                                {/* Handover Notes */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        Handover Notes / Reason
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="e.g. Handing over weekly cash collection"
                                        rows={3}
                                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium text-gray-800 dark:text-gray-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={
                                        submitting ||
                                        !amount ||
                                        (wallet && parseFloat(amount) * 100 > wallet.cashInHand) ||
                                        parseFloat(amount) <= 0
                                    }
                                    className="w-full h-11 bg-primary hover:bg-primary-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-primary/25 active:scale-95 disabled:bg-gray-100 dark:disabled:bg-gray-850 disabled:text-gray-400 disabled:shadow-none disabled:pointer-events-none flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" /> Sending Request...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" /> Send Cash for Approval
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </ComponentCard>
        </div>
    );
};

export default CashWallet;

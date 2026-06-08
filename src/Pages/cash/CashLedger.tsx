import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import {
    fetchCashLedger,
    fetchCashWallet,
    handleApproveHandover,
    handleRejectHandover,
    fetchCashReport
} from "./services/cashSlice";
import PageMeta from "@/components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { encryptData } from "../../utility/crypto";
import {
    Users,
    Coins,
    CheckSquare,
    Search,
    Check,
    X,
    Clock,
    AlertCircle,
    ChevronRight,
    Filter,
    Loader2
} from "lucide-react";
import { formatDateWithTiming } from "../../components/common/dateFormat";
import { toast } from "react-toastify";
import Loader from "../../components/UI/Loader";

const CashLedger: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Redux selectors
    const { ledger, ledgerLoading, wallet, error, actionLoading, report } = useSelector(
        (state: RootState) => state.cash
    );
    const { profile } = useSelector((state: RootState) => state.user);
    const { user } = useSelector((state: RootState) => state.auth);

    // Get current user identifiers
    const currentUserId = profile?.id || profile?.user?.id || profile?._id || profile?.user?._id || user?.id || user?._id;

    // Local states
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [activeTab, setActiveTab] = useState<'balances' | 'approvals'>('balances');
    const [pendingAction, setPendingAction] = useState<{ id: string, type: 'approve' | 'reject' } | null>(null);

    // Fetch ledger list and own wallet details (for pending approvals count/list)
    const loadData = () => {
        dispatch(fetchCashLedger());
        dispatch(fetchCashWallet());
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

    const handleViewReport = (userId: string) => {
        const encryptedId = encodeURIComponent(encryptData(userId));
        navigate(`/Cash/report/${encryptedId}`);
    };

    const handleApprove = async (handoverId: string) => {
        setPendingAction({ id: handoverId, type: 'approve' });
        try {
            const result = await dispatch(handleApproveHandover(handoverId));
            if (handleApproveHandover.fulfilled.match(result)) {
                toast.success("Handover approved successfully");
                loadData();
            } else {
                toast.error((result.payload as string) || "Failed to approve");
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
                toast.error((result.payload as string) || "Failed to reject");
            }
        } finally {
            setPendingAction(null);
        }
    };

    // Calculate sum of physical cash held by all team members
    const totalCompanyCash = ledger.reduce((acc, curr) => acc + (curr.total || 0), 0);

    // Filtered ledger list
    const filteredLedger = ledger.filter((item) => {
        const matchesSearch =
            item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || item.userType === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Pending approvals list from own report
    const pendingApprovals = report?.handovers?.filter((h: any) => {
        const toId = typeof h.toUser === 'object' ? (h.toUser?._id || h.toUser?.id) : h.toUser;
        return String(toId).trim() === String(currentUserId).trim() && (h.status === 'pending_approval' || h.status === 'pending');
    }) || [];

    if (ledgerLoading && ledger.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <Loader />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageMeta title="Cash Ledger & Approvals | VyaparSetu" description="Manage team cash ledger and approvals" />

            <ComponentCard
                title="Cash Administration"
            // desc="Track physical cash balances across your entire team and process pending approvals."
            // rightButtonNode={
            //     <button
            //         onClick={loadData}
            //         className="self-start sm:self-auto p-2.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all active:scale-95 shadow-sm"
            //         title="Refresh Ledger"
            //     >
            //         <RefreshCw className="h-4 w-4" />
            //     </button>
            // }
            >

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Stat 1: Total Company Cash */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                            <Coins className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Company Cash in Hand
                            </p>
                            <p className="text-xl font-black text-gray-900 dark:text-white tabular-nums">
                                {formatCurrency(totalCompanyCash)}
                            </p>
                        </div>
                    </div>

                    {/* Stat 2: Active Team Members */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Staff Monitored
                            </p>
                            <p className="text-xl font-black text-gray-900 dark:text-white">
                                {ledger.length} Members
                            </p>
                        </div>
                    </div>

                    {/* Stat 3: Awaiting My Approval */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-2xl">
                            <CheckSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Awaiting My Approval
                            </p>
                            <p className="text-xl font-black text-gray-900 dark:text-white tabular-nums">
                                {wallet ? formatCurrency(wallet.cashToApprove) : "₹0.00"}
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 ml-1.5">
                                    ({wallet ? wallet.cashToApproveCount : 0} reqs)
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Section */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 dark:border-white/5 pb-4 mb-6 gap-2">
                        <button
                            onClick={() => setActiveTab('balances')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'balances'
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                        >
                            <Users className="h-4 w-4" />
                            Team Balances
                        </button>
                        <button
                            onClick={() => setActiveTab('approvals')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'approvals'
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                        >
                            <CheckSquare className="h-4 w-4" />
                            Pending Handovers
                            {pendingApprovals.length > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-amber-500 text-white rounded-full font-bold animate-pulse">
                                    {pendingApprovals.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Tab content */}
                    {activeTab === 'balances' ? (
                        <div className="space-y-6">
                            {/* Search and Filter */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by staff name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-10 pl-10 pr-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-150 dark:border-white/5 rounded-xl text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Filter className="h-4 w-4 text-gray-400" />
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className="h-10 px-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-150 dark:border-white/5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 outline-none focus:border-primary cursor-pointer"
                                    >
                                        <option value="all">All Roles</option>
                                        <option value="owner">Owner</option>
                                        <option value="team_member">Team Member</option>
                                    </select>
                                </div>
                            </div>

                            {/* Balances List */}
                            {error ? (
                                <div className="p-4 text-center bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl text-xs">
                                    Error loading ledger: {error}
                                </div>
                            ) : filteredLedger.length === 0 ? (
                                <div className="py-16 text-center">
                                    <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                                    <p className="text-xs text-gray-500">No staff members found matching the filters.</p>
                                </div>
                            ) : (
                                <div className="border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/5">
                                                    <th className="py-3.5 px-5">Staff Member</th>
                                                    <th className="py-3.5 px-5">Role</th>
                                                    <th className="py-3.5 px-5 text-right">Cash in Hand</th>
                                                    <th className="py-3.5 px-5 text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-xs text-gray-800 dark:text-gray-200">
                                                {filteredLedger.map((item) => (
                                                    <tr
                                                        key={item._id}
                                                        className="hover:bg-gray-50/50 dark:hover:bg-white/1 transition-all"
                                                    >
                                                        <td className="py-3.5 px-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-9 w-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black uppercase text-xs">
                                                                    {item.name?.substring(0, 2) || "ST"}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                                                                    <p className="text-[10px] text-gray-400">{item.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-5">
                                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${item.userType === 'owner'
                                                                ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400'
                                                                : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                                                                }`}>
                                                                {item.userType ? item.userType.replace('_', ' ') : 'Staff'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-5 text-right font-black text-gray-900 dark:text-white tabular-nums">
                                                            {formatCurrency(item.total)}
                                                        </td>
                                                        <td className="py-3.5 px-5 text-center">
                                                            <button
                                                                onClick={() => handleViewReport(item._id)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-primary hover:text-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-[11px] font-bold transition-all active:scale-95 shadow-sm border border-gray-150 dark:border-white/5"
                                                            >
                                                                Audit Trail <ChevronRight className="h-3.5 w-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingApprovals.length === 0 ? (
                                <div className="py-16 text-center">
                                    <div className="h-16 w-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check className="h-8 w-8 text-emerald-500" />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">No Pending Approvals</h4>
                                    <p className="text-xs text-gray-400">All subordinate handovers have been processed.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pendingApprovals.map((item: any) => {
                                        const senderName = item.fromUser?.name || item.fromUser || "Staff Member";
                                        const senderEmail = item.fromUser?.email || "Subordinate";
                                        return (
                                            <div
                                                key={item._id}
                                                className="p-5 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 hover:border-gray-200 transition-all flex flex-col justify-between gap-4"
                                            >
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center text-sm font-black uppercase">
                                                            {senderName.substring(0, 2)}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{senderName}</p>
                                                            <p className="text-[10px] text-gray-400">{senderEmail}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                                                            {formatCurrency(item.amount)}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                            <Clock className="h-3 w-3" /> {formatDateWithTiming(item.createdAt)}
                                                        </span>
                                                    </div>
                                                    {item.notes && (
                                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-white/3 text-[11px] text-gray-500">
                                                            {item.notes}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 border-t dark:border-white/3 pt-3">
                                                    <button
                                                        onClick={() => handleReject(item._id)}
                                                        disabled={actionLoading || !!pendingAction}
                                                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
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
                                                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
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
                </div>
            </ComponentCard>
        </div>
    );
};

export default CashLedger;

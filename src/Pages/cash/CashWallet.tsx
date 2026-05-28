import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { fetchCashWallet } from "./services/cashSlice";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "@/components/common/PageMeta";
import { Wallet, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import Loader from "../../components/UI/Loader";

const CashWallet: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { wallet, walletLoading, error } = useSelector((state: RootState) => state.cash);

    useEffect(() => {
        dispatch(fetchCashWallet());
    }, [dispatch]);

    if (walletLoading && !wallet) {
        return (
            <ComponentCard title="Cash Wallet">
                <Loader />
            </ComponentCard>
        );
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!wallet) return null;

    const stats = [
        {
            label: "Cash in Hand",
            value: `₹${wallet.cashInHand.toLocaleString('en-IN')}`,
            icon: Wallet,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            label: "Pending Approval Cash",
            value: `₹${wallet.pendingApprovalCash.toLocaleString('en-IN')}`,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50 dark:bg-amber-900/20"
        },
        {
            label: "Cash to Approve",
            value: `₹${wallet.cashToApprove.toLocaleString('en-IN')}`,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-900/20"
        },
        {
            label: "Pending Approvals Count",
            value: wallet.cashToApproveCount.toString(),
            icon: TrendingUp,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-900/20"
        }
    ];

    return (
        <div className="">
            <PageMeta title="Cash Wallet | VyaparSetu" description="Overview of cash wallet" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CashWallet;

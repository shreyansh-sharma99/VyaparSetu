import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Wallet, Users, ArrowUpRight, TrendingUp, AlertCircle, FileCheck2, Clock } from "lucide-react";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import type { AppDispatch, RootState } from "../../store";
import { fetchTeamDashboardData } from "./services/dashboardSlice";
import Loader from "../../components/UI/Loader";

export function TeamDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { teamData, loading, error } = useSelector((state: RootState) => state.dashboard);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    dispatch(fetchTeamDashboardData());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [dispatch]);

  if (loading && !teamData) {
    return (
      <ComponentCard title="Team Dashboard">
        <Loader />
      </ComponentCard>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-3xl border border-red-100 dark:border-red-900/20 shadow-2xl max-w-2xl mx-auto my-12">
        <div className="h-20 w-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sync Failed</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{error}</p>
        <button
          onClick={() => dispatch(fetchTeamDashboardData())}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/25 active:scale-95"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!teamData) return null;

  const { wallet, clients } = teamData;

  const stats = [
    {
      label: "Cash in Hand",
      value: `₹${wallet.cashInHandINR}`,
      icon: Wallet,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      description: "Current wallet balance"
    },
    {
      label: "Pending Approvals",
      value: wallet.pendingApprovalsToReview.toString(),
      icon: AlertCircle,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      description: "Requiring your review"
    },
    {
      label: "Total Clients",
      value: clients.totalOnboarded.toString(),
      trend: `+${clients.onboardedThisMonth} this month`,
      positive: clients.onboardedThisMonth > 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      description: "Total onboarded clients"
    },
    {
      label: "Approvals Given",
      value: `₹${wallet.pendingApprovalGivenINR}`,
      icon: FileCheck2,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      description: `${wallet.pendingApprovalGiven} approvals processed`
    }
  ];

  return (
    <>
      <PageMeta
        title="Team Dashboard | VyaparSetu"
        description="View your active wallet, clients, and approvals."
      />

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <ComponentCard 
          title="Dashboard"
          rightButtonNode={
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-xl shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
                <div className="p-1 sm:p-1.5 bg-blue-500/20 rounded-lg">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[9px] uppercase tracking-widest font-black text-blue-600/70 dark:text-blue-400/70 leading-none mb-1">
                    {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300 tracking-tight leading-none">
                    {currentTime.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              {localStorage.getItem('lastLoginAt') && (
                <div className="hidden sm:flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/20 dark:to-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 rounded-xl shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
                  <div className="flex flex-col justify-center">
                    <span className="text-[9px] uppercase tracking-widest font-black text-emerald-600/70 dark:text-emerald-400/70 leading-none mb-1">
                      Last Login
                    </span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 leading-none">
                      {new Date(localStorage.getItem('lastLoginAt') as string).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
            {stats.map((stat, i) => (
              <div key={i} className="group relative overflow-hidden rounded-3xl border bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 sm:p-4 rounded-2xl ${stat.bg} ${stat.color} transition-all group-hover:scale-110 group-hover:rotate-3`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  {stat.trend && (
                    <div className={`flex items-center text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${stat.positive ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"}`}>
                      {stat.trend}
                      {stat.positive ? <ArrowUpRight className="ml-1 h-3 w-3" /> : null}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{stat.value}</p>
                  <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-2">
                    <TrendingUp className="h-3 w-3 text-gray-400" />
                    {stat.description}
                  </p>
                </div>
                <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-gray-50 dark:bg-white/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all duration-700" />
              </div>
            ))}
          </div>
        </ComponentCard>

        {/* We can add more components here later for recent clients, etc. */}
      </div>
    </>
  );
}

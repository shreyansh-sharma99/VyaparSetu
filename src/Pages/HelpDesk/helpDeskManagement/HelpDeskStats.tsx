import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store";
import { fetchTicketStats } from "../services/helpDeskSlice";
import ComponentCard from "../../../components/common/ComponentCard";
import PageMeta from "@/components/common/PageMeta";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Ticket, Clock, CheckCircle, AlertTriangle } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#a855f7'];

const HelpDeskStats: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { stats, statsLoading } = useSelector((state: RootState) => state.helpDesk);

    useEffect(() => {
        dispatch(fetchTicketStats());
    }, [dispatch]);

    const statCards = [
        {
            title: "Total Tickets",
            value: stats?.totals?.totalTickets || 0,
            icon: Ticket,
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/30",
        },
        {
            title: "Open Tickets",
            value: stats?.totals?.openTickets || 0,
            icon: AlertTriangle,
            color: "text-amber-600",
            bg: "bg-amber-100 dark:bg-amber-900/30",
        },
        {
            title: "Resolved",
            value: stats?.totals?.resolvedTickets || 0,
            icon: CheckCircle,
            color: "text-emerald-600",
            bg: "bg-emerald-100 dark:bg-emerald-900/30",
        },
        {
            title: "SLA Breaches",
            value: stats?.slaBreaches?.count || 0,
            icon: Clock,
            color: "text-red-600",
            bg: "bg-red-100 dark:bg-red-900/30",
        }
    ];

    const categoryData = stats?.byCategory ? Object.keys(stats.byCategory).map(key => ({
        name: key.replace('_', ' ').toUpperCase(),
        value: stats.byCategory[key]
    })) : [];

    const statusData = stats?.byStatus ? Object.keys(stats.byStatus).map(key => ({
        name: key.replace('_', ' ').toUpperCase(),
        value: stats.byStatus[key]
    })) : [];

    return (
        <div className="space-y-6">
            <PageMeta title="HelpDesk Stats | VyaparSetu" description="Analytics for support tickets" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{statsLoading ? "..." : card.value}</h3>
                        </div>
                        <div className={`p-4 rounded-xl ${card.bg}`}>
                            <card.icon className={`w-8 h-8 ${card.color}`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ComponentCard title="Tickets by Category">
                    <div className="h-[300px] w-full">
                        {statsLoading ? (
                            <div className="h-full flex items-center justify-center text-gray-500">Loading...</div>
                        ) : categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
                        )}
                    </div>
                </ComponentCard>

                <ComponentCard title="Tickets by Status">
                    <div className="h-[300px] w-full">
                        {statsLoading ? (
                            <div className="h-full flex items-center justify-center text-gray-500">Loading...</div>
                        ) : statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" tick={{ fill: '#6b7280' }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fill: '#6b7280' }} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
                        )}
                    </div>
                </ComponentCard>
            </div>
        </div>
    );
};

export default HelpDeskStats;

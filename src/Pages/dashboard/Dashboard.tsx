import {
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  ShoppingCart,
  DollarSign,
  Activity,
  CreditCard,
  UserPlus
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

const chartData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 4500 },
  { name: "May", revenue: 6000 },
  { name: "Jun", revenue: 5500 },
  { name: "Jul", revenue: 7000 },
];

const recentActivities = [
  {
    id: 1,
    user: "Alex Thompson",
    action: "placed a new order",
    time: "2 minutes ago",
    amount: "+$250.00",
    icon: ShoppingCart,
    color: "bg-blue-500",
  },
  {
    id: 2,
    user: "Sarah Jenkins",
    action: "registered as a new user",
    time: "15 minutes ago",
    amount: null,
    icon: UserPlus,
    color: "bg-emerald-500",
  },
  {
    id: 3,
    user: "Michael Chen",
    action: "completed a payment",
    time: "1 hour ago",
    amount: "+$1,200.00",
    icon: CreditCard,
    color: "bg-indigo-500",
  },
  {
    id: 4,
    user: "Emma Wilson",
    action: "updated inventory",
    time: "3 hours ago",
    amount: "-12 units",
    icon: Package,
    color: "bg-orange-500",
  },
];

export function Dashboard() {
  return (
    <>
      <PageMeta
        title="Dashboard | VyaparSetu"
        description="Comprehensive overview of your business performance, inventory, and recent activities."
      />

      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Revenue", value: "$45,231.89", trend: "+20.1%", positive: true, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: "Active Users", value: "2,350", trend: "+180.1%", positive: true, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            { label: "In Stock", value: "12,234", trend: "-4.5%", positive: false, icon: Package, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
            { label: "Orders", value: "+573", trend: "+12.5%", positive: true, icon: Activity, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
          ].map((stat, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${stat.positive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  {stat.trend}
                  {stat.positive ? <ArrowUpRight className="ml-1 h-3 w-3" /> : <ArrowDownRight className="ml-1 h-3 w-3" />}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              </div>
              <div className="absolute -bottom-2 -right-2 h-20 w-20 bg-gray-100/50 dark:bg-white/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-7">
          {/* Revenue Chart */}
          <ComponentCard
            title="Revenue Analytics"
            className="lg:col-span-4"
            desc="Monthly revenue trends for the current year"
          >
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                      padding: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(8px)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ComponentCard>

          {/* Recent Activity */}
          <ComponentCard
            title="Recent Activity"
            className="lg:col-span-3"
            desc="Latest events across your platform"
          >
            <div className="space-y-6 mt-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                  <div className={`mt-0.5 p-2.5 rounded-xl ${activity.color} text-white shadow-sm transition-transform group-hover:scale-110`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {activity.user}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.action}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
                      {activity.time}
                    </p>
                  </div>
                  {activity.amount && (
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {activity.amount}
                    </div>
                  )}
                </div>
              ))}
              <button className="w-full mt-4 py-3 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-xl transition-all hover:shadow-inner active:scale-95">
                View Full Activity Log
              </button>
            </div>
          </ComponentCard>
        </div>
      </div>
    </>
  );
}

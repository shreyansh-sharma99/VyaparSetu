import React from 'react';
import { Modal, Timeline } from 'antd';
import { formatDateWithTiming } from '../../components/common/dateFormat';
import Loader from '../../components/UI/Loader';
import { 
  User, 
  Mail, 
  CreditCard, 
  Calendar, 
  Clock, 
  Activity, 
  Zap, 
  ShieldCheck, 
  BarChart3, 
  Globe, 
  Code2, 
  Headphones, 
  Download, 
  Layout, 
  Bell,
  Box,
  ShoppingCart,
  Users,
  Store,
  HardDrive,
  XCircle
} from 'lucide-react';


interface SubscriptionDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  subscriptionData: any;
  loading: boolean;
}

const SubscriptionDetailsModal: React.FC<SubscriptionDetailsModalProps> = ({
  visible,
  onClose,
  subscriptionData,
  loading,
}) => {
  const sub = subscriptionData;

  const getStatusBadge = (status: string) => {
    const config: Record<string, { classes: string; icon: any }> = {
      active: { classes: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50', icon: <ShieldCheck className="w-3 h-3" /> },
      trialing: { classes: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50', icon: <Clock className="w-3 h-3" /> },
      past_due: { classes: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50', icon: <Activity className="w-3 h-3" /> },
      cancelled: { classes: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50', icon: <XCircle className="w-3 h-3" /> },
      expired: { classes: 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/50', icon: <Calendar className="w-3 h-3" /> },
    };

    const current = config[status] || { classes: 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800 dark:text-gray-400', icon: <Activity className="w-3 h-3" /> };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${current.classes}`}>
        {current.icon}
        {status || 'N/A'}
      </span>
    );
  };

  const featureIcons: Record<string, any> = {
    analyticsEnabled: <BarChart3 className="w-3 h-3" />,
    customDomain: <Globe className="w-3 h-3" />,
    apiAccess: <Code2 className="w-3 h-3" />,
    prioritySupport: <Headphones className="w-3 h-3" />,
    exportData: <Download className="w-3 h-3" />,
    whitelabel: <Zap className="w-3 h-3" />,
    customThemes: <Layout className="w-3 h-3" />,
    smsNotifications: <Bell className="w-3 h-3" />,
  };

  const InfoItem = ({ icon: Icon, label, value, colorClass = "text-gray-500" }: any) => (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100/50 dark:border-white/[0.05]">
      <div className={`mt-0.5 p-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 ${colorClass}`}>
        <Icon size={14} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-0.5">{label}</p>
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
          {value}
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
            <CreditCard size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Subscription Details</h2>
            <p className="text-xs font-medium text-gray-400">Detailed overview of the business subscription plan</p>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      className="responsive-modal"
      styles={{
        header: {
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          paddingBottom: '20px',
          paddingTop: '20px',
          paddingLeft: '24px',
          paddingRight: '24px',
          marginBottom: '0'
        },
        body: {
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto',
          padding: '0'
        }
      }}
      bodyProps={{
        className: 'scrollbar-hide hover:scrollbar-default'
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader />
        </div>
      ) : sub ? (
        <div className="p-6 space-y-6">
          {/* Section: General Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoItem icon={User} label="Admin" value={sub.adminId?.name || 'N/A'} colorClass="text-blue-500" />
            <InfoItem icon={Mail} label="Email" value={sub.adminId?.email || 'N/A'} colorClass="text-indigo-500" />
            <InfoItem icon={Zap} label="Plan" value={sub.planId?.name || 'N/A'} colorClass="text-amber-500" />
            <InfoItem icon={Activity} label="Status" value={getStatusBadge(sub.status)} colorClass="text-emerald-500" />
            <InfoItem icon={Calendar} label="Start Date" value={formatDateWithTiming(sub.startDate)} colorClass="text-blue-400" />
            <InfoItem icon={Calendar} label="End Date" value={formatDateWithTiming(sub.endDate)} colorClass="text-rose-400" />
            <InfoItem icon={Clock} label="Tenure" value={sub.tenure?.toUpperCase()} colorClass="text-purple-500" />
            <InfoItem icon={CreditCard} label="ID" value={sub.razorpaySubscriptionId?.split('_')[1] || 'N/A'} colorClass="text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section: Plan Limits */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-blue-500" size={16} />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Plan Limits</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Products", value: sub.planId?.limits?.maxProducts, icon: Box, color: "text-blue-500" },
                  { label: "Orders", value: sub.planId?.limits?.maxOrders, icon: ShoppingCart, color: "text-emerald-500" },
                  { label: "Customers", value: sub.planId?.limits?.maxCustomers, icon: Users, color: "text-indigo-500" },
                  { label: "Staff", value: sub.planId?.limits?.maxStaff, icon: User, color: "text-purple-500" },
                  { label: "Stores", value: sub.planId?.limits?.maxStores, icon: Store, color: "text-amber-500" },
                  { label: "Storage", value: `${sub.planId?.limits?.storageGB} GB`, icon: HardDrive, color: "text-rose-500" },
                ].map((limit, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05] flex items-center gap-3">
                    <limit.icon size={14} className={limit.color} />
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">{limit.label}</p>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {limit.value === -1 ? 'Unlimited' : limit.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="text-amber-500" size={16} />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Features Included</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {sub.planId?.features && Object.entries(sub.planId.features).map(([key, enabled]) => (
                  enabled ? (
                    <div key={key} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
                      <div className="text-emerald-500">{featureIcons[key] || <ShieldCheck size={12} />}</div>
                      <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tight">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          </div>

          {/* Section: History */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Activity className="text-purple-500" size={16} />
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Subscription History</h3>
            </div>
            <div className="bg-gray-50/50 dark:bg-white/[0.02] p-5 rounded-2xl border border-gray-100 dark:border-white/[0.05]">
              <div className="max-h-[220px] overflow-y-auto pr-2 scrollbar-hide hover:scrollbar-default">
                <Timeline
                  className="mt-2"
                  items={sub.history?.map((item: any, index: number) => ({
                    children: (
                      <div key={index} className="pb-6 relative">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                              item.action === 'created' ? 'bg-emerald-500 text-white' :
                              item.action === 'suspended' ? 'bg-rose-500 text-white' :
                              item.action === 'reactivated' ? 'bg-blue-500 text-white' :
                              item.action === 'extended' ? 'bg-amber-500 text-white' : 'bg-gray-600 text-white'
                            }`}>
                              {item.action}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                              <Calendar size={10} />
                              {formatDateWithTiming(item.date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                            <User size={10} className="text-gray-400" />
                            <span className="text-[9px] font-bold text-gray-500 uppercase">By {item.performedBy}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pl-1 italic border-l-2 border-gray-200 dark:border-gray-700 ml-1">
                          "{item.note}"
                        </p>
                      </div>
                    ),
                    color: item.action === 'created' ? '#10b981' :
                      item.action === 'suspended' ? '#ef4444' :
                        item.action === 'reactivated' ? '#3b82f6' :
                          item.action === 'extended' ? '#f59e0b' : '#6366f1',
                  }))}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 italic">
          <CreditCard size={40} className="mb-4 opacity-20" />
          <p>No subscription data available</p>
        </div>
      )}
    </Modal>
  );
};

export default SubscriptionDetailsModal;

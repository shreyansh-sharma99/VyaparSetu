import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Tag, Tooltip, Empty, Modal } from 'antd';
import {
  User, Mail, Building2, MapPin, Shield, Activity, Package, ShoppingCart,
  HardDrive, Layout, BarChart2, Globe, Database, HelpCircle, Download,
  ShieldCheck, Palette, Smartphone, CalendarClock, ArrowLeft, Loader2,
  Ban, CheckCircle, CheckCircle2, AlertCircle, Receipt, History, SendHorizontal, MoreVertical,
  Eye, CreditCard, TrendingUp, FileText, Clock, UserCheck, Settings2
} from 'lucide-react';
import { formatDateWithTiming } from '../../../components/common/dateFormat';
import type { AppDispatch, RootState } from '../../../store';
import { fetchAdminById, clearCurrentAdmin, resendOnboarding, suspendAdmin, activateAdmin, extendSubscription, fetchAdminRazorpay, fetchAdminAuditLogs } from './services/adminSlice';
import ComponentCard from '../../../components/common/ComponentCard';
import PageMeta from '@/components/common/PageMeta';
import Button from '../../../components/UI/button/Button';
import { decryptData } from '@/utility/crypto';
import { toast } from 'react-toastify';
import Tabs from '../../../components/common/Tabs';

// --- Sub-components for Optimization & UI ---

const InfoItem = React.memo(({ icon: Icon, label, value, subValue, colorClass }: { icon: any, label: string, value: string, subValue?: string, colorClass: string }) => (
  <div className="flex items-center gap-4 sm:gap-5 group p-3 rounded-2xl transition-all duration-300 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${colorClass} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={20} className="sm:w-6 sm:h-6" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 dark:text-white truncate">{value} {subValue && <span className="text-xs text-gray-400 ml-1">({subValue})</span>}</p>
    </div>
  </div>
));

const LimitCard = React.memo(({ icon, label, value, inherited, planName }: { icon: any, label: string, value: any, inherited: boolean, planName?: string }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300 group">
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-blue-600 dark:text-blue-400 group-hover:rotate-6 transition-transform duration-300">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm text-gray-800 dark:text-white leading-tight">
          {value === -1 ? 'Unlimited' : value}
          {label.toLowerCase().includes('storage') ? ' GB' : ''}
        </p>
      </div>
    </div>
    <Tooltip title={inherited ? `Inherited from ${planName || 'Plan'}` : "Custom Override"}>
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${inherited ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'}`}>
        {inherited ? <History size={10} /> : <Palette size={10} />}
        <span className="hidden sm:inline">{inherited ? 'Inherited' : 'Override'}</span>
      </div>
    </Tooltip>
  </div>
));

const AdminDetails: React.FC = () => {
  const { adminId } = useParams<{ adminId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { currentAdmin, fetchingCurrent, razorpayData, auditLogs, fetchingRazorpay, fetchingAuditLogs } = useSelector((state: RootState) => state.admin);

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<"resend" | "suspend" | "activate" | "extend" | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [extendDays, setExtendDays] = useState<number>(30);
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  const admin = currentAdmin?.admin;
  const subscriptions = useMemo(() => currentAdmin?.subscriptions || [], [currentAdmin]);
  const invoices = useMemo(() => currentAdmin?.invoices || [], [currentAdmin]);

  const showActions = useMemo(() => location.state?.from === 'AdminManagement', [location.state]);

  useEffect(() => {
    if (adminId) {
      try {
        const id = decryptData(decodeURIComponent(adminId));
        if (id) {
          dispatch(fetchAdminById(id));
          dispatch(fetchAdminRazorpay(id));
          dispatch(fetchAdminAuditLogs({ id, page: 1, limit: 20 }));
        } else {
          toast.error("Invalid admin ID");
          navigate(-1);
        }
      } catch (error) {
        toast.error("Unable to fetch admin details");
        navigate(-1);
      }
    }
    return () => { dispatch(clearCurrentAdmin()); };
  }, [adminId, dispatch, navigate]);

  const handleActionClick = useCallback((type: "resend" | "suspend" | "activate" | "extend") => {
    setActionType(type);
    setActionModalVisible(true);
  }, []);

  const handleActionConfirm = useCallback(async () => {
    if (!admin || !actionType) return;

    setIsActionLoading(true);
    try {
      let resultAction;
      switch (actionType) {
        case "resend": resultAction = await dispatch(resendOnboarding(admin._id)); break;
        case "suspend": resultAction = await dispatch(suspendAdmin(admin._id)); break;
        case "activate": resultAction = await dispatch(activateAdmin(admin._id)); break;
        case "extend": resultAction = await dispatch(extendSubscription({ id: admin._id, days: extendDays })); break;
      }

      if (resultAction && (resendOnboarding.fulfilled.match(resultAction) || suspendAdmin.fulfilled.match(resultAction) || activateAdmin.fulfilled.match(resultAction) || extendSubscription.fulfilled.match(resultAction))) {
        toast.success(`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} action completed successfully`);
        if (actionType !== "resend") dispatch(fetchAdminById(admin._id));
      } else {
        toast.error((resultAction?.payload as string) || `Failed to ${actionType} admin`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsActionLoading(false);
      setActionModalVisible(false);
      setActionType(null);
    }
  }, [admin, actionType, extendDays, dispatch]);

  const effectiveLimits = useMemo(() => {
    if (!admin) return {};
    const keys = ['maxProducts', 'maxOrders', 'maxCustomers', 'maxStaff', 'maxStores', 'storageGB'];
    return keys.reduce((acc: any, key) => {
      const override = admin.usageOverrides?.[key];
      const planLimit = admin.plan?.limits?.[key];
      const isOverride = override !== null && override !== undefined;
      acc[key] = { value: isOverride ? override : planLimit, inherited: !isOverride };
      return acc;
    }, {});
  }, [admin]);

  if (fetchingCurrent) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>;
  }

  if (!admin) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-6"><AlertCircle size={40} /></div>
        <h3 className="text-xl font-bold dark:text-white mb-2">Admin Not Found</h3>
        <p className="text-gray-500 max-w-xs mx-auto mb-8">The requested administrator data could not be retrieved. It may have been deleted or the ID is invalid.</p>
        <Button variant="danger" onClick={() => navigate(-1)} className="!rounded-2xl px-8 shadow-lg shadow-red-500/20"><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button>
      </div>
    );
  }

  const OverviewTab = () => (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100/50 dark:border-blue-800/30 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-blue-600 dark:text-blue-400"><Shield size={24} /></div>
            <Tag color={admin.isActive ? 'green' : 'red'} className="m-0 font-bold uppercase tracking-wider text-xs rounded-xl px-3 border-0">{admin.isActive ? 'Active' : 'Suspended'}</Tag>
          </div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Account Health</p>
          <p className="text-base text-gray-900 dark:text-white mt-1">{admin.isActive ? 'Optimal' : 'Restricted'}</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-100/50 dark:border-purple-800/30 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-purple-600 dark:text-purple-400"><Package size={20} /></div>
            <Tag color="purple" className="m-0 uppercase text-[10px] rounded-xl px-2.5 border-0">{admin.plan?.name || 'No Plan'}</Tag>
          </div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Current Plan</p>
          <p className="text-base text-gray-900 dark:text-white mt-1 capitalize">{admin.planTenure || 'Free Trial'}</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-100/50 dark:border-emerald-800/30 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-emerald-600 dark:text-emerald-400"><Activity size={20} /></div>
          </div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Onboarding Status</p>
          <p className="text-base text-gray-900 dark:text-white mt-1">{admin.onboardingStatus === 'subscribed' ? 'Onboarded' : 'Pending'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2"><div className="w-1.5 h-4 bg-blue-500 rounded-full"></div><h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Contact & Business</h3></div>
          <div className="space-y-2 sm:space-y-3 bg-gray-50/30 dark:bg-white/[0.02] p-4 sm:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <InfoItem icon={User} label="Full Name" value={admin.name} colorClass="bg-blue-100 dark:bg-blue-900/30 text-blue-600" />
            <InfoItem icon={Mail} label="Primary Email" value={admin.email} colorClass="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600" />
            <InfoItem icon={Building2} label="Business Name" value={admin.businessName} subValue={admin.businessType} colorClass="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2"><div className="w-1.5 h-4 bg-amber-500 rounded-full"></div><h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Registered Address</h3></div>
          <div className="bg-gray-50/30 dark:bg-white/[0.02] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 h-full min-h-[160px] flex items-start shadow-sm">
            <div className="flex gap-4 sm:gap-5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 mt-1 shadow-sm"><MapPin size={20} className="sm:w-6 sm:h-6" /></div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Office Location</p>
                <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{admin.address?.street},<br />{admin.address?.city}, {admin.address?.state}<br />{admin.address?.country} - {admin.address?.pincode}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PlanUsageTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2"><div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div><h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Resource Quotas</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {effectiveLimits.maxProducts.value !== 0 && effectiveLimits.maxProducts.value !== null && <LimitCard icon={<Package size={18} />} label="Max Products" value={effectiveLimits.maxProducts.value} inherited={effectiveLimits.maxProducts.inherited} planName={admin.plan?.name} />}
            {effectiveLimits.maxOrders.value !== 0 && effectiveLimits.maxOrders.value !== null && <LimitCard icon={<ShoppingCart size={18} />} label="Max Orders" value={effectiveLimits.maxOrders.value} inherited={effectiveLimits.maxOrders.inherited} planName={admin.plan?.name} />}
            {effectiveLimits.maxCustomers.value !== 0 && effectiveLimits.maxCustomers.value !== null && <LimitCard icon={<User size={18} />} label="Max Customers" value={effectiveLimits.maxCustomers.value} inherited={effectiveLimits.maxCustomers.inherited} planName={admin.plan?.name} />}
            {effectiveLimits.maxStaff.value !== 0 && effectiveLimits.maxStaff.value !== null && <LimitCard icon={<User size={18} />} label="Max Staff" value={effectiveLimits.maxStaff.value} inherited={effectiveLimits.maxStaff.inherited} planName={admin.plan?.name} />}
            {effectiveLimits.maxStores.value !== 0 && effectiveLimits.maxStores.value !== null && <LimitCard icon={<Layout size={18} />} label="Max Stores" value={effectiveLimits.maxStores.value} inherited={effectiveLimits.maxStores.inherited} planName={admin.plan?.name} />}
            {effectiveLimits.storageGB.value !== 0 && effectiveLimits.storageGB.value !== null && <LimitCard icon={<HardDrive size={18} />} label="Cloud Storage" value={effectiveLimits.storageGB.value} inherited={effectiveLimits.storageGB.inherited} planName={admin.plan?.name} />}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2"><div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div><h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Platform Features</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(admin.plan?.features || {}).map(([key, defaultValue]) => {
              const override = admin.featureOverrides?.[key];
              const isOverride = override !== null && override !== undefined;
              const isEnabled = isOverride ? override : defaultValue;
              if (!isEnabled) return null;
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              return (
                <div key={key} className="flex items-center justify-between p-4 rounded-2xl border border-emerald-100/50 bg-emerald-50/30 dark:bg-emerald-900/10 dark:border-emerald-900/30 transition-all duration-300 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="text-emerald-600 dark:text-emerald-400">
                      {key === 'analyticsEnabled' && <BarChart2 size={18} />}
                      {key === 'customDomain' && <Globe size={18} />}
                      {key === 'apiAccess' && <Database size={18} />}
                      {key === 'prioritySupport' && <HelpCircle size={18} />}
                      {key === 'exportData' && <Download size={18} />}
                      {key === 'whitelabel' && <ShieldCheck size={18} />}
                      {key === 'customThemes' && <Palette size={18} />}
                      {key === 'smsNotifications' && <Smartphone size={18} />}
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-200 leading-none">{label}</p>
                      {isOverride && <p className="text-[10px] uppercase tracking-tight text-amber-500 mt-1">Override</p>}
                    </div>
                  </div>
                  <CheckCircle2 size={18} className="text-emerald-500" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-1 sm:px-0">
      <PageMeta title={`Admin Details | ${admin.name}`} description="View detailed information about business administrator" />
      <ComponentCard
        titleBorder={false}
        title={
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <User size={20} className="sm:w-6 sm:h-6" strokeWidth={3} />
            </div>
            <div className="min-w-0">
              <div className="relative inline-block pr-16 sm:pr-20">
                <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white tracking-tight truncate leading-tight">{admin.name}</h2>
                {admin.isActive && admin.subscription?.status === 'active' && (
                  <span className="absolute -top-1 right-0 flex items-center px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] sm:text-[10px] uppercase tracking-wider border border-emerald-100 dark:border-emerald-800/50 shadow-sm whitespace-nowrap">Active</span>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[180px] sm:max-w-none">ID: {admin?._id}</p>
            </div>
          </div>
        }
        rightButtonNode={
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            {showActions && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex items-center gap-2 sm:gap-3">
                  {admin.isActive ? (
                    <Button variant="outline" size="xs" onClick={() => handleActionClick("suspend")} className="flex items-center gap-2 !text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10 !rounded-xl !px-4"><Ban className="w-4 h-4" /> Suspend</Button>
                  ) : (
                    <Button variant="outline" size="xs" onClick={() => handleActionClick("activate")} className="flex items-center gap-2 !text-emerald-500 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900/30 dark:hover:bg-emerald-900/10 !rounded-xl !px-4"><CheckCircle className="w-4 h-4" /> Activate</Button>
                  )}
                  {admin.onboardingStatus === "subscribed" && (!admin.subscription?.trialEndsAt || new Date(admin.subscription.trialEndsAt) <= new Date()) && (
                    <Button variant="outline" size="xs" onClick={() => handleActionClick("extend")} className="flex items-center gap-2 !text-blue-500 border-blue-200 hover:bg-blue-50 dark:border-blue-900/30 dark:hover:bg-blue-900/10 !rounded-xl !px-4"><CalendarClock className="w-4 h-4" /> Extend</Button>
                  )}
                  {admin.onboardingStatus === "pending_subscription" && (
                    <Button variant="outline" size="xs" onClick={() => handleActionClick("resend")} className="flex items-center gap-2 !text-indigo-500 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-900/30 dark:hover:bg-indigo-900/10 !rounded-xl !px-4"><SendHorizontal className="w-4 h-4" /> Resend Invite</Button>
                  )}
                </div>

                {/* Mobile Action Dropdown Placeholder - for very small screens */}
                <div className="sm:hidden flex items-center gap-1">
                  {admin.isActive ? (
                    <Button variant="outline" size="xs" onClick={() => handleActionClick("suspend")} className="!p-2 !text-red-500 !border-red-200 !rounded-xl"><Ban className="w-4 h-4" /></Button>
                  ) : (
                    <Button variant="outline" size="xs" onClick={() => handleActionClick("activate")} className="!p-2 !text-emerald-500 !border-emerald-200 !rounded-xl"><CheckCircle className="w-4 h-4" /></Button>
                  )}
                  <Button variant="outline" size="xs" className="!p-2 !text-gray-500 !border-gray-200 !rounded-xl"><MoreVertical className="w-4 h-4" /></Button>
                </div>

                <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block"></div>
              </div>
            )}
            <Button variant="danger" size="xs" onClick={() => navigate(-1)} className="flex items-center gap-2 !rounded-xl !px-4 shadow-lg shadow-red-500/10">
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
        }
      >
        <div className="p-1 sm:p-4 mt-0 sm:mt-1">
          <Tabs items={[
            { key: 'overview', label: 'Overview', icon: <Layout size={16} />, children: <OverviewTab /> },
            { key: 'usage', label: 'Plan & Usage', icon: <Activity size={16} />, children: <PlanUsageTab /> },
            {
              key: 'billing', label: 'Billing & Subscriptions', icon: <CreditCard size={16} />, children: (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Razorpay Summary */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2"><div className="w-1.5 h-4 bg-blue-500 rounded-full"></div><h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Razorpay Summary</h3></div>
                      <button onClick={() => setRazorpayModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 border border-blue-100 dark:border-blue-900/30">
                        <Eye size={13} /> View Details
                      </button>
                    </div>
                    {fetchingRazorpay ? (
                      <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
                    ) : razorpayData ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { label: 'Status', value: razorpayData.summary?.currentStatus || '—', icon: <Shield size={16} />, color: 'blue' },
                          { label: 'Plan', value: razorpayData.summary?.currentPlan || '—', icon: <Package size={16} />, color: 'purple' },
                          { label: 'Total Revenue', value: `₹${razorpayData.summary?.totalRevenueINR || '0.00'}`, icon: <TrendingUp size={16} />, color: 'emerald' },
                          { label: 'Invoices', value: razorpayData.summary?.totalInvoices ?? '0', icon: <FileText size={16} />, color: 'amber' },
                        ].map((item) => (
                          <div key={item.label} className={`p-4 rounded-2xl bg-${item.color}-50/50 dark:bg-${item.color}-900/10 border border-${item.color}-100/50 dark:border-${item.color}-900/30`}>
                            <div className={`text-${item.color}-600 dark:text-${item.color}-400 mb-2`}>{item.icon}</div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{item.label}</p>
                            <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5 capitalize">{String(item.value)}</p>
                          </div>
                        ))}
                      </div>
                    ) : <div className="py-8 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 flex items-center justify-center"><Empty description="No Razorpay data" /></div>}
                  </div>
                  {/* Subscription History */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1"><div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div><h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Subscription History</h3></div>
                    {subscriptions.length > 0 ? (
                      <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-white/[0.02] shadow-sm no-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[640px]">
                          <thead><tr className="bg-gray-50/50 dark:bg-gray-800/50">
                            {['Plan', 'Status', 'Tenure', 'Period'].map(h => <th key={h} className="p-4 text-xs font-bold uppercase tracking-wider text-gray-400">{h}</th>)}
                          </tr></thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {subscriptions.map((sub: any) => (
                              <tr key={sub._id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                <td className="p-4 font-semibold dark:text-gray-200 text-sm">{sub.planId?.name}</td>
                                <td className="p-4"><Tag color={sub.status === 'active' ? 'green' : sub.status === 'trialing' ? 'blue' : 'gray'} className="font-bold uppercase text-[10px] rounded-lg px-2 border-0">{sub.status}</Tag></td>
                                <td className="p-4 text-xs font-semibold uppercase text-gray-500">{sub.tenure}</td>
                                <td className="p-4 text-xs text-gray-500">{formatDateWithTiming(sub.startDate)} – {formatDateWithTiming(sub.endDate)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : <div className="py-10 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 flex items-center justify-center"><Empty description="No subscription records" /></div>}
                  </div>
                </div>
              )
            },
            {
              key: 'audit', label: 'Audit Log', icon: <Clock size={16} />, children: (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-4 bg-rose-500 rounded-full"></div><h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Activity Timeline</h3></div>
                    <button onClick={() => setAuditModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all duration-200 border border-rose-100 dark:border-rose-900/30">
                      <Eye size={13} /> View All
                    </button>
                  </div>
                  {/* Quick Counts */}
                  {auditLogs?.data?.summary && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {Object.entries(auditLogs.data.summary.quickCounts as Record<string, number>).filter(([,v]) => v > 0).map(([k, v]) => (
                        <div key={k} className="p-3 rounded-xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 text-center">
                          <p className="text-lg font-semibold text-gray-800 dark:text-white">{v}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5 capitalize">{k.replace(/([A-Z])/g,' $1')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Timeline */}
                  {fetchingAuditLogs ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-rose-500" /></div>
                  ) : auditLogs?.data?.logs?.length > 0 ? (
                    <div className="relative pl-6 space-y-4">
                      <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-100 dark:bg-gray-800"></div>
                      {auditLogs.data.logs.slice(0, 5).map((log: any) => (
                        <div key={log._id} className="relative">
                          <div className="absolute -left-4 w-2.5 h-2.5 rounded-full bg-rose-400 border-2 border-white dark:border-gray-900 top-1.5"></div>
                          <div className="ml-2 p-4 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 hover:border-rose-200 dark:hover:border-rose-900/30 transition-all duration-200">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <Tag color={log.action === 'created' ? 'green' : log.action === 'extended' ? 'blue' : log.action === 'suspended' ? 'red' : 'default'} className="font-bold uppercase text-[10px] rounded-lg px-2 border-0 m-0">{log.action?.replace(/_/g,' ')}</Tag>
                                <span className="text-[10px] font-semibold uppercase text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{log.performedBy}</span>
                              </div>
                              <span className="text-[10px] text-gray-400">{formatDateWithTiming(log.createdAt)}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{log.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="py-10 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 flex items-center justify-center"><Empty description="No audit logs" /></div>}
                </div>
              )
            },
          ]} />
        </div>
      </ComponentCard>

      {/* Confirmation Modal */}
      <Modal open={actionModalVisible} onOk={handleActionConfirm} onCancel={() => { setActionModalVisible(false); setActionType(null); }} okText={actionType === "resend" ? "Resend Onboarding" : actionType === "suspend" ? "Suspend Account" : actionType === "extend" ? "Extend Subscription" : actionType === "activate" ? "Activate Account" : "Confirm"} okButtonProps={{ className: `!rounded-xl font-bold shadow-lg transition-all duration-300 border-0 !px-6 !py-3 !h-auto w-full sm:w-auto ${actionType === "resend" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" : actionType === "activate" ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white" : actionType === "suspend" ? "bg-gradient-to-r from-red-500 to-rose-600 text-white" : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"}` }} cancelButtonProps={{ className: "!rounded-xl font-bold border-gray-200 text-gray-600 hover:bg-gray-100 !px-6 !py-3 !h-auto w-full sm:w-auto mt-2 sm:mt-0" }} confirmLoading={isActionLoading} centered closable={false} width={440} bodyStyle={{ padding: '0' }} style={{ borderRadius: '28px', overflow: 'hidden' }}>
        <div className="p-8 sm:p-10 flex flex-col items-center justify-center text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl ring-4 ring-white dark:ring-gray-800 ${actionType === 'suspend' ? 'bg-red-50 text-red-500' : actionType === 'activate' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
            {actionType === "resend" && <SendHorizontal className="w-10 h-10" />}
            {actionType === "suspend" && <Ban className="w-10 h-10" />}
            {actionType === "extend" && <CalendarClock className="w-10 h-10" />}
            {actionType === "activate" && <CheckCircle className="w-10 h-10" />}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            {actionType === 'resend' ? 'Resend Invite' : actionType === 'suspend' ? 'Suspend Admin' : actionType === 'extend' ? 'Extend Access' : 'Activate Admin'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-8">
            {actionType === 'extend' ? `Adding more days to ${admin?.name}'s current subscription tenure.` : `Are you sure you want to perform this action for ${admin?.name}? This may affect their platform access.`}
          </p>
          {actionType === "extend" && (
            <div className="w-full bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 mb-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Duration (Days)</label>
              <input type="number" value={extendDays} onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)} className="w-full bg-transparent text-3xl font-bold text-center text-gray-900 dark:text-white outline-none" min="1" autoFocus />
            </div>
          )}
        </div>
      </Modal>

      {/* Razorpay Detail Modal */}
      <Modal
        open={razorpayModalOpen}
        onCancel={() => setRazorpayModalOpen(false)}
        footer={null}
        centered
        width="min(680px, 95vw)"
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto', padding: '12px 4px 4px' } }}
        title={<div className="flex items-center gap-2"><div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600"><CreditCard size={16} /></div><span className="text-sm font-semibold text-gray-800 dark:text-white">Razorpay Details</span></div>}
      >
        {razorpayData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-1">
            {[
              ['Admin', razorpayData.summary?.adminName],
              ['Email', razorpayData.summary?.adminEmail],
              ['Status', razorpayData.summary?.currentStatus],
              ['Plan', razorpayData.summary?.currentPlan],
              ['Tenure', razorpayData.summary?.planTenure],
              ['Onboarding', razorpayData.summary?.onboardingStatus],
              ['Trial Ends', razorpayData.summary?.trialEndsAt ? formatDateWithTiming(razorpayData.summary.trialEndsAt) : '—'],
              ['Trial Extensions', String(razorpayData.summary?.trialExtensionsUsed ?? '0')],
              ['Extended Days', String(razorpayData.summary?.totalExtendedDays ?? '0')],
              ['Revenue (INR)', `₹${razorpayData.summary?.totalRevenueINR || '0.00'}`],
              ['Total Invoices', String(razorpayData.summary?.totalInvoices ?? '0')],
              ['Paid', String(razorpayData.summary?.paidInvoices ?? '0')],
              ['Failed', String(razorpayData.summary?.failedInvoices ?? '0')],
              ['RZP Customer ID', razorpayData.summary?.razorpayCustomerId || 'Not linked'],
              ['RZP Subscription ID', razorpayData.summary?.razorpaySubscriptionId || 'Not linked'],
              ['Period Start', razorpayData.summary?.currentPeriodStart ? formatDateWithTiming(razorpayData.summary.currentPeriodStart) : '—'],
              ['Period End', razorpayData.summary?.currentPeriodEnd ? formatDateWithTiming(razorpayData.summary.currentPeriodEnd) : '—'],
              ['Fetch Errors', razorpayData.summary?.hasFetchErrors ? 'Yes' : 'No'],
            ].map(([label, val]) => (
              <div key={label} className="flex flex-col p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">{label}</span>
                <span className="text-sm text-gray-800 dark:text-gray-200 break-all capitalize">{val || '—'}</span>
              </div>
            ))}
          </div>
        ) : <div className="py-8 flex justify-center"><Empty description="No Razorpay data available" /></div>}
      </Modal>

      {/* Audit Log Detail Modal */}
      <Modal
        open={auditModalOpen}
        onCancel={() => setAuditModalOpen(false)}
        footer={null}
        centered
        width="min(700px, 95vw)"
        styles={{ body: { maxHeight: '72vh', overflowY: 'auto', padding: '12px 4px 4px' } }}
        title={<div className="flex items-center gap-2"><div className="p-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-500"><Clock size={16} /></div><span className="text-sm font-semibold text-gray-800 dark:text-white">Audit Log</span>{auditLogs?.data?.summary && <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-500">{auditLogs.data.summary.totalLogs} entries</span>}</div>}
      >
        {auditLogs?.data ? (
          <div className="space-y-4 px-1">
            <div className="flex gap-2 flex-wrap">
              {auditLogs.data.summary?.byActor?.map((a: any) => (
                <div key={a.performedBy} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-base font-semibold text-gray-800 dark:text-white">{a.count}</span>
                  <span className="text-xs text-gray-400 capitalize">{a.performedBy}</span>
                </div>
              ))}
            </div>
            <div className="relative pl-5 space-y-3">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-100 dark:bg-gray-800"></div>
              {auditLogs.data.logs?.map((log: any) => (
                <div key={log._id} className="relative">
                  <div className="absolute -left-3 w-2 h-2 rounded-full bg-rose-400 border-2 border-white dark:border-gray-900 top-2"></div>
                  <div className="ml-2 p-3 rounded-xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800">
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                      <div className="flex items-center gap-1.5">
                        <Tag color={log.action === 'created' ? 'green' : log.action === 'extended' ? 'blue' : log.action === 'trial_started' ? 'cyan' : log.action === 'suspended' ? 'red' : 'default'} className="uppercase text-[10px] rounded-md px-1.5 border-0 m-0">{log.action?.replace(/_/g,' ')}</Tag>
                        <span className="text-[10px] uppercase text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">{log.performedBy}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{formatDateWithTiming(log.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{log.note}</p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {Object.entries(log.metadata).map(([mk, mv]) => (
                          <span key={mk} className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">{mk}: {String(mv)}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : <div className="py-8 flex justify-center"><Empty description="No audit logs available" /></div>}
      </Modal>
    </div>
  );
};

export default AdminDetails;

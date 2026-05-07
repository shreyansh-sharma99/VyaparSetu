import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Timeline, Modal } from 'antd';
import { Label } from '@/components/layout/label';
import Select from '../../components/form/Select';
import {
  ArrowLeft, User, Mail, CreditCard, Calendar, Clock, Activity, Zap,
  ShieldCheck, BarChart3, Globe, Code2, Headphones, Download, Layout,
  Bell, Box, ShoppingCart, Users, Store, HardDrive, XCircle,
  ArrowUpCircle, CalendarClock, Ban, RefreshCw, Settings2, ShieldAlert
} from 'lucide-react';
import { formatDateWithTiming } from '../../components/common/dateFormat';
import Loader from '../../components/UI/Loader';
import PageMeta from '@/components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/UI/button/Button';
import type { AppDispatch, RootState } from '../../store';
import {
  fetchSubscriptionById, clearCurrentSubscription,
  upgradeSubscription, cancelSubscription, extendSubscription,
  reconcileSubscription, forceStatusSubscription
} from './services/subscriptionSlice';
import { fetchPlans } from '../Plans/services/PlanSlice';
import { toast } from 'react-toastify';
import { decryptData } from '@/utility/crypto';
import { loginApi } from "@/Pages/login/services/authService";
import { fetchUserProfile } from "@/Pages/login/services/userSlice";
import InputField from "@/components/form/input/InputField";

const SubscriptionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { currentSubscription: sub, fetchingCurrent: loading, submitting } = useSelector(
    (state: RootState) => state.subscription
  );

  const { plans } = useSelector((state: RootState) => state.plan);
  const { profile } = useSelector((state: RootState) => state.user);

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<"upgrade" | "cancel" | "extend" | "reconcile" | "forceStatus" | null>(null);

  // Action specific states
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedTenure, setSelectedTenure] = useState<string>("");
  const [extendDays, setExtendDays] = useState<number>(1);
  const [forcedStatus, setForcedStatus] = useState<string>("");

  // Security states
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isFinalConfirmOpen, setIsFinalConfirmOpen] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const tenureOptions = useMemo(() => {
    if (!selectedPlan) return [];
    const plan = plans.find((p) => p._id === selectedPlan);
    if (!plan || !plan.billingCycles) return [];
    return plan.billingCycles
      .filter((cycle: any) => cycle.isEnabled)
      .map((cycle: any) => ({
        label: cycle.label || cycle.tenure.toUpperCase(),
        value: cycle.tenure,
      }));
  }, [plans, selectedPlan]);

  useEffect(() => {
    if (selectedPlan && tenureOptions.length > 0) {
      const isValid = tenureOptions.some((opt) => opt.value === selectedTenure);
      if (!isValid) {
        setSelectedTenure(tenureOptions[0].value);
      }
    }
  }, [selectedPlan, tenureOptions, selectedTenure]);

  useEffect(() => {
    if (id) {
      try {
        const decryptedId = decryptData(decodeURIComponent(id));
        if (decryptedId) {
          dispatch(fetchSubscriptionById(decryptedId));
        } else {
          toast.error("Invalid subscription ID");
          navigate(-1);
        }
      } catch (error) {
        toast.error("Unable to access subscription details");
        navigate(-1);
      }
      dispatch(fetchPlans());
      if (!profile) {
        dispatch(fetchUserProfile());
      }
    }
    return () => {
      dispatch(clearCurrentSubscription());
    };
  }, [dispatch, id, navigate]);

  const handleActionClick = useCallback((type: "upgrade" | "cancel" | "extend" | "reconcile" | "forceStatus") => {
    setActionType(type);
    setIsVerifyModalOpen(true);
    if (type === "upgrade" && sub?.planId?._id) {
      setSelectedPlan(""); // Reset to force selection
    }
    if (type === "forceStatus" && sub?.status) {
      setForcedStatus(sub.status);
    }
  }, [sub]);

  const handleVerifyPassword = async () => {
    if (!verifyPassword) {
      toast.warning("Please enter your password");
      return;
    }

    setIsVerifying(true);
    try {
      const userEmail = profile?.email || profile?.owner?.email || profile?.user?.email;

      if (!userEmail) {
        toast.error("User email not found. Please try logging in again.");
        return;
      }

      const credentials = {
        email: userEmail,
        password: verifyPassword
      };

      const response = await loginApi(credentials);
      if (response.success) {
        setIsVerifyModalOpen(false);
        setVerifyPassword("");
        // For Reconcile and Cancel, we can go straight to confirmation.
        // For others, we need the input modal first.
        setActionModalVisible(true);
        toast.success("Identity verified.");
      } else {
        toast.error("Verification failed. Incorrect password.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleActionConfirm = useCallback(async () => {
    if (!id || !actionType) return;

    // Ensure EVERY action goes through the final confirmation modal
    if (!isFinalConfirmOpen) {
      if (actionType === "upgrade" && !selectedPlan) {
        toast.error("Please select a plan");
        return;
      }
      if (actionType === "forceStatus" && !forcedStatus) {
        toast.error("Please select a status");
        return;
      }
      setActionModalVisible(false);
      setIsFinalConfirmOpen(true);
      return;
    }

    try {
      const decryptedId = decryptData(decodeURIComponent(id));
      if (!decryptedId) {
        toast.error("Session expired or invalid ID");
        return;
      }

      let resultAction;
      if (actionType === "upgrade") {
        resultAction = await dispatch(upgradeSubscription({
          id: decryptedId,
          data: { planId: selectedPlan, tenure: selectedTenure }
        }));
      } else if (actionType === "cancel") {
        resultAction = await dispatch(cancelSubscription(decryptedId));
      } else if (actionType === "extend") {
        resultAction = await dispatch(extendSubscription({
          id: decryptedId,
          data: { days: extendDays }
        }));
      } else if (actionType === "reconcile") {
        resultAction = await dispatch(reconcileSubscription());
      } else if (actionType === "forceStatus") {
        resultAction = await dispatch(forceStatusSubscription({
          id: decryptedId,
          data: { status: forcedStatus }
        }));
      }

      if (resultAction && (
        upgradeSubscription.fulfilled.match(resultAction) ||
        cancelSubscription.fulfilled.match(resultAction) ||
        extendSubscription.fulfilled.match(resultAction) ||
        reconcileSubscription.fulfilled.match(resultAction) ||
        forceStatusSubscription.fulfilled.match(resultAction)
      )) {
        setActionModalVisible(false);
        setIsFinalConfirmOpen(false);
        setActionType(null);
        dispatch(fetchSubscriptionById(decryptedId));
      }
    } catch (error) {
      console.error("Action failed:", error);
    }
  }, [id, actionType, selectedPlan, selectedTenure, extendDays, forcedStatus, isFinalConfirmOpen, dispatch]);

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
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border ${current.classes}`}>
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
    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100/50 dark:border-white/[0.05]">
      <div className={`mt-0.5 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 ${colorClass}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-tight mb-1">{label}</p>
        <div className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 leading-tight">
          {value}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageMeta
        title={`Subscription Details | ${sub?.adminId?.name || 'VyaparSetu'}`}
        description="Detailed overview of the business subscription plan"
      />


      <ComponentCard
        // titleBorder={false}
        title={sub?.adminId?.name || 'Loading...'}
        rightButtonNode={
          sub && (
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              {sub.status !== 'cancelled' && (
                <>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleActionClick("reconcile")}
                    className="flex items-center gap-2 !text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-900/30 dark:hover:bg-amber-900/10 !rounded-xl !px-3 sm:!px-4"
                  >
                    <RefreshCw size={16} /> Reconcile
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleActionClick("forceStatus")}
                    className="flex items-center gap-2 !text-purple-500 border-purple-200 hover:bg-purple-50 dark:border-purple-900/30 dark:hover:bg-purple-900/10 !rounded-xl !px-3 sm:!px-4"
                  >
                    <Settings2 size={16} /> Force Status
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleActionClick("upgrade")}
                    className="flex items-center gap-2 !text-emerald-500 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900/30 dark:hover:bg-emerald-900/10 !rounded-xl !px-3 sm:!px-4"
                  >
                    <ArrowUpCircle size={16} /> Upgrade
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleActionClick("cancel")}
                    className="flex items-center gap-2 !text-rose-500 border-rose-200 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-900/10 !rounded-xl !px-3 sm:!px-4"
                  >
                    <Ban size={16} /> Cancel
                  </Button>
                </>
              )}

              <div className="hidden sm:block w-[1px] h-6 bg-gray-200 dark:bg-gray-800 mx-1"></div>
              <Button variant="danger" size="xs" onClick={() => navigate(-1)} className="flex items-center gap-2 !rounded-xl !px-3 sm:!px-5 !py-2.5 shadow-lg shadow-red-500/10 font-semibold">
                <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
              </Button>
            </div>
          )
        }
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        ) : sub ? (
          <div className="space-y-8">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Section: Plan Limits */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-blue-500" size={18} />
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Plan Limits</h3>
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
                    <div key={idx} className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05] flex items-center gap-3">
                      <limit.icon size={16} className={limit.color} />
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase leading-none mb-1.5">{limit.label}</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
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
                  <Zap className="text-amber-500" size={18} />
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Features Included</h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {sub.planId?.features && Object.entries(sub.planId.features).map(([key, enabled]) => (
                    enabled ? (
                      <div key={key} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
                        <div className="text-emerald-500">{featureIcons[key] || <ShieldCheck size={14} />}</div>
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-tight">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            </div>

            {/* Section: History */}
            <div className="space-y-5 pt-4">
              <div className="flex items-center gap-2">
                <Activity className="text-purple-500" size={18} />
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Subscription History</h3>
              </div>
              <div className="bg-gray-50/50 dark:bg-white/[0.02] p-6 rounded-2xl border border-gray-100 dark:border-white/[0.05]">
                <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-hide hover:scrollbar-default">
                  <Timeline
                    className="mt-2"
                    items={sub.history?.map((item: any, index: number) => ({
                      children: (
                        <div key={index} className="pb-6 relative">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <span className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-widest ${item.action === 'created' ? 'bg-emerald-500 text-white' :
                                item.action === 'suspended' ? 'bg-rose-500 text-white' :
                                  item.action === 'reactivated' ? 'bg-blue-500 text-white' :
                                    item.action === 'extended' ? 'bg-amber-500 text-white' : 'bg-gray-600 text-white'
                                }`}>
                                {item.action}
                              </span>
                              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                                <Calendar size={12} />
                                {formatDateWithTiming(item.date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                              <User size={12} className="text-gray-400" />
                              <span className="text-[11px] font-semibold text-gray-500 uppercase">By {item.performedBy}</span>
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
      </ComponentCard>

      {/* Action Confirmation Modal */}
      <Modal
        open={actionModalVisible}
        onOk={handleActionConfirm}
        onCancel={() => { setActionModalVisible(false); setActionType(null); }}
        okText={
          actionType === "upgrade" ? "Upgrade Subscription" :
            actionType === "cancel" ? "Cancel Subscription" :
              actionType === "extend" ? "Extend Subscription" :
                actionType === "reconcile" ? "Reconcile Now" :
                  actionType === "forceStatus" ? "Update Status" : "Confirm"
        }
        okButtonProps={{
          className: `!rounded-xl font-bold shadow-lg transition-all duration-300 border-0 !px-6 !py-3 !h-auto w-full sm:w-auto ${actionType === "cancel" ? "bg-gradient-to-r from-red-500 to-rose-600 text-white" :
            actionType === "reconcile" ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white" :
              actionType === "forceStatus" ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white" :
                "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
            }`
        }}
        cancelButtonProps={{ className: "!rounded-xl font-bold border-gray-200 text-gray-600 hover:bg-gray-100 !px-6 !py-3 !h-auto w-full sm:w-auto mt-2 sm:mt-0" }}
        confirmLoading={submitting}
        centered
        closable={false}
        width={440}
        styles={{ body: { padding: '0' } }}
        style={{ borderRadius: '28px', overflow: 'hidden' }}
      >
        <div className="p-8 sm:p-10 flex flex-col items-center justify-center text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl ring-4 ring-white dark:ring-gray-800 ${actionType === 'cancel' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
            }`}>
            {actionType === "upgrade" && <ArrowUpCircle className="w-10 h-10" />}
            {actionType === "cancel" && <Ban className="w-10 h-10" />}
            {actionType === "extend" && <CalendarClock className="w-10 h-10" />}
            {actionType === "reconcile" && <RefreshCw className="w-10 h-10" />}
            {actionType === "forceStatus" && <ShieldAlert className="w-10 h-10" />}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            {actionType === 'upgrade' ? 'Upgrade Plan' :
              actionType === 'cancel' ? 'Cancel Subscription' :
                actionType === 'extend' ? 'Extend Access' :
                  actionType === 'reconcile' ? 'Reconcile Data' : 'Force Status Update'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-8">
            {actionType === 'upgrade' ? 'Select a new plan and tenure for this subscription.' :
              actionType === 'extend' ? 'Add more days to the current subscription tenure.' :
                actionType === 'reconcile' ? 'Synchronize subscription status with payment provider records.' :
                  actionType === 'forceStatus' ? 'Manually override the subscription status. Use with caution.' :
                    `Are you sure you want to cancel this subscription? This action cannot be undone.`}
          </p>

          {actionType === "upgrade" && (
            <div className="w-full space-y-4">
              <div className="text-left">
                <Label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Plan</Label>
                <Select
                  className="w-full"
                  placeholder="Choose a plan"
                  value={selectedPlan}
                  onChange={(val) => setSelectedPlan(val)}
                  options={plans.map(p => ({ label: p.name, value: p._id }))}
                />
              </div>
              {selectedPlan && tenureOptions.length > 0 && (
                <div className="text-left">
                  <Label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Tenure</Label>
                  <Select
                    className="w-full"
                    placeholder="Choose tenure"
                    value={selectedTenure}
                    onChange={(val) => setSelectedTenure(val)}
                    options={tenureOptions}
                  />
                </div>
              )}
            </div>
          )}

          {actionType === "extend" && (
            <div className="w-full bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 mb-2">
              <Label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Duration (Days)</Label>
              <input
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)}
                className="w-full bg-transparent text-3xl font-bold text-center text-gray-900 dark:text-white outline-none"
                min="1"
                autoFocus
              />
            </div>
          )}

          {actionType === "forceStatus" && (
            <div className="w-full space-y-4">
              <div className="text-left">
                <Label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">New Status</Label>
                <Select
                  className="w-full"
                  placeholder="Select status"
                  value={forcedStatus}
                  onChange={(val) => setForcedStatus(val)}
                  options={[
                    { label: 'Trialing', value: 'trialing' },
                    { label: 'Active', value: 'active' },
                    { label: 'Past Due', value: 'past_due' },
                    { label: 'Cancelled', value: 'cancelled' },
                    { label: 'Expired', value: 'expired' },
                  ]}
                />
              </div>
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
                <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={16} />
                <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed text-left">
                  Forcing status will bypass normal validation and sync logic. This should only be used to correct data inconsistencies.
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Password Verification Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-blue-500" size={18} />
            <span className="text-lg font-bold">Identity Verification</span>
          </div>
        }
        open={isVerifyModalOpen}
        onOk={handleVerifyPassword}
        onCancel={() => {
          setIsVerifyModalOpen(false);
          setVerifyPassword("");
        }}
        confirmLoading={isVerifying}
        okText="Verify Identity"
        cancelText="Cancel"
        centered
        width={400}
        okButtonProps={{
          className: "!rounded-xl bg-blue-600 hover:bg-blue-700 font-bold border-0 h-10 px-6"
        }}
        cancelButtonProps={{
          className: "!rounded-xl font-bold h-10 px-6"
        }}
      >
        <div className="py-4">
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            For security reasons, please enter your administrator password to proceed with this sensitive action.
          </p>
          <div className="space-y-4">
            <div>
              <Label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Admin Password</Label>
              <InputField
                type="password"
                placeholder="Enter your password"
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleVerifyPassword()}
                className="!rounded-xl border-gray-200"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2 p-3.5 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
              <User className="text-blue-500" size={18} />
              <span className="text-base font-medium text-blue-700 dark:text-blue-400">Verifying: {profile?.email || profile?.owner?.email || profile?.user?.email}</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Final Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-rose-500" size={18} />
            <span className="text-lg font-bold">Final Confirmation</span>
          </div>
        }
        open={isFinalConfirmOpen}
        onOk={handleActionConfirm}
        onCancel={() => setIsFinalConfirmOpen(false)}
        confirmLoading={submitting}
        okText="Yes, Proceed"
        cancelText="No, Go Back"
        centered
        width={400}
        okButtonProps={{
          className: "!rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 font-bold border-0 h-10 px-6"
        }}
        cancelButtonProps={{
          className: "!rounded-xl font-bold h-10 px-6"
        }}
      >
        <div className="py-4">
          {submitting ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader />
              <p className="mt-4 text-sm text-gray-500 animate-pulse font-medium">Processing your request...</p>
            </div>
          ) : (
            <>
              <p className="text-base text-gray-700 dark:text-gray-300 mb-4 font-semibold">
                Are you absolutely sure?
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                {actionType === 'upgrade' && `You are about to upgrade this subscription to the ${plans.find(p => p._id === selectedPlan)?.name} plan (${selectedTenure}).`}
                {actionType === 'extend' && `You are about to extend this subscription by ${extendDays} days.`}
                {actionType === 'forceStatus' && `You are about to manually force the status to "${forcedStatus.toUpperCase()}".`}
                {actionType === 'cancel' && "This will terminate the subscription and access immediately."}
                {actionType === 'reconcile' && "This will sync data with the payment provider records."}
              </p>
              <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20">
                <p className="text-xs text-rose-700 dark:text-rose-400 font-semibold uppercase tracking-wider mb-1.5">Warning</p>
                <p className="text-sm text-rose-600/80 dark:text-rose-400/80 leading-relaxed">
                  This action may have financial or service implications. Please verify all details before proceeding.
                </p>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default SubscriptionDetails;

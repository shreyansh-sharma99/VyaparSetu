import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Modal, ConfigProvider, theme } from "antd";
import type { AppDispatch, RootState } from "../../../store";
import { fetchAdmins, resendOnboarding, suspendAdmin, activateAdmin, extendSubscription, setFilterStatus, setManagementStatusFilter, setSearchQuery, setPagination, assignCashPlan, setPlanFilter, setPaymentMethodFilter, setExpiringSoonFilter, setCreatedByFilter } from "../admins/services/adminSlice";
import AdvanceTable from "../../../components/Tables/AdvanceTable";
import ComponentCard from "../../../components/common/ComponentCard";
import { formatDateWithTiming } from "../../../components/common/dateFormat";
import PageMeta from "@/components/common/PageMeta";
import { toast } from "react-toastify";
import { encryptData } from "../../../utility/crypto";
import Select from "../../../components/form/Select";
import { usePermission } from "@/utility/permission";
import StatusToggle from "../../../components/form/input/StatusToggle";
import { SendHorizontal, CheckCircle, CalendarClock, Ban, Loader2, IndianRupee } from "lucide-react";

import { useForm, Controller } from "react-hook-form";
import Button from "../../../components/UI/button/Button";
import { Label } from "@/components/layout/label";
import Input from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import { getPlans } from "../../Plans/services/PlanServices";
import { getManagersService } from "../../teamMember/teamMembers/services/teamMemberService";

const AdminManagementList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { pagePermissions } = usePermission();

    const currentTheme = useSelector((state: any) => state.ui?.theme);
    const isDark = currentTheme === 'dark';

    const { admins, loading, error, meta, filterStatus, managementStatusFilter, planFilter, paymentMethodFilter, expiringSoonFilter, createdByFilter, searchQuery, pagination, submitting } = useSelector((state: RootState) => state.admin);
    const [selectedRows, setSelectedRows] = useState<{ [key: string]: boolean }>({});
    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [selectedActionAdmin, setSelectedActionAdmin] = useState<any>(null);
    const [actionType, setActionType] = useState<"resend" | "suspend" | "activate" | "extend" | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [extendDays, setExtendDays] = useState<number>(1);

    // Cash Plan state
    const [isCashPlanModalOpen, setIsCashPlanModalOpen] = useState(false);
    const [selectedAdminId, setSelectedAdminId] = useState<string>('');
    const [plansList, setPlansList] = useState<any[]>([]);
    const [managersList, setManagersList] = useState<any[]>([]);
    const [fetchingCashPlanData, setFetchingCashPlanData] = useState(false);

    const {
        register: registerCash,
        handleSubmit: handleCashSubmit,
        control: controlCash,
        reset: resetCash,
        setValue: setCashValue,
        watch: watchCash,
        formState: { errors: cashErrors }
    } = useForm({
        defaultValues: {
            planId: '',
            tenure: '',
            paidAt: new Date().toISOString().split('T')[0],
            note: 'Cash received from client at office',
            collectedBy: ''
        }
    });

    const selectedPlanId = watchCash('planId');

    const selectedPlan = plansList.find(p => p._id === selectedPlanId);
    const tenureOptions = selectedPlan?.billingCycles
        ?.filter((c: any) => c.isEnabled)
        .map((c: any) => ({ label: c.label, value: c.tenure })) || [];

    useEffect(() => {
        setCashValue('tenure', '');
    }, [selectedPlanId, setCashValue]);

    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const [plansRes, managersRes] = await Promise.all([
                    getPlans(),
                    getManagersService()
                ]);
                if (plansRes?.data) setPlansList(plansRes.data);
                if (managersRes?.data?.data) setManagersList(managersRes.data.data);
            } catch (error) {
                console.error("Failed to load filter data", error);
            }
        };
        fetchFilterData();
    }, []);

    useEffect(() => {
        const params: any = {
            page: pagination.currentPage,
            limit: pagination.pageSize,
            search: searchQuery
        };

        if (managementStatusFilter && managementStatusFilter !== "all") {
            if (managementStatusFilter === "pending_subscription") {
                params.onboardingStatus = "pending_subscription";
            } else if (managementStatusFilter === "subscribed") {
                params.onboardingStatus = "subscribed";
            } else if (["trialing", "active", "past_due", "cancelled", "expired"].includes(managementStatusFilter)) {
                params.subscriptionStatus = managementStatusFilter;
            }
        }

        if (filterStatus !== "all") {
            params.isActive = filterStatus === "active";
        }

        if (planFilter && planFilter !== "all") params.plan = planFilter;
        if (paymentMethodFilter && paymentMethodFilter !== "all") params.paymentMethod = paymentMethodFilter;
        if (expiringSoonFilter && expiringSoonFilter !== "all") params.expiringSoon = expiringSoonFilter === "true";
        if (createdByFilter && createdByFilter !== "all") params.createdBy = createdByFilter;

        dispatch(fetchAdmins(params));
    }, [dispatch, pagination.currentPage, pagination.pageSize, searchQuery, managementStatusFilter, filterStatus, planFilter, paymentMethodFilter, expiringSoonFilter, createdByFilter]);

    const handleSearchChange = (query: string) => {
        dispatch(setSearchQuery(query));
    };

    const handleStatusFilterChange = (val: string) => {
        dispatch(setManagementStatusFilter(val));
    };

    const handleActiveStatusChange = (val: string) => {
        dispatch(setFilterStatus(val));
    };

    const handlePageChange = (page: number, size?: number) => {
        dispatch(setPagination({ currentPage: page, pageSize: size || pagination.pageSize }));
    };

    useEffect(() => {
        const initialState: { [key: string]: boolean } = {};
        admins.forEach(admin => {
            initialState[admin._id] = admin.isActive;
        });
        setSelectedRows(initialState);
    }, [admins]);

    const handleView = (admin: any) => {
        const encryptedId = encodeURIComponent(encryptData(admin.id));
        navigate(`/AdminManagement/view/${encryptedId}`, { state: { from: 'AdminManagement' } });
    };

    const handleEdit = (admin: any) => {
        const encryptedId = encodeURIComponent(encryptData(admin.id));
        navigate(`/Admin/edit/${encryptedId}`);
    };

    // const handleDelete = async (id: string) => {
    //     Modal.confirm({
    //         title: 'Are you sure you want to delete this admin?',
    //         content: 'This action cannot be undone and will permanently remove the admin account.',
    //         okText: 'Delete',
    //         okType: 'danger',
    //         cancelText: 'No',
    //         centered: true,
    //         onOk: async () => {
    //             try {
    //                 const resultAction = await dispatch(deleteAdmin(id));
    //                 if (deleteAdmin.fulfilled.match(resultAction)) {
    //                     toast.success("Admin deleted successfully");
    //                 } else {
    //                     toast.error(resultAction.payload as string || "Failed to delete admin");
    //                 }
    //             } catch (error) {
    //                 toast.error("An unexpected error occurred");
    //             }
    //         },
    //     });
    // };

    const handleActionClick = (admin: any, type: "resend" | "suspend" | "activate" | "extend") => {
        setSelectedActionAdmin(admin);
        setActionType(type);
        setActionModalVisible(true);
    };

    const openCashPlanModal = async (admin: any) => {
        setSelectedAdminId(admin.id || admin._id);
        setFetchingCashPlanData(true);
        try {
            const [plansRes, managersRes] = await Promise.all([
                getPlans(),
                getManagersService()
            ]);

            if (plansRes?.data) {
                setPlansList(plansRes.data);
            }
            if (managersRes?.data?.data) {
                setManagersList(managersRes.data.data);
            }
            setIsCashPlanModalOpen(true);
        } catch (error) {
            toast.error("Failed to load required data for Cash Plan");
        } finally {
            setFetchingCashPlanData(false);
        }
    };

    const onCashPlanSubmit = async (data: any) => {
        try {
            const resultAction = await dispatch(assignCashPlan({ id: selectedAdminId, planData: data }));
            if (assignCashPlan.fulfilled.match(resultAction)) {
                toast.success('Cash Plan assigned successfully!');
                setIsCashPlanModalOpen(false);
                resetCash();
                // Refresh list
                const params: any = {
                    page: pagination.currentPage,
                    limit: pagination.pageSize,
                    search: searchQuery
                };
                if (managementStatusFilter && managementStatusFilter !== "all") {
                    if (managementStatusFilter === "pending_subscription") params.onboardingStatus = "pending_subscription";
                    else if (managementStatusFilter === "subscribed") params.onboardingStatus = "subscribed";
                    else if (["trialing", "active", "past_due", "cancelled", "expired"].includes(managementStatusFilter)) {
                        params.subscriptionStatus = managementStatusFilter;
                    }
                }
                if (filterStatus !== "all") params.isActive = filterStatus === "active";
                if (planFilter && planFilter !== "all") params.plan = planFilter;
                if (paymentMethodFilter && paymentMethodFilter !== "all") params.paymentMethod = paymentMethodFilter;
                if (expiringSoonFilter && expiringSoonFilter !== "all") params.expiringSoon = expiringSoonFilter === "true";
                if (createdByFilter && createdByFilter !== "all") params.createdBy = createdByFilter;

                dispatch(fetchAdmins(params));
            } else {
                toast.error(resultAction.payload as string || 'Failed to assign Cash Plan');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    const handleActionConfirm = async () => {
        if (!selectedActionAdmin || !actionType) return;

        setIsActionLoading(true);
        try {
            if (actionType === "resend") {
                const resultAction = await dispatch(resendOnboarding(selectedActionAdmin.id));
                if (resendOnboarding.fulfilled.match(resultAction)) {
                    toast.success("Onboarding resent successfully");
                } else {
                    toast.error(resultAction.payload as string || "Failed to resend onboarding");
                }
            } else if (actionType === "suspend") {
                const resultAction = await dispatch(suspendAdmin(selectedActionAdmin.id));
                if (suspendAdmin.fulfilled.match(resultAction)) {
                    toast.success("Client suspended successfully");
                } else {
                    toast.error(resultAction.payload as string || "Failed to suspend admin");
                }
            } else if (actionType === "extend") {
                const resultAction = await dispatch(extendSubscription({ id: selectedActionAdmin.id, days: extendDays }));
                if (extendSubscription.fulfilled.match(resultAction)) {
                    toast.success("Subscription extended successfully");
                } else {
                    toast.error(resultAction.payload as string || "Failed to extend subscription");
                }
            } else if (actionType === "activate") {
                const resultAction = await dispatch(activateAdmin(selectedActionAdmin.id));
                if (activateAdmin.fulfilled.match(resultAction)) {
                    toast.success("Client activated successfully");
                } else {
                    toast.error(resultAction.payload as string || "Failed to activate admin");
                }
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsActionLoading(false);
            setActionModalVisible(false);
            setSelectedActionAdmin(null);
            setActionType(null);
            setExtendDays(30);
            const params: any = {
                page: pagination.currentPage,
                limit: pagination.pageSize,
                search: searchQuery
            };
            if (managementStatusFilter && managementStatusFilter !== "all") {
                if (managementStatusFilter === "pending_subscription") params.onboardingStatus = "pending_subscription";
                else if (managementStatusFilter === "subscribed") params.onboardingStatus = "subscribed";
                else if (["trialing", "active", "past_due", "cancelled", "expired"].includes(managementStatusFilter)) {
                    params.subscriptionStatus = managementStatusFilter;
                }
            }
            if (filterStatus !== "all") params.isActive = filterStatus === "active";
            if (planFilter && planFilter !== "all") params.plan = planFilter;
            if (paymentMethodFilter && paymentMethodFilter !== "all") params.paymentMethod = paymentMethodFilter;
            if (expiringSoonFilter && expiringSoonFilter !== "all") params.expiringSoon = expiringSoonFilter === "true";
            if (createdByFilter && createdByFilter !== "all") params.createdBy = createdByFilter;

            dispatch(fetchAdmins(params));
        }
    };

    const tableRows = admins.map((admin) => ({
        ...admin,
        id: admin._id,
        onboardingStatusRaw: admin.onboardingStatus,
        statusRaw: admin.status,
        planName: admin.plan?.name || "N/A",
        subStatusBadge: (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${admin.subscription?.status === "active"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : admin.subscription?.status === "cancelled"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : admin.subscription?.status === "trialing"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}>
                {(admin.subscription?.status || "inactive").toUpperCase()}
            </span>
        ),
        joinedDate: formatDateWithTiming(admin.createdAt),
        trialEndsAt: admin.subscription?.trialEndsAt ? formatDateWithTiming(admin.subscription.trialEndsAt) : "N/A",
        statusBadge: (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${admin.isActive
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}>
                {admin.isActive ? "ACTIVE" : "INACTIVE"}
            </span>
        ),
        businessInfo: `${admin.businessName} (${admin.businessType})`,
        onboardingStatusBadge: (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${admin.onboardingStatus === "pending_subscription"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50"
                : admin.onboardingStatus === "subscribed"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}>
                {admin.onboardingStatus === "pending_subscription" ? "PENDING SUBSCRIPTION" :
                    admin.onboardingStatus === "subscribed" ? "SUBSCRIBED" : (admin.onboardingStatus || "N/A").toUpperCase()}
            </span>
        ),
        createdBy: admin.createdBy?.name || "N/A",
    }));



    const headers = [
        { label: "Client Name", key: "name", value: "checked" as const },
        { label: "Email", key: "email", value: "checked" as const },
        { label: "Phone", key: "phone", value: "checked" as const },
        { label: "Business Details", key: "businessInfo", value: "checked" as const },
        { label: "Current Plan", key: "planName", value: "checked" as const },
        { label: "Joining Date", key: "joinedDate", value: "checked" as const },
        { label: "Trial End Date", key: "trialEndsAt", value: "checked" as const },
        { label: "Created By", key: "createdBy", value: "checked" as const },
        { label: "Status", key: "statusBadge", value: "checked" as const },
        { label: "Subscription", key: "subStatusBadge", value: "checked" as const },
        { label: "Onboarding Status", key: "onboardingStatusBadge", value: "checked" as const },
    ];


    return (
        <div className="">
            <PageMeta title="Business Clients | VyaparSetu" description="Manage all business Clients on the platform" />
            <ComponentCard
                title="Client Management Lists"
                rightButtonNode={
                    <StatusToggle status={filterStatus} onStatusChange={handleActiveStatusChange} />
                }
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div>
                        <Label className="text-xs mb-1 block text-gray-500">Status / Sub</Label>
                        <Select
                            value={managementStatusFilter}
                            options={[
                                { label: "All Status", value: "all" },
                                { label: "Pending Subscription", value: "pending_subscription" },
                                { label: "Subscribed", value: "subscribed" },
                                { label: "Trialing", value: "trialing" },
                                { label: "Active", value: "active" },
                                { label: "Past Due", value: "past_due" },
                                { label: "Cancelled", value: "cancelled" },
                                { label: "Expired", value: "expired" },
                            ]}
                            onChange={handleStatusFilterChange}
                        />
                    </div>
                    <div>
                        <Label className="text-xs mb-1 block text-gray-500">Plan</Label>
                        <Select
                            value={planFilter}
                            options={[{ label: "All Plans", value: "all" }, ...plansList.map(p => ({ label: p.name, value: p._id }))]}
                            onChange={(val) => dispatch(setPlanFilter(val))}
                        />
                    </div>
                    <div>
                        <Label className="text-xs mb-1 block text-gray-500">Payment Method</Label>
                        <Select
                            value={paymentMethodFilter}
                            options={[
                                { label: "All Methods", value: "all" },
                                { label: "Cash", value: "cash" },
                                // { label: "Online", value: "online" },
                                { label: "Trial", value: "trial" }
                            ]}
                            onChange={(val) => dispatch(setPaymentMethodFilter(val))}
                        />
                    </div>
                    <div>
                        <Label className="text-xs mb-1 block text-gray-500">Expiring Soon</Label>
                        <Select
                            value={expiringSoonFilter}
                            options={[
                                { label: "All", value: "all" },
                                { label: "Expiring Soon", value: "true" },
                                { label: "Not Expiring", value: "false" }
                            ]}
                            onChange={(val) => dispatch(setExpiringSoonFilter(val))}
                        />
                    </div>
                    <div>
                        <Label className="text-xs mb-1 block text-gray-500">Created By</Label>
                        <Select
                            value={createdByFilter}
                            options={[{ label: "All Creators", value: "all" }, ...managersList.map(m => ({ label: m.name, value: m._id }))]}
                            onChange={(val) => dispatch(setCreatedByFilter(val))}
                        />
                    </div>
                </div>
                <AdvanceTable
                    headers={headers as any}
                    rows={tableRows}
                    loading={loading}
                    error={error}
                    searchQuery={searchQuery}
                    setSearchQuery={handleSearchChange}
                    showAddButton={pagePermissions.canWrite}
                    addButtonText="Add Client"
                    addButtonPath="/Admin/add"
                    onView={pagePermissions.canRead ? handleView : undefined}
                    onEdit={pagePermissions.canUpdate ? handleEdit : undefined}
                    // onDelete={handleDelete}
                    customActions={(row: any) => {
                        if (!pagePermissions.canUpdate) return null;
                        const onboardingStatus = row.onboardingStatusRaw || row.onboardingStatus;
                        const status = row.statusRaw || row.status;
                        const actions = [];

                        if (!row.isActive && row?.subscription?.status === "cancelled") {
                            actions.push(
                                <button key="activate" onClick={() => handleActionClick(row, "activate")} className="text-emerald-600 hover:text-emerald-800 transition-colors" title="Activate Account">
                                    <CheckCircle className="w-5 h-5" strokeWidth={1.75} />
                                </button>
                            );
                        } else if (onboardingStatus === "pending_subscription") {
                            actions.push(
                                <button key="resend" onClick={() => handleActionClick(row, "resend")} className="text-blue-600 hover:text-blue-800 transition-colors" title="Resend Onboarding">
                                    <SendHorizontal className="w-5 h-5" strokeWidth={1.75} />
                                </button>
                            );
                        } else if (onboardingStatus === "subscribed") {
                            const canExtend = row?.canExtend === true;
                            actions.push(
                                <button key="suspend" onClick={() => handleActionClick(row, "suspend")} className="text-red-600 hover:text-red-800 transition-colors" title="Suspend Account">
                                    <Ban className="w-5 h-5" strokeWidth={1.75} />
                                </button>
                            );
                            if (canExtend) {
                                actions.push(
                                    <button key="extend" onClick={() => handleActionClick(row, "extend")} className="text-blue-600 hover:text-blue-800 transition-colors" title="Extend Subscription">
                                        <CalendarClock className="w-5 h-5" strokeWidth={1.75} />
                                    </button>
                                );
                            }
                        } else if (status === "expired") {
                            actions.push(
                                <button key="activate" onClick={() => handleActionClick(row, "activate")} className="text-emerald-600 hover:text-emerald-800 transition-colors" title="Activate Account">
                                    <CheckCircle className="w-5 h-5" strokeWidth={1.75} />
                                </button>
                            );
                        }

                        if (row.canShowCashpLanAssign) {
                            actions.push(
                                <button
                                    key="cashplan"
                                    onClick={() => openCashPlanModal(row)}
                                    className="text-green-600 hover:text-green-800 disabled:opacity-50 transition-colors"
                                    title="Assign Cash Plan"
                                    disabled={fetchingCashPlanData}
                                >
                                    {fetchingCashPlanData && selectedAdminId === row.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <IndianRupee className="w-5 h-5" />
                                    )}
                                </button>
                            );
                        }

                        if (actions.length === 0) return null;
                        return <div className="flex items-center gap-2">{actions}</div>;
                    }}
                    checkboxHeading="Action"
                    selectedRows={selectedRows}
                    onSelectionChange={setSelectedRows}
                    currentPage={pagination.currentPage}
                    total={meta?.total || 0}
                    pageSize={pagination.pageSize}
                    onPageChange={handlePageChange}
                    maxHeight="calc(100vh - 350px)"
                />
            </ComponentCard>



            <Modal
                open={actionModalVisible}
                onOk={handleActionConfirm}
                onCancel={() => {
                    setActionModalVisible(false);
                    setSelectedActionAdmin(null);
                    setActionType(null);
                }}
                okText={
                    actionType === "resend" ? "Resend Onboarding" :
                        actionType === "suspend" ? "Suspend Account" :
                            actionType === "extend" ? "Extend Subscription" :
                                actionType === "activate" ? "Activate Account" : "Confirm"
                }
                okButtonProps={{
                    className: `!rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 border-0 !px-6 !py-2.5 !h-auto ${actionType === "resend" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700" :
                        actionType === "activate" ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700" :
                            actionType === "suspend" ? "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700" :
                                actionType === "extend" ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700" : ""
                        }`
                }}
                cancelButtonProps={{
                    className: "!rounded-xl font-medium border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all duration-300 !px-6 !py-2.5 !h-auto"
                }}
                confirmLoading={isActionLoading}
                centered
                closable={false}
                width={440}
                style={{ borderRadius: '28px', padding: '0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}
                styles={{
                    body: { padding: actionType === 'suspend' ? '20px 32px 16px' : '40px 32px 16px' },
                    footer: { borderTop: 'none', padding: '0 32px 32px', display: 'flex', justifyContent: 'center', gap: '12px' }
                }}
            >
                <div className="flex flex-col items-center justify-center text-center">
                    {actionType === "resend" && (
                        <>
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-800 shadow-xl transform transition-transform hover:scale-105">
                                    <SendHorizontal className="w-10 h-10" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-3 tracking-tight">Resend Onboarding</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-[320px]">
                                You are about to resend the onboarding invitation to <strong className="text-gray-900 dark:text-white font-semibold">{selectedActionAdmin?.name}</strong>.
                            </p>
                        </>
                    )}
                    {actionType === "suspend" && (
                        <div className="flex flex-col items-center justify-center text-center py-4 w-full">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                <div className="relative w-20 h-20 bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-800 shadow-xl transform transition-transform hover:scale-105">
                                    <Ban className="w-10 h-10" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-3 tracking-tight">Suspend Account</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-[320px]">
                                This action will immediately revoke access for <strong className="text-gray-900 dark:text-white font-semibold">{selectedActionAdmin?.name}</strong>. Are you sure?
                            </p>
                        </div>
                    )}
                    {actionType === "extend" && (
                        <div className="flex flex-col items-center justify-center text-center py-4 w-full">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-800 shadow-xl transform transition-transform hover:scale-105">
                                    <CalendarClock className="w-10 h-10" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-3 tracking-tight">Extend Subscription</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-[320px] mb-6">
                                Add more days to <strong className="text-gray-900 dark:text-white font-semibold">{selectedActionAdmin?.name}</strong>'s subscription.
                            </p>
                            <div className="w-full max-w-[200px] bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Number of Days</label>
                                <input
                                    type="number"
                                    value={extendDays}
                                    onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)}
                                    className="w-full bg-transparent text-2xl font-bold text-center text-gray-800 dark:text-white outline-none"
                                    min="1"
                                />
                            </div>
                        </div>
                    )}
                    {actionType === "activate" && (
                        <>
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-800 shadow-xl transform transition-transform hover:scale-105">
                                    <CheckCircle className="w-10 h-10" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-3 tracking-tight">Activate Account</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed max-w-[320px]">
                                Ready to bring <strong className="text-gray-900 dark:text-white font-semibold">{selectedActionAdmin?.name}</strong> back online? They will regain full access.
                            </p>
                        </>
                    )}
                </div>
            </Modal>

            {/* Cash Plan Modal */}
            <ConfigProvider
                theme={{
                    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
                    components: {
                        Modal: {
                            contentBg: isDark ? '#0B0F19' : '#ffffff',
                            headerBg: isDark ? '#0B0F19' : '#ffffff',
                        },
                    },
                }}
            >
                <Modal
                    title={<span className="text-xl font-bold text-blue-600 dark:text-blue-400">Assign Cash Plan</span>}
                    open={isCashPlanModalOpen}
                    onCancel={() => setIsCashPlanModalOpen(false)}
                    footer={null}
                    destroyOnHidden
                    width={700}
                    classNames={{
                        header: 'dark:bg-[#0B0F19] dark:border-b dark:border-gray-800 pb-2',
                        body: 'dark:bg-[#0B0F19]',
                    }}
                >
                    <form onSubmit={handleCashSubmit(onCashPlanSubmit)} className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Row 1 */}
                            <div>
                                <Label>Select Plan <span className="text-red-500">*</span></Label>
                                <Controller
                                    name="planId"
                                    control={controlCash}
                                    rules={{ required: 'Plan is required' }}
                                    render={({ field }) => (
                                        <Select
                                            options={plansList.map(p => ({ label: p.name, value: p._id }))}
                                            placeholder="Select a plan"
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={!!cashErrors.planId}
                                        />
                                    )}
                                />
                                {cashErrors.planId && <span className="text-xs text-red-500">{cashErrors.planId.message}</span>}
                            </div>

                            <div>
                                <Label>Tenure <span className="text-red-500">*</span></Label>
                                <Controller
                                    name="tenure"
                                    control={controlCash}
                                    rules={{ required: 'Tenure is required' }}
                                    render={({ field }) => (
                                        <Select
                                            options={tenureOptions}
                                            placeholder="Select tenure"
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={!!cashErrors.tenure}
                                            disabled={!selectedPlanId}
                                        />
                                    )}
                                />
                                {cashErrors.tenure && <span className="text-xs text-red-500">{cashErrors.tenure.message}</span>}
                            </div>

                            {/* Row 2 */}
                            <div>
                                <Label>Paid At</Label>
                                <Input
                                    {...registerCash('paidAt')}
                                    type="date"
                                    disabled
                                />
                            </div>

                            <div>
                                <Label>Collected By <span className="text-red-500">*</span></Label>
                                <Controller
                                    name="collectedBy"
                                    control={controlCash}
                                    rules={{ required: 'Collected by is required' }}
                                    render={({ field }) => (
                                        <Select
                                            options={managersList.map(m => ({ label: `${m.name} (${m.userType})`, value: m._id }))}
                                            placeholder="Select team member"
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={!!cashErrors.collectedBy}
                                        />
                                    )}
                                />
                                {cashErrors.collectedBy && <span className="text-xs text-red-500">{cashErrors.collectedBy.message}</span>}
                            </div>

                            {/* Row 3 - Full Width */}
                            <div className="col-span-1 md:col-span-2">
                                <Label>Note</Label>
                                <TextArea
                                    {...registerCash('note')}
                                    rows={2}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
                            <Button variant="outline" type="button" onClick={() => setIsCashPlanModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" disabled={submitting}>
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {submitting ? 'Assigning...' : 'Assign Plan'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </ConfigProvider>
        </div>
    );
};

export default AdminManagementList;

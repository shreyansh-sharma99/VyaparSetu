import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Modal, Tabs } from "antd";
import type { AppDispatch, RootState } from "../../../store";
import { fetchAdmins, resendOnboarding, suspendAdmin, activateAdmin, extendSubscription } from "../admins/services/adminSlice";
import AdvanceTable from "../../../components/Tables/AdvanceTable";
import ComponentCard from "../../../components/common/ComponentCard";
import { formatDateWithTiming } from "../../../components/common/dateFormat";
import PageMeta from "@/components/common/PageMeta";
import { toast } from "react-toastify";
import { encryptData } from "../../../utility/crypto";
import Select from "../../../components/form/Select";
import StatusToggle from "../../../components/form/input/StatusToggle";
import { SendHorizontal, AlertTriangle, CheckCircle, CalendarClock, Ban } from "lucide-react";

const AdminManagementList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { admins, loading, error, meta } = useSelector((state: RootState) => state.admin);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedRows, setSelectedRows] = useState<{ [key: string]: boolean }>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [selectedActionAdmin, setSelectedActionAdmin] = useState<any>(null);
    const [actionType, setActionType] = useState<"resend" | "suspend" | "activate" | "extend" | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [extendDays, setExtendDays] = useState<number>(1);
    const [activeStatus, setActiveStatus] = useState("all");

    useEffect(() => {
        setCurrentPage(1);
    }, [activeStatus]);

    useEffect(() => {
        const params: any = { page: currentPage, limit: pageSize, search: searchQuery };

        if (statusFilter === "pending_subscription") {
            params.onboardingStatus = "pending_subscription";
        } else if (statusFilter === "subscribed") {
            params.onboardingStatus = "subscribed";
        } else if (["trialing", "active", "past_due", "cancelled", "expired"].includes(statusFilter)) {
            params.subscriptionStatus = statusFilter;
        }

        if (activeStatus !== "all") {
            params.isActive = activeStatus === "active";
        }

        dispatch(fetchAdmins(params));
    }, [dispatch, currentPage, pageSize, searchQuery, statusFilter, activeStatus]);

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
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
                    toast.success("Admin suspended successfully");
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
                    toast.success("Admin activated successfully");
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
            const params: any = { page: currentPage, limit: pageSize, search: searchQuery };
            if (statusFilter === "pending_subscription") params.onboardingStatus = "pending_subscription";
            else if (statusFilter === "subscribed") params.onboardingStatus = "subscribed";
            else if (statusFilter === "expired") params.status = "expired";
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
    }));



    const headers = [
        { label: "Admin Name", key: "name", value: "checked" as const },
        { label: "Email", key: "email", value: "checked" as const },
        { label: "Phone", key: "phone", value: "checked" as const },
        { label: "Business Details", key: "businessInfo", value: "checked" as const },
        { label: "Current Plan", key: "planName", value: "checked" as const },
        { label: "Joining Date", key: "joinedDate", value: "checked" as const },
        { label: "Trial End Date", key: "trialEndsAt", value: "checked" as const },
        { label: "Status", key: "statusBadge", value: "checked" as const },
        { label: "Subscription", key: "subStatusBadge", value: "checked" as const },
        { label: "Onboarding Status", key: "onboardingStatusBadge", value: "checked" as const }
    ];

    const handlePageChange = (page: number, size?: number) => {
        setCurrentPage(page);
        if (size) setPageSize(size);
    };

    return (
        <div className="">
            <PageMeta title="Business Admins | VyaparSetu" description="Manage all business admins on the platform" />
            <ComponentCard
                title="Admin Management Lists"
                rightButtonNode={
                    <div className="flex items-center gap-3">
                        <div className="w-52">
                            <Select
                                value={statusFilter}
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
                                onChange={(val) => {
                                    setStatusFilter(val);
                                    setCurrentPage(1);
                                }}
                                placeholder="Filter by Status"
                            />
                        </div>
                        <StatusToggle status={activeStatus} onStatusChange={setActiveStatus} />

                    </div>
                }
            >
                <AdvanceTable
                    headers={headers as any}
                    rows={tableRows}
                    loading={loading}
                    error={error}
                    searchQuery={searchQuery}
                    setSearchQuery={handleSearchChange}
                    showAddButton={true}
                    addButtonText="Add Admin"
                    addButtonPath="/Admin/add"
                    onView={handleView}
                    onEdit={handleEdit}
                    // onDelete={handleDelete}
                    customActions={(row: any) => {
                        const onboardingStatus = row.onboardingStatusRaw || row.onboardingStatus;
                        const status = row.statusRaw || row.status;

                        if (!row.isActive && row?.subscription?.status === "cancelled") {
                            return (
                                <button onClick={() => handleActionClick(row, "activate")} className="text-emerald-600 hover:text-emerald-800 transition-colors" title="Activate Account">
                                    <CheckCircle className="w-5 h-5" strokeWidth={1.75} />
                                </button>
                            );
                        } else if (onboardingStatus === "pending_subscription") {
                            return (
                                <button onClick={() => handleActionClick(row, "resend")} className="text-blue-600 hover:text-blue-800 transition-colors" title="Resend Onboarding">
                                    <SendHorizontal className="w-5 h-5" strokeWidth={1.75} />
                                </button>
                            );
                        } else if (onboardingStatus === "subscribed") {
                            const canExtend = !row?.subscription?.trialEndsAt || new Date(row.subscription.trialEndsAt) <= new Date();
                            return (
                                <>
                                    <button onClick={() => handleActionClick(row, "suspend")} className="text-red-600 hover:text-red-800 transition-colors" title="Suspend Account">
                                        <Ban className="w-5 h-5" strokeWidth={1.75} />
                                    </button>
                                    {canExtend && (
                                        <button onClick={() => handleActionClick(row, "extend")} className="text-blue-600 hover:text-blue-800 transition-colors" title="Extend Subscription">
                                            <CalendarClock className="w-5 h-5" strokeWidth={1.75} />
                                        </button>
                                    )}
                                </>
                            );
                        } else if (status === "expired") {
                            return (
                                <button onClick={() => handleActionClick(row, "activate")} className="text-emerald-600 hover:text-emerald-800 transition-colors" title="Activate Account">
                                    <CheckCircle className="w-5 h-5" strokeWidth={1.75} />
                                </button>
                            );
                        }
                        return null;
                    }}
                    checkboxHeading="Action"
                    selectedRows={selectedRows}
                    onSelectionChange={setSelectedRows}
                    currentPage={currentPage}
                    total={meta?.total || 0}
                    pageSize={pageSize}
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
        </div>
    );
};

export default AdminManagementList;

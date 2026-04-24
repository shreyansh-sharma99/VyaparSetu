import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import { fetchAdmins, fetchAdminById, clearCurrentAdmin } from "./services/adminSlice";
import AdminDetailsModal from "./AdminDetailsModal";
import AdvanceTable from "../../../components/Tables/AdvanceTable";
import ComponentCard from "../../../components/common/ComponentCard";
import { formatDateWithTiming } from "../../../components/common/dateFormat";
import PageMeta from "@/components/common/PageMeta";
import { encryptData } from "../../../utility/crypto";
import StatusToggle from "../../../components/form/input/StatusToggle";

const AdminsList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { admins, loading, error, meta, currentAdmin, fetchingCurrent } = useSelector((state: RootState) => state.admin);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedRows, setSelectedRows] = useState<{ [key: string]: boolean }>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [status, setStatus] = useState("all");

    useEffect(() => {
        setCurrentPage(1);
    }, [status]);

    useEffect(() => {
        dispatch(fetchAdmins({
            page: currentPage,
            limit: pageSize,
            search: searchQuery,
            isActive: status === "all" ? undefined : status === "active"
        }));
    }, [dispatch, currentPage, pageSize, searchQuery, status]);

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
        setDetailModalVisible(true);
        dispatch(fetchAdminById(admin.id));
    };

    const handleCloseModal = () => {
        setDetailModalVisible(false);
        dispatch(clearCurrentAdmin());
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


    // const handleToggleStatus = async (admin: any) => {
    //     const newStatus = !admin.isActive;
    //     try {
    //         const resultAction = await dispatch(updateAdmin({
    //             id: admin._id,
    //             adminData: { isActive: newStatus }
    //         }));

    //         if (updateAdmin.fulfilled.match(resultAction)) {
    //             toast.success(`Admin status updated to ${newStatus ? 'Active' : 'Inactive'}`);
    //         } else {
    //             toast.error(resultAction.payload as string || "Failed to update status");
    //         }
    //     } catch (error) {
    //         toast.error("An unexpected error occurred");
    //     }
    // };


    const tableRows = admins.map((admin) => ({
        ...admin,
        id: admin._id,
        planName: admin.plan?.name || "N/A",
        subStatus: admin.subscription?.status || "inactive",
        joinedDate: formatDateWithTiming(admin.createdAt),
        statusIcon: admin.isActive ? "Active" : "Inactive",
        businessInfo: `${admin.businessName} (${admin.businessType})`,
    }));



    const headers = [
        { label: "Admin Name", key: "name", value: "checked" as const },
        { label: "Email", key: "email", value: "checked" as const },
        { label: "Phone", key: "phone", value: "checked" as const },
        { label: "Business Details", key: "businessInfo", value: "checked" as const },
        { label: "Current Plan", key: "planName", value: "checked" as const },
        { label: "Subscription", key: "subStatus", value: "checked" as const },
        { label: "Joining Date", key: "joinedDate", value: "checked" as const },
        { label: "Status", key: "statusIcon", value: "checked" as const },
    ];

    const handlePageChange = (page: number, size?: number) => {
        setCurrentPage(page);
        if (size) setPageSize(size);
    };

    return (
        <div className="">
            <PageMeta title="Business Admins | VyaparSetu" description="Manage all business admins on the platform" />
            <ComponentCard
                title="Admin Lists"
                rightButtonNode={
                    <StatusToggle status={status} onStatusChange={setStatus} />
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
                    checkboxHeading="Action"
                    // onCheckbox={true}
                    // onCheckboxToggle={handleToggleStatus}
                    selectedRows={selectedRows}
                    onSelectionChange={setSelectedRows}
                    currentPage={currentPage}
                    total={meta?.total || 0}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    maxHeight="calc(100vh - 350px)"
                />
            </ComponentCard>

            <AdminDetailsModal
                visible={detailModalVisible}
                onClose={handleCloseModal}
                adminData={currentAdmin}
                loading={fetchingCurrent}
            />
        </div>
    );
};

export default AdminsList;

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import { fetchAdmins, setFilterStatus, setSearchQuery, setPagination } from "./services/adminSlice";
import AdvanceTable from "../../../components/Tables/AdvanceTable";
import ComponentCard from "../../../components/common/ComponentCard";
import { formatDateWithTiming } from "../../../components/common/dateFormat";
import PageMeta from "@/components/common/PageMeta";
import { encryptData } from "../../../utility/crypto";
import StatusToggle from "../../../components/form/input/StatusToggle";

const AdminsList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { admins, loading, error, meta, filterStatus, searchQuery, pagination } = useSelector((state: RootState) => state.admin);
    const [selectedRows, setSelectedRows] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        dispatch(fetchAdmins({
            page: pagination.currentPage,
            limit: pagination.pageSize,
            search: searchQuery,
            isActive: filterStatus === "all" ? undefined : filterStatus === "active"
        }));
    }, [dispatch, pagination.currentPage, pagination.pageSize, searchQuery, filterStatus]);

    const handleSearchChange = (query: string) => {
        dispatch(setSearchQuery(query));
    };

    const handleStatusChange = (status: string) => {
        dispatch(setFilterStatus(status));
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
        navigate(`/Admin/view/${encryptedId}`, { state: { from: 'AdminList' } });
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
        { label: "Client Name", key: "name", value: "checked" as const },
        { label: "Email", key: "email", value: "checked" as const },
        { label: "Phone", key: "phone", value: "checked" as const },
        { label: "Business Details", key: "businessInfo", value: "checked" as const },
        { label: "Current Plan", key: "planName", value: "checked" as const },
        { label: "Subscription", key: "subStatus", value: "checked" as const },
        { label: "Joining Date", key: "joinedDate", value: "checked" as const },
        { label: "Status", key: "statusIcon", value: "checked" as const },
    ];


    return (
        <div className="">
            <PageMeta title="Business Clients | VyaparSetu" description="Manage all business Clients on the platform" />
            <ComponentCard
                title="Client Lists"
                rightButtonNode={
                    <StatusToggle status={filterStatus} onStatusChange={handleStatusChange} />
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
                    addButtonText="Add Client"
                    addButtonPath="/Admin/add"
                    onView={handleView}
                    onEdit={handleEdit}
                    // onDelete={handleDelete}
                    checkboxHeading="Action"
                    // onCheckbox={true}
                    // onCheckboxToggle={handleToggleStatus}
                    selectedRows={selectedRows}
                    onSelectionChange={setSelectedRows}
                    currentPage={pagination.currentPage}
                    total={meta?.total || 0}
                    pageSize={pagination.pageSize}
                    onPageChange={handlePageChange}
                    maxHeight="calc(100vh - 350px)"
                />
            </ComponentCard>


        </div>
    );
};

export default AdminsList;

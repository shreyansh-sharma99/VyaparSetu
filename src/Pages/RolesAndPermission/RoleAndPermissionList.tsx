import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";
import { ShieldCheck, Trash2 } from "lucide-react";

import type { AppDispatch, RootState } from "../../store";
import { fetchRoles, deleteRole } from "./services/rolesSlice";
import AdvanceTable from "../../components/Tables/AdvanceTable";
import ComponentCard from "../../components/common/ComponentCard";
import { formatDateWithTiming } from "../../components/common/dateFormat";
import PageMeta from "@/components/common/PageMeta";

const RoleAndPermissionList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { roles, loading, error, meta } = useSelector(
    (state: RootState) => state.roles
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchRoles({ page: currentPage, limit: pageSize, search: searchQuery }));
  }, [dispatch, currentPage, pageSize, searchQuery]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleView = (role: any) => {
    navigate(`/roles/view/${role._id}`);
  };

  const handleEdit = (role: any) => {
    navigate(`/roles/edit/${role._id}`);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Delete Role",
      icon: (
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 mb-2">
          <Trash2 className="w-5 h-5 text-red-600" />
        </span>
      ),
      content: (
        <div className="py-2">
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            Are you sure you want to delete this role?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            This action cannot be undone. All permissions associated with this role will be permanently removed.
          </p>
        </div>
      ),
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      okButtonProps: {
        className: "!rounded-xl font-bold border-0 h-10 px-6 bg-red-600 hover:bg-red-700",
      },
      cancelButtonProps: { className: "!rounded-xl font-bold h-10 px-6" },
      onOk: () => {
        dispatch(deleteRole(id));
      },
    });
  };

  const tableRows = (roles || []).map((role) => ({
    ...role,
    id: role._id,
    permissionsCount: `${role.permissions?.length || 0} modules`,
    type: role.isSystemRole ? "System Role" : "Custom Role",
    createdDate: formatDateWithTiming(role.createdAt),
  }));

  const headers = [
    { label: "Role Name", key: "roleName", value: "checked" as const },
    { label: "Description", key: "description", value: "checked" as const },
    { label: "Type", key: "type", value: "checked" as const },
    { label: "Permissions", key: "permissionsCount", value: "checked" as const },
    { label: "Created At", key: "createdDate", value: "checked" as const },
  ];

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  };

  return (
    <div>
      <PageMeta
        title="Roles & Permissions | VyaparSetu"
        description="Manage roles and permissions"
      />
      <ComponentCard
        title="Roles & Permissions"
        rightButtonNode={
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary/80 bg-primary/10 px-3 py-1.5 rounded-lg">
              <ShieldCheck size={13} />
              Access Control
            </span>
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
          addButtonText="Create Role"
          addButtonPath="/roles/create"
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          checkboxHeading="Actions"
          currentPage={currentPage}
          total={meta?.total || 0}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          maxHeight="calc(100vh - 350px)"
          disableEditCondition={(row) => row.isSystemRole}
          disableDeleteCondition={(row) => row.isSystemRole}
        />
      </ComponentCard>
    </div>
  );
};

export default RoleAndPermissionList;

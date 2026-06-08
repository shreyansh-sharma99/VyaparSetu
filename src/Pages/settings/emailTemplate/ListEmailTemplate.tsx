import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";
import { Mail, Trash2 } from "lucide-react";

import type { AppDispatch, RootState } from "../../../store";
import { fetchEmailTemplates, deleteEmailTemplateAction } from "./services/emailTemplateSlice";
import AdvanceTable from "../../../components/Tables/AdvanceTable";
import ComponentCard from "../../../components/common/ComponentCard";
import { formatDateWithTiming } from "../../../components/common/dateFormat";
import PageMeta from "@/components/common/PageMeta";
import { usePermission } from "@/utility/permission";
import { encryptData } from "../../../utility/crypto";

const ListEmailTemplate: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { pagePermissions } = usePermission();
  const { templates, loading, error, meta } = useSelector(
    (state: RootState) => state.emailTemplate
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchEmailTemplates({ page: currentPage, limit: pageSize, search: searchQuery }));
  }, [dispatch, currentPage, pageSize, searchQuery]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleView = (template: any) => {
    const encryptedId = encodeURIComponent(encryptData(template._id));
    navigate(`/settings/email-templates/view/${encryptedId}`);
  };

  const handleEdit = (template: any) => {
    const encryptedId = encodeURIComponent(encryptData(template._id));
    navigate(`/settings/email-templates/edit/${encryptedId}`);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: <span className="dark:text-red-600">Delete Email Template</span>,
      icon: (
        <span className="flex items-center justify-center mr-2 rounded-full bg-red-100 dark:bg-red-200 mb-2">
          <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
        </span>
      ),
      content: (
        <div className="py-2">
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            Are you sure you want to delete this template?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            This action cannot be undone.
          </p>
        </div>
      ),
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      okButtonProps: {
        className: "!rounded-xl font-bold border-0 h-10 px-6 bg-red-600 hover:bg-red-700 !text-white",
      },
      cancelButtonProps: {
        className: "!rounded-xl font-bold h-10 px-6 dark:bg-red-800 dark:text-red-200 dark:border-red-700 dark:hover:bg-red-700 dark:hover:text-white"
      },
      onOk: () => {
        dispatch(deleteEmailTemplateAction(id));
      },
    });
  };

  const tableRows = (templates || []).map((template) => ({
    ...template,
    id: template._id,
    status: template.isActive ? "Active" : "Inactive",
    createdDate: formatDateWithTiming(template.createdAt),
  }));

  const headers = [
    { label: "Name", key: "name", value: "checked" as const },
    { label: "Subject", key: "subject", value: "checked" as const },
    { label: "Status", key: "status", value: "checked" as const },
    { label: "Created At", key: "createdDate", value: "checked" as const },
  ];

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  };

  return (
    <div>
      <PageMeta
        title="Email Templates | VyaparSetu"
        description="Manage email templates"
      />
      <ComponentCard
        title="Email Templates"
        rightButtonNode={
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary/80 bg-primary/10 px-3 py-1.5 rounded-lg">
              <Mail size={13} />
              Templates
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
          showAddButton={pagePermissions.canWrite}
          addButtonText="Create Template"
          addButtonPath="/settings/email-templates/create"
          onView={pagePermissions.canRead ? handleView : undefined}
          onEdit={pagePermissions.canUpdate ? handleEdit : undefined}
          onDelete={pagePermissions.canDelete ? handleDelete : undefined}
          checkboxHeading="Actions"
          currentPage={currentPage}
          total={meta?.total || 0}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          maxHeight="calc(100vh - 350px)"
        />
      </ComponentCard>
    </div>
  );
};

export default ListEmailTemplate;

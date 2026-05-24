import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../store";
import {
  fetchDesignations,
  deleteDesignation,
} from "./services/designationSlice";
import AdvanceTable from "../../../components/Tables/AdvanceTable";
import ComponentCard from "../../../components/common/ComponentCard";
import { formatDateWithTiming } from "../../../components/common/dateFormat";
import PageMeta from "@/components/common/PageMeta";
import { Modal } from "antd";

const DesignationList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { designations, loading, error, meta } = useSelector((state: RootState) => state.designation);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        dispatch(fetchDesignations({
            page: currentPage,
            limit: pageSize,
            search: searchQuery,
        }));
    }, [dispatch, currentPage, pageSize, searchQuery]);

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number, size?: number) => {
        setCurrentPage(page);
        if (size) setPageSize(size);
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this designation?',
            content: 'This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            centered: true,
            onOk: () => {
                dispatch(deleteDesignation(id));
            },
        });
    };

    const handleEdit = (designation: any) => {
        navigate(`/designations/edit/${designation._id}`);
    };

    const tableRows = (designations || []).map((designation) => ({
        ...designation,
        id: designation._id,
        createdDate: formatDateWithTiming(designation.createdAt),
        status: designation.isActive ? "Active" : "Inactive",
    }));

    const headers = [
        { label: "Name", key: "name", value: "checked" as const },
        { label: "Description", key: "description", value: "checked" as const },
        { label: "Created Date", key: "createdDate", value: "checked" as const },
        { label: "Status", key: "status", value: "checked" as const },
    ];

    return (
        <div className="">
            <PageMeta title="Designations | VyaparSetu" description="Manage your team designations" />
            <ComponentCard title="Designations">
                <AdvanceTable
                    headers={headers as any}
                    rows={tableRows}
                    loading={loading}
                    error={error}
                    searchQuery={searchQuery}
                    setSearchQuery={handleSearchChange}
                    showAddButton={true}
                    addButtonText="Add Designation"
                    addButtonPath="/designations/add"
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    checkboxHeading="Action"
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

export default DesignationList;

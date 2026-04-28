import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import { fetchTeamMembers, deleteTeamMember } from "./services/teamMemberSlice";
import AdvanceTable from "../../components/Tables/AdvanceTable";
import ComponentCard from "../../components/common/ComponentCard";
import { formatDateWithTiming } from "../../components/common/dateFormat";
import PageMeta from "@/components/common/PageMeta";
import { encryptData } from "../../utility/crypto";
import { Modal } from "antd";

const TeamMemberList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { teamMembers, loading, error, meta } = useSelector((state: RootState) => state.teamMember);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        dispatch(fetchTeamMembers({
            page: currentPage,
            limit: pageSize,
            search: searchQuery,
        }));
    }, [dispatch, currentPage, pageSize, searchQuery]);

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const handleEdit = (member: any) => {
        const encryptedId = encodeURIComponent(encryptData(member._id));
        navigate(`/TeamMembers/edit/${encryptedId}`);
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this team member?',
            content: 'This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            centered: true,
            onOk: () => {
                dispatch(deleteTeamMember(id));
            },
        });
    };

    const tableRows = (teamMembers || []).map((member) => ({
        ...member,
        id: member._id,
        joinedDate: formatDateWithTiming(member.createdAt),
        status: member.isActive ? "Active" : "Inactive",
    }));

    const headers = [
        { label: "Name", key: "name", value: "checked" as const },
        { label: "Email", key: "email", value: "checked" as const },
        { label: "Phone", key: "phone", value: "checked" as const },
        { label: "Designation", key: "designation", value: "checked" as const },
        { label: "User Type", key: "userType", value: "checked" as const },
        { label: "Joined Date", key: "joinedDate", value: "checked" as const },
        { label: "Status", key: "status", value: "checked" as const },
    ];

    const handlePageChange = (page: number, size?: number) => {
        setCurrentPage(page);
        if (size) setPageSize(size);
    };

    return (
        <div className="">
            <PageMeta title="Team Members | VyaparSetu" description="Manage your team members" />
            <ComponentCard title="Team Members">
                <AdvanceTable
                    headers={headers as any}
                    rows={tableRows}
                    loading={loading}
                    error={error}
                    searchQuery={searchQuery}
                    setSearchQuery={handleSearchChange}
                    showAddButton={true}
                    addButtonText="Add Team Member"
                    addButtonPath="/TeamMembers/add"
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

export default TeamMemberList;

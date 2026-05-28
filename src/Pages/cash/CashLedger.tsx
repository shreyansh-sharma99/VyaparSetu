import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import { fetchCashLedger } from "./services/cashSlice";
import AdvanceTable from "../../components/Tables/AdvanceTable";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "@/components/common/PageMeta";
import { encryptData } from "../../utility/crypto";

const CashLedger: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { ledger, ledgerLoading, error } = useSelector((state: RootState) => state.cash);

    useEffect(() => {
        dispatch(fetchCashLedger());
    }, [dispatch]);

    const handleView = (item: any) => {
        const encryptedId = encodeURIComponent(encryptData(item._id));
        navigate(`/Cash/report/${encryptedId}`);
    };

    const tableRows = ledger.map((item) => ({
        ...item,
        id: item._id,
        userRole: item.userType ? item.userType.replace('_', ' ').toUpperCase() : 'N/A',
        totalAmount: `₹${(item.total / 100 || 0).toLocaleString('en-IN')}`,
    }));

    const headers = [
        { label: "Name", key: "name", value: "checked" as const },
        { label: "Email", key: "email", value: "checked" as const },
        { label: "User Type", key: "userRole", value: "checked" as const },
        { label: "Total Cash", key: "totalAmount", value: "checked" as const },
    ];

    return (
        <div className="">
            <PageMeta title="Cash Ledger | VyaparSetu" description="Manage team cash ledger" />
            <ComponentCard title="Cash Ledger">
                <AdvanceTable
                    headers={headers as any}
                    rows={tableRows}
                    loading={ledgerLoading}
                    error={error}
                    showAddButton={false}
                    onView={handleView}
                    maxHeight="calc(100vh - 250px)"
                />
            </ComponentCard>
        </div>
    );
};

export default CashLedger;

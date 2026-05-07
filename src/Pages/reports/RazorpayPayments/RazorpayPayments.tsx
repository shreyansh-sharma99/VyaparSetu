import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ComponentCard from "@/components/common/ComponentCard";
import PageMeta from "@/components/common/PageMeta";
import type { AppDispatch, RootState } from "@/store";
import { fetchRazorpayPayments, downloadRazorpayPaymentsReport } from "./services/razorpayPaymentsSlice";
import AdvanceTable from "@/components/Tables/AdvanceTable";

export default function RazorpayPayments() {
    const dispatch = useDispatch<AppDispatch>();
    const { data, loading, downloadingFormat, error } = useSelector((state: RootState) => state.razorpayPayments);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        dispatch(fetchRazorpayPayments());
    }, [dispatch]);

    const handleDownload = (format: 'excel' | 'csv' | 'pdf') => {
        dispatch(downloadRazorpayPaymentsReport(format));
    };

    const tableHeaders = [
        { label: "Payment ID", key: "id" as const },
        { label: "Amount", key: "amount" as const },
        { label: "Currency", key: "currency" as const },
        { label: "Status", key: "status" as const },
        { label: "Method", key: "method" as const },
        { label: "Email", key: "email" as const },
        { label: "Contact", key: "contact" as const },
        { label: "Created At", key: "createdAt" as const },
    ];

    const tableRows = data.map((item) => ({
        ...item,
        amount: `${item.currency} ${item.amount}`,
    }));

    const filteredRows = tableRows.filter((row) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            row.id?.toLowerCase().includes(query) ||
            row.amount?.toLowerCase().includes(query) ||
            row.status?.toLowerCase().includes(query) ||
            row.method?.toLowerCase().includes(query) ||
            row.email?.toLowerCase().includes(query) ||
            row.contact?.toLowerCase().includes(query)
        );
    });

    return (
        <>
            <PageMeta
                title="Razorpay Payments Report | VyaparSetu"
                description="View and download Razorpay payment reports."
            />

            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <ComponentCard
                    title="Razorpay Payments"
                // desc="List of all payments processed through Razorpay"

                >
                    <div className="mt-4">
                        <AdvanceTable
                            headers={tableHeaders}
                            rows={filteredRows}
                            loading={loading}
                            error={error}
                            maxHeight="calc(100vh - 300px)"
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            onDownloadExcel={() => handleDownload('excel')}
                            onDownloadCSV={() => handleDownload('csv')}
                            onDownloadPDF={() => handleDownload('pdf')}
                            isDownloadingExcel={downloadingFormat === 'excel'}
                            isDownloadingCSV={downloadingFormat === 'csv'}
                            isDownloadingPDF={downloadingFormat === 'pdf'}
                        />
                    </div>
                </ComponentCard>
            </div>
        </>
    );
}

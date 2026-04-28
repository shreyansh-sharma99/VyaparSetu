import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCcw } from "lucide-react";
import ComponentCard from "@/components/common/ComponentCard";
import PageMeta from "@/components/common/PageMeta";
import type { AppDispatch, RootState } from "@/store";
import { fetchRazorpaySettlements, downloadRazorpaySettlementsReport } from "./services/razorpaySettlementsSlice";
import AdvanceTable from "@/components/Tables/AdvanceTable";

export default function RazorpaySettlements() {
    const dispatch = useDispatch<AppDispatch>();
    const { data, loading, downloadingFormat, error } = useSelector((state: RootState) => state.razorpaySettlements);

    useEffect(() => {
        dispatch(fetchRazorpaySettlements());
    }, [dispatch]);

    const handleDownload = (format: 'excel' | 'csv' | 'pdf') => {
        dispatch(downloadRazorpaySettlementsReport(format));
    };

    const tableHeaders = [
        { label: "Settlement ID", key: "id" as const },
        { label: "Amount", key: "amount" as const },
        // { label: "Currency", key: "currency" as const },
        { label: "Status", key: "status" as const },
        { label: "Fees", key: "fees" as const },
        { label: "Tax", key: "tax" as const },
        { label: "UTR", key: "utr" as const },
        { label: "Created At", key: "createdAt" as const },
    ];

    const tableRows = (data || []).map((item) => ({
        ...item,
        amount: ` ${item.amount}`,
    }));

    return (
        <>
            <PageMeta
                title="Razorpay Settlements Report | VyaparSetu"
                description="View and download Razorpay settlement reports."
            />

            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <ComponentCard
                    title="Razorpay Settlements"
                // desc="List of all settlements processed through Razorpay"

                >
                    <div className="mt-4">
                        <AdvanceTable
                            headers={tableHeaders}
                            rows={tableRows}
                            loading={loading}
                            error={error}
                            maxHeight="calc(100vh - 300px)"
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

import Http from "@/utility/Http";

export const getInvoiceReportService = async () => {
    return await Http.get(`/owner/reports/invoices`);
};

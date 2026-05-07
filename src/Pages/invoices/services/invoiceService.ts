import Http from "@/utility/Http";

export const getInvoicesService = async (page: number = 1, limit: number = 10, status?: string) => {
    let url = `/owner/invoices?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return await Http.get(url);
};

export const getInvoiceByIdService = async (id: string) => {
    return await Http.get(`/owner/invoices/${id}`);
};

export const sendInvoicePaymentLinkService = async (invoiceId: string) => {
    return await Http.post(`/owner/invoices/${invoiceId}/send-link`, {});
};

export const markInvoicePaidService = async (invoiceId: string) => {
    return await Http.post(`/owner/invoices/${invoiceId}/mark-paid`, {});
};

export const waiveInvoiceService = async (invoiceId: string) => {
    return await Http.post(`/owner/invoices/${invoiceId}/waive`, {});
};

export const sendInvoiceReminderService = async (invoiceId: string) => {
    return await Http.post(`/owner/invoices/${invoiceId}/send-reminder`, {});
};

export const downloadInvoicePdfService = async (invoiceId: string) => {
    return await Http.get(`/owner/invoices/${invoiceId}/download`, { responseType: "blob" });
};

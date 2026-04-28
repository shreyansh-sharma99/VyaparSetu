import Http from "@/utility/Http";

export const getInvoicesService = async (page: number = 1, limit: number = 10, status?: string) => {
    let url = `/owner/invoices?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return await Http.get(url);
};

export const getInvoiceByIdService = async (id: string) => {
    return await Http.get(`/owner/invoices/${id}`);
};

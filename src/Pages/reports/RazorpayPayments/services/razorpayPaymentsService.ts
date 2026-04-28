import Http from "@/utility/Http";

export const getRazorpayPaymentsService = async () => {
    return await Http.get(`/owner/reports/razorpay/payments`);
};

export const getRazorpayPaymentsReportService = async (format: string) => {
    return await Http.get(`/owner/reports/razorpay/payments?format=${format}`, {
        responseType: 'blob'
    });
};

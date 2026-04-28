import Http from "@/utility/Http";

export const getRazorpaySettlementsService = async () => {
    return await Http.get(`/owner/reports/razorpay/settlements`);
};

export const getRazorpaySettlementsReportService = async (format: string) => {
    return await Http.get(`/owner/reports/razorpay/settlements?format=${format}`, {
        responseType: 'blob'
    });
};

import Http from "@/utility/Http";

export const getSubscriptionReportService = async () => {
    return await Http.get(`/owner/reports/subscriptions`);
};

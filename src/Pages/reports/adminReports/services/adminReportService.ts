import Http from "@/utility/Http";

export const getAdminReportService = async () => {
    return await Http.get(`/owner/reports/admins`);
};

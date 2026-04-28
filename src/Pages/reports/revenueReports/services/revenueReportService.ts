import Http from "@/utility/Http";

export const getRevenueReportService = async (from?: string, to?: string) => {
    let url = `/owner/reports/revenue`;
    if (from && to) {
        url += `?from=${from}&to=${to}`;
    }
    return await Http.get(url);
};

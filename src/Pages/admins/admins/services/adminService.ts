import Http from "@/utility/Http";

export const getAdminsService = async (params: any) => {
    let url = `/owner/admins?page=${params.page || 1}&limit=${params.limit || 10}`;
    if (params.search) url += `&search=${params.search}`;
    if (params.isActive !== undefined) url += `&isActive=${params.isActive}`;
    if (params.onboardingStatus) url += `&onboardingStatus=${params.onboardingStatus}`;
    if (params.status) url += `&status=${params.status}`;
    if (params.subscriptionStatus) url += `&subscriptionStatus=${params.subscriptionStatus}`;
    if (params.plan) url += `&plan=${params.plan}`;
    if (params.paymentMethod) url += `&paymentMethod=${params.paymentMethod}`;
    if (params.expiringSoon) url += `&expiringSoon=${params.expiringSoon}`;
    if (params.createdBy) url += `&createdBy=${params.createdBy}`;
    return await Http.get(url);
};

// export const getAdminsService = async (page: number = 1, limit: number = 10, search: string = "") => {
//     return await Http.get(`/owner/admins?page=${page}&limit=${limit}${search ? `&search=${search}` : ""}`);
// };

export const createAdminService = async (adminData: any) => {
    return await Http.post(`/owner/admins`, adminData);
};

export const getAdminByIdService = async (id: string) => {
    return await Http.get(`/owner/admins/${id}`);
};

export const updateAdminService = async (id: string, adminData: any) => {
    return await Http.patch(`/owner/admins/${id}`, adminData);
};

export const deleteAdminService = async (id: string) => {
    return await Http.delete(`/owner/admins/${id} `);
};

export const resendOnboardingService = async (id: string) => {
    return await Http.post(`/owner/admins/${id}/resend-onboarding`);
};

export const suspendAdminService = async (id: string) => {
    return await Http.post(`/owner/admins/${id}/suspend`);
};

export const activateAdminService = async (id: string) => {
    return await Http.post(`/owner/admins/${id}/activate`);
};

export const extendSubscriptionService = async (id: string, days: number) => {
    return await Http.post(`/owner/admins/${id}/extend`, { days });
};

export const getAdminRazorpayService = async (id: string) => {
    return await Http.get(`/owner/admins/${id}/razorpay`);
};

export const getAdminAuditLogsService = async (id: string, page: number = 1, limit: number = 20) => {
    return await Http.get(`/owner/admins/${id}/audit-logs?page=${page}&limit=${limit}`);
};

export const assignCashPlanService = async (id: string, planData: any) => {
    return await Http.post(`/owner/admins/${id}/assign-cash-plan`, planData);
};

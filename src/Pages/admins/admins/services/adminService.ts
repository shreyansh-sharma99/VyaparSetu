import Http from "@/utility/Http";

export const getAdminsService = async (page: number = 1, limit: number = 10, search: string = "", isActive?: boolean, onboardingStatus?: string, status?: string, subscriptionStatus?: string) => {
    let url = `/owner/admins?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    if (isActive !== undefined) url += `&isActive=${isActive}`;
    if (onboardingStatus) url += `&onboardingStatus=${onboardingStatus}`;
    if (status) url += `&status=${status}`;
    if (subscriptionStatus) url += `&subscriptionStatus=${subscriptionStatus}`;
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

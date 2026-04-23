import apiClient from '../../../utility/Http';

export const getPlans = async () => {
    const response = await apiClient.get('/owner/plans');
    return response.data;
};

export const createPlan = async (planData: any) => {
    const response = await apiClient.post('/owner/plans', planData);
    return response.data;
};
export const togglePlan = async (planId: string) => {
    const response = await apiClient.post(`/owner/plans/${planId}/toggle`);
    return response.data;
};

export const getPlanById = async (planId: string) => {
    const response = await apiClient.get(`/owner/plans/${planId}`);
    return response.data;
};

export const updatePlan = async (planId: string, planData: any) => {
    const response = await apiClient.patch(`/owner/plans/${planId}`, planData);
    return response.data;
};

export const deletePlan = async (planId: string) => {
    const response = await apiClient.delete(`/owner/plans/${planId}`);
    return response.data;
};

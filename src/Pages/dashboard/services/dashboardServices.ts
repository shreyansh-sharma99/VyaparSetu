import apiClient from '../../../utility/Http';

export const getDashboardData = async () => {
    const response = await apiClient.get('/owner/dashboard');
    return response.data;
};

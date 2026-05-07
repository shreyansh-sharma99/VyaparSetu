import apiClient from '@/utility/Http';

export const loginApi = async (credentials: any) => {
  const response = await apiClient.post('owner/auth/login', credentials);
  return response.data;
};

export const logoutApi = async () => {
  const response = await apiClient.post('owner/auth/logout');
  return response.data;
};

export const changePasswordApi = async (data: any) => {
  const response = await apiClient.post('owner/auth/change-password', data);
  return response.data;
};

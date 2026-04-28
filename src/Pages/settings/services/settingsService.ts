import apiClient from '@/utility/Http';

export const getSettings = async () => {
  const response = await apiClient.get('/owner/settings');
  return response.data;
};

export const updateSettings = async (data: any) => {
  const response = await apiClient.put('/owner/settings', data);
  return response.data;
};

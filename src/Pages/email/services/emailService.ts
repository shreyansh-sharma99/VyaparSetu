import apiClient from '@/utility/Http';

export const sendEmail = async (payload: any) => {
  const response = await apiClient.post('/owner/emails/send', payload);
  return response.data;
};

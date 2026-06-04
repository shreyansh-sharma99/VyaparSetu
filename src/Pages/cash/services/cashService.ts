import apiClient from '@/utility/Http';

export const getCashLedger = async () => {
  const response = await apiClient.get('/owner/cash/ledger');
  return response.data;
};

export const getCashReport = async (userId: string) => {
  const response = await apiClient.get(`/owner/cash/report/${userId}`);
  return response.data;
};

export const approveHandover = async (handoverId: string) => {
  const response = await apiClient.post(`/owner/cash/handover/${handoverId}/approve`);
  return response.data;
};

export const rejectHandover = async (handoverId: string) => {
  const response = await apiClient.post(`/owner/cash/handover/${handoverId}/reject`);
  return response.data;
};

export const getCashWallet = async () => {
  const response = await apiClient.get('/owner/cash/wallet');
  return response.data;
};

export const initiateHandover = async (data: { amount: number; toUserId?: string; notes?: string }) => {
  const response = await apiClient.post('/owner/cash/handover', data);
  return response.data;
};

import apiClient from '@/utility/Http';

export const getEmailTemplates = async (page = 1, limit = 10, search = "") => {
  const url = search 
    ? `/owner/emails/templates?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
    : `/owner/emails/templates?page=${page}&limit=${limit}`;
  const response = await apiClient.get(url);
  return response.data;
};

export const getEmailTemplateById = async (id: string) => {
  const response = await apiClient.get(`/owner/emails/templates/${id}`);
  return response.data;
};

export const createEmailTemplate = async (data: any) => {
  const response = await apiClient.post('/owner/emails/templates', data);
  return response.data;
};

export const updateEmailTemplate = async (id: string, data: any) => {
  const response = await apiClient.put(`/owner/emails/templates/${id}`, data);
  return response.data;
};

export const deleteEmailTemplate = async (id: string) => {
  const response = await apiClient.delete(`/owner/emails/templates/${id}`);
  return response.data;
};

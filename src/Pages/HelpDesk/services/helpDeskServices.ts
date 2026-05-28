import apiClient from '../../../utility/Http';

export const getTickets = async (params: any) => {
    const response = await apiClient.get('/owner/tickets', { params });
    return response.data;
};

export const getTicketStats = async () => {
    const response = await apiClient.get('/owner/tickets/stats');
    return response.data;
};

export const getTicketById = async (ticketId: string) => {
    const response = await apiClient.get(`/owner/tickets/${ticketId}`);
    return response.data;
};

export const replyToTicket = async (ticketId: string, payload: { messageText: string }) => {
    const response = await apiClient.post(`/owner/tickets/${ticketId}/reply`, payload);
    return response.data;
};

export const assignTicket = async (ticketId: string, payload: { staffId?: string }) => {
    const response = await apiClient.post(`/owner/tickets/${ticketId}/assign`, payload);
    return response.data;
};

export const transferTicket = async (ticketId: string, payload: { assignedStaffId: string, transferNote: string }) => {
    const response = await apiClient.post(`/owner/tickets/${ticketId}/transfer`, payload);
    return response.data;
};

export const updateTicketStatus = async (ticketId: string, payload: { status: string, note?: string }) => {
    const response = await apiClient.put(`/owner/tickets/${ticketId}/status`, payload);
    return response.data;
};

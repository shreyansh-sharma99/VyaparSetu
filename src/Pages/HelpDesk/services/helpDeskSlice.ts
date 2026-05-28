import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getTickets,
    getTicketStats,
    getTicketById,
    replyToTicket,
    assignTicket,
    transferTicket,
    updateTicketStatus
} from './helpDeskServices';

export interface Ticket {
    _id: string;
    ticketId: string;
    merchantId: string | null;
    subject: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    assignedStaffId: string | null;
    messages: any[];
    auditLogs: any[];
    resolvedAt: string | null;
    closedAt: string | null;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface HelpDeskState {
    tickets: Ticket[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    } | null;
    stats: any | null;
    currentTicket: Ticket | null;
    loading: boolean;
    statsLoading: boolean;
    ticketLoading: boolean;
    actionLoading: boolean;
    error: string | null;
}

const initialState: HelpDeskState = {
    tickets: [],
    pagination: null,
    stats: null,
    currentTicket: null,
    loading: false,
    statsLoading: false,
    ticketLoading: false,
    actionLoading: false,
    error: null,
};

export const fetchTickets = createAsyncThunk(
    'helpDesk/fetchTickets',
    async (params: any, { rejectWithValue }) => {
        try {
            const response = await getTickets(params);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch tickets');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch tickets');
        }
    }
);

export const fetchTicketStats = createAsyncThunk(
    'helpDesk/fetchTicketStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getTicketStats();
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch ticket stats');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch ticket stats');
        }
    }
);

export const fetchTicketById = createAsyncThunk(
    'helpDesk/fetchTicketById',
    async (ticketId: string, { rejectWithValue }) => {
        try {
            const response = await getTicketById(ticketId);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to fetch ticket details');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch ticket details');
        }
    }
);

export const sendReplyToTicket = createAsyncThunk(
    'helpDesk/replyToTicket',
    async ({ ticketId, payload }: { ticketId: string, payload: { messageText: string } }, { rejectWithValue }) => {
        try {
            const response = await replyToTicket(ticketId, payload);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message || 'Failed to send reply');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send reply');
        }
    }
);

export const assignTicketThunk = createAsyncThunk(
    'helpDesk/assignTicket',
    async ({ ticketId, payload }: { ticketId: string, payload: { staffId?: string } }, { rejectWithValue }) => {
        try {
            const response = await assignTicket(ticketId, payload);
            if (response.success) {
                return response.data; // Expected to return updated ticket
            }
            return rejectWithValue(response.message || 'Failed to assign ticket');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to assign ticket');
        }
    }
);

export const transferTicketThunk = createAsyncThunk(
    'helpDesk/transferTicket',
    async ({ ticketId, payload }: { ticketId: string, payload: { assignedStaffId: string, transferNote: string } }, { rejectWithValue }) => {
        try {
            const response = await transferTicket(ticketId, payload);
            if (response.success) {
                return response.data; // Expected to return updated ticket
            }
            return rejectWithValue(response.message || 'Failed to transfer ticket');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to transfer ticket');
        }
    }
);

export const updateTicketStatusThunk = createAsyncThunk(
    'helpDesk/updateTicketStatus',
    async ({ ticketId, payload }: { ticketId: string, payload: { status: string, note?: string } }, { rejectWithValue }) => {
        try {
            const response = await updateTicketStatus(ticketId, payload);
            if (response.success) {
                return response.data; // Expected to return updated ticket
            }
            return rejectWithValue(response.message || 'Failed to update ticket status');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update ticket status');
        }
    }
);

const helpDeskSlice = createSlice({
    name: 'helpDesk',
    initialState,
    reducers: {
        clearHelpDeskError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchTickets
            .addCase(fetchTickets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTickets.fulfilled, (state, action) => {
                state.loading = false;
                state.tickets = action.payload.tickets;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchTickets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // fetchTicketStats
            .addCase(fetchTicketStats.pending, (state) => {
                state.statsLoading = true;
                state.error = null;
            })
            .addCase(fetchTicketStats.fulfilled, (state, action) => {
                state.statsLoading = false;
                state.stats = action.payload;
            })
            .addCase(fetchTicketStats.rejected, (state, action) => {
                state.statsLoading = false;
                state.error = action.payload as string;
            })

            // fetchTicketById
            .addCase(fetchTicketById.pending, (state) => {
                state.ticketLoading = true;
                state.error = null;
            })
            .addCase(fetchTicketById.fulfilled, (state, action) => {
                state.ticketLoading = false;
                state.currentTicket = action.payload;
            })
            .addCase(fetchTicketById.rejected, (state, action) => {
                state.ticketLoading = false;
                state.error = action.payload as string;
            })

            // Actions (reply, assign, transfer, status)
            .addMatcher(
                (action) => action.type.endsWith('/pending') && ['replyToTicket', 'assignTicket', 'transferTicket', 'updateTicketStatus'].some(str => action.type.includes(str)),
                (state) => {
                    state.actionLoading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/fulfilled') && ['replyToTicket', 'assignTicket', 'transferTicket', 'updateTicketStatus'].some(str => action.type.includes(str)),
                (state, action: any) => {
                    state.actionLoading = false;
                    if (state.currentTicket && state.currentTicket._id === action.payload?._id) {
                        state.currentTicket = action.payload;
                    }
                    const index = state.tickets.findIndex(t => t._id === action.payload?._id);
                    if (index !== -1) {
                        state.tickets[index] = action.payload;
                    }
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/rejected') && ['replyToTicket', 'assignTicket', 'transferTicket', 'updateTicketStatus'].some(str => action.type.includes(str)),
                (state, action: any) => {
                    state.actionLoading = false;
                    state.error = action.payload as string;
                }
            );
    }
});

export const { clearHelpDeskError } = helpDeskSlice.actions;
export default helpDeskSlice.reducer;

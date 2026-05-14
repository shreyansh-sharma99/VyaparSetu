import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    getInvoicesService,
    getInvoiceByIdService,
    sendInvoicePaymentLinkService,
    markInvoicePaidService,
    waiveInvoiceService,
    sendInvoiceReminderService,
    downloadInvoicePdfService,
} from "./invoiceService";
import { toast } from "react-toastify";

export interface InvoiceAdminId {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    businessName?: string;
    businessType?: string;
    subscriptionStatus?: string;
    isActive?: boolean;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        pincode?: string;
        country?: string;
    };
    planLimits?: {
        maxProducts?: number;
        storageGB?: number;
    };
    subscription?: {
        status?: string;
        razorpayCustomerId?: string;
        razorpaySubscriptionId?: string;
        currentPeriodEnd?: string;
        lastChargedAt?: string;
        currentPeriodStart?: string;
    };
    canExtend?: boolean;
    id?: string;
}

export interface InvoicePlanId {
    _id: string;
    name: string;
    description?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    basePrice?: number;
    currency?: string;
    billingCycles?: Array<{
        tenure: string;
        label: string;
        durationMonths: number;
        discountPercent?: number | null;
        isEnabled: boolean;
        razorpayPlanId?: string | null;
    }>;
    computedPricing?: Array<{
        tenure: string;
        label: string;
        durationMonths: number;
        discountPercent?: number | null;
        totalPrice: number;
        perMonthEquivalent: number;
        savedAmount: number;
        razorpayPlanId?: string;
        isEnabled: boolean;
    }>;
    limits?: {
        maxProducts?: number | null;
        maxOrders?: number | null;
        maxCustomers?: number | null;
        maxStaff?: number | null;
        maxStores?: number | null;
        storageGB?: number | null;
    };
    features?: {
        analyticsEnabled?: boolean | null;
        customDomain?: boolean | null;
        apiAccess?: boolean | null;
        prioritySupport?: boolean | null;
        exportData?: boolean | null;
        whitelabel?: boolean | null;
        customThemes?: boolean | null;
        smsNotifications?: boolean | null;
    };
    trial?: {
        durationDays?: number;
        enabled?: boolean;
    };
    createdAt?: string;
    updatedAt?: string;
    id?: string;
}

export interface Invoice {
    _id: string;
    invoiceNumber: string;
    adminId: InvoiceAdminId;
    planId: InvoicePlanId;
    tenure: string;
    lineItems: Array<{
        description: string;
        amount: number;
    }>;
    subtotal: number;
    discountAmount: number;
    discountPercent: number;
    taxPercent: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
    status: string;
    dueDate: string;
    paidAt?: string;
    razorpayPaymentId?: string;
    dunningCount: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface InvoiceState {
    invoices: Invoice[];
    currentInvoice: Invoice | null;
    meta: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    } | null;
    loading: boolean;
    fetchingCurrent: boolean;
    submitting: boolean;
    error: string | null;
    searchQuery: string;
    statusFilter: string;
    pagination: {
        currentPage: number;
        pageSize: number;
    };
}

const initialState: InvoiceState = {
    invoices: [],
    currentInvoice: null,
    meta: null,
    loading: false,
    fetchingCurrent: false,
    submitting: false,
    error: null,
    searchQuery: "",
    statusFilter: "all",
    pagination: {
        currentPage: 1,
        pageSize: 10,
    },
};

export const fetchInvoices = createAsyncThunk(
    "invoice/fetchInvoices",
    async ({ page, limit, status }: { page: number; limit: number; status?: string }, { rejectWithValue }) => {
        try {
            const response = await getInvoicesService(page, limit, status);
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to fetch invoices";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const fetchInvoiceById = createAsyncThunk(
    "invoice/fetchInvoiceById",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await getInvoiceByIdService(id);
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to fetch invoice details";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const sendPaymentLink = createAsyncThunk(
    "invoice/sendPaymentLink",
    async (invoiceId: string, { rejectWithValue }) => {
        try {
            const response = await sendInvoicePaymentLinkService(invoiceId);
            toast.success("Payment link sent successfully!");
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to send payment link";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const markInvoicePaid = createAsyncThunk(
    "invoice/markInvoicePaid",
    async (invoiceId: string, { rejectWithValue }) => {
        try {
            const response = await markInvoicePaidService(invoiceId);
            toast.success("Invoice marked as paid!");
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to mark invoice as paid";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const waiveInvoice = createAsyncThunk(
    "invoice/waiveInvoice",
    async (invoiceId: string, { rejectWithValue }) => {
        try {
            const response = await waiveInvoiceService(invoiceId);
            toast.success("Invoice waived successfully!");
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to waive invoice";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const sendInvoiceReminder = createAsyncThunk(
    "invoice/sendInvoiceReminder",
    async (invoiceId: string, { rejectWithValue }) => {
        try {
            const response = await sendInvoiceReminderService(invoiceId);
            toast.success("Reminder sent successfully!");
            return response.data;
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to send reminder";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const downloadInvoicePdf = createAsyncThunk(
    "invoice/downloadInvoicePdf",
    async ({ invoiceId, invoiceNumber }: { invoiceId: string; invoiceNumber: string }, { rejectWithValue }) => {
        try {
            const response = await downloadInvoicePdfService(invoiceId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Invoice downloaded!");
            return null;
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to download invoice";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

const invoiceSlice = createSlice({
    name: "invoice",
    initialState,
    reducers: {
        clearCurrentInvoice(state) {
            state.currentInvoice = null;
            state.error = null;
        },
        setSearchQuery(state, action) {
            state.searchQuery = action.payload;
            state.pagination.currentPage = 1;
        },
        setStatusFilter(state, action) {
            state.statusFilter = action.payload;
            state.pagination.currentPage = 1;
        },
        setPagination(state, action) {
            state.pagination = { ...state.pagination, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchInvoices
            .addCase(fetchInvoices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInvoices.fulfilled, (state, action) => {
                state.loading = false;
                state.invoices = action.payload.data;
                state.meta = action.payload.meta.pagination;
            })
            .addCase(fetchInvoices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // fetchInvoiceById
            .addCase(fetchInvoiceById.pending, (state) => {
                state.fetchingCurrent = true;
                state.error = null;
            })
            .addCase(fetchInvoiceById.fulfilled, (state, action) => {
                state.fetchingCurrent = false;
                state.currentInvoice = action.payload.data;
            })
            .addCase(fetchInvoiceById.rejected, (state, action) => {
                state.fetchingCurrent = false;
                state.error = action.payload as string;
            })

            // sendPaymentLink
            .addCase(sendPaymentLink.pending, (state) => { state.submitting = true; })
            .addCase(sendPaymentLink.fulfilled, (state) => { state.submitting = false; })
            .addCase(sendPaymentLink.rejected, (state) => { state.submitting = false; })

            // markInvoicePaid
            .addCase(markInvoicePaid.pending, (state) => { state.submitting = true; })
            .addCase(markInvoicePaid.fulfilled, (state) => {
                state.submitting = false;
                if (state.currentInvoice) state.currentInvoice.status = "paid";
            })
            .addCase(markInvoicePaid.rejected, (state) => { state.submitting = false; })

            // waiveInvoice
            .addCase(waiveInvoice.pending, (state) => { state.submitting = true; })
            .addCase(waiveInvoice.fulfilled, (state) => {
                state.submitting = false;
                if (state.currentInvoice) state.currentInvoice.status = "waived";
            })
            .addCase(waiveInvoice.rejected, (state) => { state.submitting = false; })

            // sendInvoiceReminder
            .addCase(sendInvoiceReminder.pending, (state) => { state.submitting = true; })
            .addCase(sendInvoiceReminder.fulfilled, (state) => { state.submitting = false; })
            .addCase(sendInvoiceReminder.rejected, (state) => { state.submitting = false; })

            // downloadInvoicePdf
            .addCase(downloadInvoicePdf.pending, (state) => { state.submitting = true; })
            .addCase(downloadInvoicePdf.fulfilled, (state) => { state.submitting = false; })
            .addCase(downloadInvoicePdf.rejected, (state) => { state.submitting = false; });
    },
});

export const { clearCurrentInvoice, setSearchQuery, setStatusFilter, setPagination } = invoiceSlice.actions;
export default invoiceSlice.reducer;

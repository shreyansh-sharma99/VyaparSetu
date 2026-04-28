import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getInvoicesService } from "./invoiceService";
import { toast } from "react-toastify";

interface Invoice {
    _id: string;
    invoiceNumber: string;
    adminId: {
        _id: string;
        name: string;
        email: string;
        canExtend: boolean;
        id: string;
    };
    planId: {
        _id: string;
        name: string;
        computedPricing: any[];
        id: string;
    };
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
    meta: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    } | null;
    loading: boolean;
    error: string | null;
}

const initialState: InvoiceState = {
    invoices: [],
    meta: null,
    loading: false,
    error: null,
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

const invoiceSlice = createSlice({
    name: "invoice",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
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
            });
    },
});

export default invoiceSlice.reducer;

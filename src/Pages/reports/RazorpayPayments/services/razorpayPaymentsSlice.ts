import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRazorpayPaymentsService, getRazorpayPaymentsReportService } from "./razorpayPaymentsService";
import { toast } from "react-toastify";

interface RazorpayPayment {
    id: string;
    amount: string;
    currency: string;
    status: string;
    method: string;
    email: string;
    contact: string;
    createdAt: string;
}

interface RazorpayPaymentsState {
    data: RazorpayPayment[];
    loading: boolean;
    downloadingFormat: 'excel' | 'csv' | 'pdf' | null;
    error: string | null;
}

const initialState: RazorpayPaymentsState = {
    data: [],
    loading: false,
    downloadingFormat: null,
    error: null,
};

export const fetchRazorpayPayments = createAsyncThunk(
    "razorpayPayments/fetchRazorpayPayments",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getRazorpayPaymentsService();
            return response.data.data;
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to fetch Razorpay payments";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const downloadRazorpayPaymentsReport = createAsyncThunk(
    "razorpayPayments/downloadReport",
    async (format: 'excel' | 'csv' | 'pdf', { rejectWithValue }) => {
        try {
            const response = await getRazorpayPaymentsReportService(format);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const extension = format === 'excel' ? 'xlsx' : format;
            link.setAttribute('download', `razorpay_payments_${new Date().getTime()}.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            return format;
        } catch (error: any) {
            const message = "Failed to download report";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

const razorpayPaymentsSlice = createSlice({
    name: "razorpayPayments",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRazorpayPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRazorpayPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchRazorpayPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(downloadRazorpayPaymentsReport.pending, (state, action) => {
                state.downloadingFormat = action.meta.arg;
            })
            .addCase(downloadRazorpayPaymentsReport.fulfilled, (state) => {
                state.downloadingFormat = null;
            })
            .addCase(downloadRazorpayPaymentsReport.rejected, (state) => {
                state.downloadingFormat = null;
            });
    },
});

export default razorpayPaymentsSlice.reducer;

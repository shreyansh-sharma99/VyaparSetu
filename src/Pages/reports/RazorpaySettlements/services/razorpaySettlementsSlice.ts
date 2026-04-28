import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRazorpaySettlementsService, getRazorpaySettlementsReportService } from "./razorpaySettlementsService";
import { toast } from "react-toastify";

interface RazorpaySettlement {
    id: string;
    amount: string;
    currency: string;
    status: string;
    fees: string;
    tax: string;
    utr: string;
    createdAt: string;
}

interface RazorpaySettlementsState {
    data: RazorpaySettlement[];
    loading: boolean;
    downloadingFormat: 'excel' | 'csv' | 'pdf' | null;
    error: string | null;
}

const initialState: RazorpaySettlementsState = {
    data: [],
    loading: false,
    downloadingFormat: null,
    error: null,
};

export const fetchRazorpaySettlements = createAsyncThunk(
    "razorpaySettlements/fetchRazorpaySettlements",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getRazorpaySettlementsService();
            return response.data.data;
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to fetch Razorpay settlements";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

export const downloadRazorpaySettlementsReport = createAsyncThunk(
    "razorpaySettlements/downloadReport",
    async (format: 'excel' | 'csv' | 'pdf', { rejectWithValue }) => {
        try {
            const response = await getRazorpaySettlementsReportService(format);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const extension = format === 'excel' ? 'xlsx' : format;
            link.setAttribute('download', `razorpay_settlements_${new Date().getTime()}.${extension}`);
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

const razorpaySettlementsSlice = createSlice({
    name: "razorpaySettlements",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRazorpaySettlements.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRazorpaySettlements.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchRazorpaySettlements.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(downloadRazorpaySettlementsReport.pending, (state, action) => {
                state.downloadingFormat = action.meta.arg;
            })
            .addCase(downloadRazorpaySettlementsReport.fulfilled, (state) => {
                state.downloadingFormat = null;
            })
            .addCase(downloadRazorpaySettlementsReport.rejected, (state) => {
                state.downloadingFormat = null;
            });
    },
});

export default razorpaySettlementsSlice.reducer;

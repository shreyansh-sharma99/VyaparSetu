import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getInvoiceReportService } from "./invoiceReportService";
import { toast } from "react-toastify";

interface LineItem {
  description: string;
  amount: number;
}

interface RecentInvoice {
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
  lineItems: LineItem[];
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
}

interface InvoiceReportData {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  aging: {
    "0_30": number;
    "30_60": number;
    "60_plus": number;
  };
  recentInvoices: RecentInvoice[];
}

interface InvoiceReportState {
  data: InvoiceReportData | null;
  loading: boolean;
  error: string | null;
}

const initialState: InvoiceReportState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchInvoiceReport = createAsyncThunk(
  "invoiceReport/fetchInvoiceReport",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getInvoiceReportService();
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch invoice report";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const invoiceReportSlice = createSlice({
  name: "invoiceReport",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoiceReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceReport.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchInvoiceReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default invoiceReportSlice.reducer;

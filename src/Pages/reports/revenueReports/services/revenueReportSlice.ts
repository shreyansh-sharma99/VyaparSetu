import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRevenueReportService } from "./revenueReportService";
import { toast } from "react-toastify";

interface ByPlanItem {
  _id: string;
  total: number;
  planName: string;
}

interface MonthlyTrendItem {
  _id: { year: number; month: number };
  total: number;
}

interface RevenueReportData {
  mrr: number;
  arr: number;
  totalCollected: number;
  totalPending: number;
  byPlan: ByPlanItem[];
  byTenure: Record<string, number>;
  monthlyTrend: MonthlyTrendItem[];
}

interface RevenueReportState {
  data: RevenueReportData | null;
  loading: boolean;
  error: string | null;
}

const initialState: RevenueReportState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchRevenueReport = createAsyncThunk(
  "revenueReport/fetchRevenueReport",
  async ({ from, to }: { from?: string; to?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await getRevenueReportService(from, to);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch revenue report";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const revenueReportSlice = createSlice({
  name: "revenueReport",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevenueReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenueReport.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchRevenueReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default revenueReportSlice.reducer;

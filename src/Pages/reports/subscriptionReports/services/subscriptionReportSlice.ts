import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getSubscriptionReportService } from "./subscriptionReportService";
import { toast } from "react-toastify";

interface SubscriptionReportData {
  newThisMonth: number;
  renewals: number;
  upgrades: number;
  cancellations: number;
  byTenure: Record<string, number>;
}

interface SubscriptionReportState {
  data: SubscriptionReportData | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionReportState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchSubscriptionReport = createAsyncThunk(
  "subscriptionReport/fetchSubscriptionReport",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getSubscriptionReportService();
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch subscription report";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const subscriptionReportSlice = createSlice({
  name: "subscriptionReport",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionReport.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSubscriptionReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default subscriptionReportSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAdminReportService } from "./adminReportService";
import { toast } from "react-toastify";

interface ByPlanItem {
  _id: string | null;
  count: number;
  planName: string;
}

interface RecentAdmin {
  subscription: { status: string };
  _id: string;
  name: string;
  email: string;
  businessName: string;
  subscriptionStatus: string;
  trialExtensionsCount: number;
  createdAt: string;
  canExtend: boolean;
  id: string;
  plan?: {
    _id: string;
    name: string;
    computedPricing: any[];
    id: string;
  };
  planTenure?: string;
}

interface AdminReportData {
  total: number;
  active: number;
  trialing: number;
  suspended: number;
  expired: number;
  cancelled: number;
  byPlan: ByPlanItem[];
  recentAdmins: RecentAdmin[];
}

interface AdminReportState {
  data: AdminReportData | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminReportState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchAdminReport = createAsyncThunk(
  "adminReport/fetchAdminReport",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAdminReportService();
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch admin report";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const adminReportSlice = createSlice({
  name: "adminReport",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminReport.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAdminReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default adminReportSlice.reducer;

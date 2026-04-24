import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getSubscriptionsService, getSubscriptionByIdService, updateSubscriptionService } from "./subscriptionService";
import { toast } from "react-toastify";

interface AdminInfo {
  _id: string;
  name: string;
  email: string;
}

interface PlanInfo {
  _id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  basePrice?: number;
  currency?: string;
  trial?: {
    enabled: boolean;
    durationDays: number;
  };
  limits?: {
    maxProducts: number;
    maxOrders: number;
    maxCustomers: number;
    maxStaff: number;
    maxStores: number;
    storageGB: number;
  };
  features?: {
    analyticsEnabled: boolean;
    customDomain: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    exportData: boolean;
    whitelabel: boolean;
    customThemes: boolean;
    smsNotifications: boolean;
  };
  billingCycles?: any[];
  computedPricing?: any[];
  id: string;
}

interface SubscriptionHistory {
  action: string;
  toPlanId?: any;
  note: string;
  performedBy: string;
  date: string;
}

export interface Subscription {
  _id: string;
  adminId: AdminInfo | null;
  planId: PlanInfo | null;
  tenure: string;
  status: string;
  startDate: string;
  endDate: string;
  razorpaySubscriptionId: string;
  history: SubscriptionHistory[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface SubscriptionState {
  subscriptions: Subscription[];
  currentSubscription: Subscription | null;
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  } | null;
  loading: boolean;
  submitting: boolean;
  fetchingCurrent: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  subscriptions: [],
  currentSubscription: null,
  meta: null,
  loading: false,
  submitting: false,
  fetchingCurrent: false,
  error: null,
};

export const fetchSubscriptions = createAsyncThunk(
  "subscription/fetchSubscriptions",
  async (
    { page, limit, search, status, tenure }: { page: number; limit: number; search?: string; status?: string; tenure?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await getSubscriptionsService(page, limit, search, status, tenure);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch subscriptions";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchSubscriptionById = createAsyncThunk(
  "subscription/fetchSubscriptionById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getSubscriptionByIdService(id);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch subscription details";
      return rejectWithValue(message);
    }
  }
);

export const updateSubscription = createAsyncThunk(
  "subscription/updateSubscription",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await updateSubscriptionService(id, data);
      toast.success("Subscription updated successfully");
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update subscription";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    clearCurrentSubscription: (state) => {
      state.currentSubscription = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload.data;
        state.meta = action.payload.meta.pagination;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSubscriptionById.pending, (state) => {
        state.fetchingCurrent = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionById.fulfilled, (state, action) => {
        state.fetchingCurrent = false;
        state.currentSubscription = action.payload;
      })
      .addCase(fetchSubscriptionById.rejected, (state, action) => {
        state.fetchingCurrent = false;
        state.error = action.payload as string;
      })
      .addCase(updateSubscription.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.submitting = false;
        state.subscriptions = state.subscriptions.map((sub) =>
          sub._id === action.payload._id ? action.payload : sub
        );
        if (state.currentSubscription?._id === action.payload._id) {
          state.currentSubscription = action.payload;
        }
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;

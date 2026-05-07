import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getSubscriptionsService, getSubscriptionByIdService, updateSubscriptionService, upgradeSubscriptionService, cancelSubscriptionService, extendSubscriptionService, reconcileSubscriptionsService, forceStatusSubscriptionService } from "./subscriptionService";
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

export const upgradeSubscription = createAsyncThunk(
  "subscription/upgradeSubscription",
  async ({ id, data }: { id: string; data: { planId: string; tenure: string } }, { rejectWithValue }) => {
    try {
      const response = await upgradeSubscriptionService(id, data);
      toast.success("Subscription upgraded successfully");
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to upgrade subscription";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  "subscription/cancelSubscription",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await cancelSubscriptionService(id);
      toast.success("Subscription cancelled successfully");
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to cancel subscription";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const extendSubscription = createAsyncThunk(
  "subscription/extendSubscription",
  async ({ id, data }: { id: string; data: { days: number } }, { rejectWithValue }) => {
    try {
      const response = await extendSubscriptionService(id, data);
      toast.success("Subscription extended successfully");
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to extend subscription";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const reconcileSubscription = createAsyncThunk(
  "subscription/reconcileSubscription",
  async (_, { rejectWithValue }) => {
    try {
      const response = await reconcileSubscriptionsService();
      toast.success("Subscriptions reconciled successfully");
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to reconcile subscriptions";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const forceStatusSubscription = createAsyncThunk(
  "subscription/forceStatusSubscription",
  async ({ id, data }: { id: string; data: { status: string } }, { rejectWithValue }) => {
    try {
      const response = await forceStatusSubscriptionService(id, data);
      toast.success("Subscription status forced successfully");
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to force subscription status";
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
      })
      .addCase(upgradeSubscription.pending, (state) => {
        state.submitting = true;
      })
      .addCase(upgradeSubscription.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentSubscription = action.payload;
        state.subscriptions = state.subscriptions.map((sub) =>
          sub._id === action.payload._id ? action.payload : sub
        );
      })
      .addCase(upgradeSubscription.rejected, (state) => {
        state.submitting = false;
      })
      .addCase(cancelSubscription.pending, (state) => {
        state.submitting = true;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentSubscription = action.payload;
        state.subscriptions = state.subscriptions.map((sub) =>
          sub._id === action.payload._id ? action.payload : sub
        );
      })
      .addCase(cancelSubscription.rejected, (state) => {
        state.submitting = false;
      })
      .addCase(extendSubscription.pending, (state) => {
        state.submitting = true;
      })
      .addCase(extendSubscription.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentSubscription = action.payload;
        state.subscriptions = state.subscriptions.map((sub) =>
          sub._id === action.payload._id ? action.payload : sub
        );
      })
      .addCase(extendSubscription.rejected, (state) => {
        state.submitting = false;
      })
      .addCase(reconcileSubscription.pending, (state) => {
        state.submitting = true;
      })
      .addCase(reconcileSubscription.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(reconcileSubscription.rejected, (state) => {
        state.submitting = false;
      })
      .addCase(forceStatusSubscription.pending, (state) => {
        state.submitting = true;
      })
      .addCase(forceStatusSubscription.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentSubscription = action.payload;
        state.subscriptions = state.subscriptions.map((sub) =>
          sub._id === action.payload._id ? action.payload : sub
        );
      })
      .addCase(forceStatusSubscription.rejected, (state) => {
        state.submitting = false;
      });
  },
});

export const { clearCurrentSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPlans, createPlan, togglePlan, getPlanById, updatePlan, deletePlan } from './PlanServices';

// Define the interface for the Plan state
export interface Plan {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  isFeatured: boolean;
  basePrice: number;
  currency: string;
  trial: {
    enabled: boolean;
    durationDays: number;
  };
  billingCycles: {
    tenure: string;
    label: string;
    durationMonths: number;
    discountPercent: number;
    isEnabled: boolean;
    razorpayPlanId?: string | null;
  }[];
  limits: {
    maxProducts: number;
    maxOrders: number;
    maxCustomers: number;
    maxStaff: number;
    maxStores: number;
    storageGB: number;
  };
  features: {
    analyticsEnabled: boolean;
    customDomain: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    exportData: boolean;
    whitelabel: boolean;
    customThemes: boolean;
    smsNotifications: boolean;
  };
  subscriberCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface PlanState {
  plans: Plan[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  currentPlan: Plan | null;
}

const initialState: PlanState = {
  plans: [],
  loading: false,
  submitting: false,
  error: null,
  currentPlan: null,
};

// Async thunk for fetching plans
export const fetchPlans = createAsyncThunk(
  'plan/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPlans();
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch plans');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch plans');
    }
  }
);

// Async thunk for creating a plan
export const addNewPlan = createAsyncThunk(
  'plan/addNewPlan',
  async (planData: any, { rejectWithValue }) => {
    try {
      const response = await createPlan(planData);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to create plan');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create plan');
    }
  }
);

// Async thunk for toggling plan status
export const togglePlanStatus = createAsyncThunk(
  'plan/togglePlanStatus',
  async (planId: string, { rejectWithValue }) => {
    try {
      const response = await togglePlan(planId);
      if (response.success) {
        return { planId, isActive: response.data.isActive };
      } else {
        return rejectWithValue(response.message || 'Failed to toggle plan status');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle plan status');
    }
  }
);

// Async thunk for fetching a single plan by ID
export const fetchPlanById = createAsyncThunk(
  'plan/fetchPlanById',
  async (planId: string, { rejectWithValue }) => {
    try {
      const response = await getPlanById(planId);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch plan details');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch plan details');
    }
  }
);

// Async thunk for updating an existing plan
export const updateExistingPlan = createAsyncThunk(
  'plan/updateExistingPlan',
  async ({ planId, planData }: { planId: string, planData: any }, { rejectWithValue }) => {
    try {
      const response = await updatePlan(planId, planData);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'Failed to update plan');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update plan');
    }
  }
);

// Async thunk for deleting a plan
export const deleteExistingPlan = createAsyncThunk(
  'plan/deleteExistingPlan',
  async (planId: string, { rejectWithValue }) => {
    try {
      const response = await deletePlan(planId);
      if (response.success) {
        return planId;
      } else {
        return rejectWithValue(response.message || 'Failed to delete plan');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete plan');
    }
  }
);

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    clearPlanError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Plans
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add New Plan
      .addCase(addNewPlan.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(addNewPlan.fulfilled, (state, action) => {
        state.submitting = false;
        // Ensure plans is always an array
        state.plans = [action.payload, ...(Array.isArray(state.plans) ? state.plans : [])];
      })
      .addCase(addNewPlan.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // Toggle Plan Status
      .addCase(togglePlanStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(togglePlanStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { planId, isActive } = action.payload;
        const plan = state.plans.find(p => p._id === planId);
        if (plan) {
          plan.isActive = isActive;
        }
      })
      .addCase(togglePlanStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Plan By ID
      .addCase(fetchPlanById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlanById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlan = action.payload;
      })
      .addCase(fetchPlanById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Plan
      .addCase(updateExistingPlan.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateExistingPlan.fulfilled, (state, action) => {
        state.submitting = false;
        const updatedPlan = action.payload;
        const index = state.plans.findIndex(p => p._id === updatedPlan._id);
        if (index !== -1) {
          state.plans[index] = updatedPlan;
        }
        state.currentPlan = updatedPlan;
      })
      .addCase(updateExistingPlan.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // Delete Plan
      .addCase(deleteExistingPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingPlan.fulfilled, (state, action) => {
        state.loading = false;
        const deletedPlanId = action.payload;
        state.plans = state.plans.filter(p => p._id !== deletedPlanId);
      })
      .addCase(deleteExistingPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPlanError } = planSlice.actions;
export default planSlice.reducer;

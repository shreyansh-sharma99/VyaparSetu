import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAdminsService, createAdminService, getAdminByIdService, updateAdminService, deleteAdminService, resendOnboardingService, suspendAdminService, activateAdminService, extendSubscriptionService, getAdminRazorpayService, getAdminAuditLogsService, assignCashPlanService } from "./adminService";
import { toast } from "react-toastify";

interface Admin {
  _id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  isActive: boolean;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  planId?: string;
  tenure?: string;
  notes?: string;
  createdAt: string;
  plan: {
    _id: string;
    name: string;
  } | null;
  subscription?: {
    status: string;
    currentPeriodEnd?: string;
    currentPeriodStart?: string;
    razorpaySubscriptionId?: string;
    trialEndsAt?: string | null;
  };
  onboardingStatus?: string;
  status?: string;
  canShowCashPlanAssign?: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
    userType: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
    userType: string;
  };
}

interface AdminState {
  admins: Admin[];
  currentAdmin: any | null;
  razorpayData: any | null;
  auditLogs: any | null;
  fetchingRazorpay: boolean;
  fetchingAuditLogs: boolean;
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
  filterStatus: string;
  managementStatusFilter: string;
  planFilter: string;
  paymentMethodFilter: string;
  expiringSoonFilter: string;
  createdByFilter: string;
  searchQuery: string;
  pagination: {
    currentPage: number;
    pageSize: number;
  };
}

const initialState: AdminState = {
  admins: [],
  currentAdmin: null,
  razorpayData: null,
  auditLogs: null,
  fetchingRazorpay: false,
  fetchingAuditLogs: false,
  meta: null,
  loading: false,
  submitting: false,
  fetchingCurrent: false,
  error: null,
  filterStatus: "all",
  managementStatusFilter: "all",
  planFilter: "all",
  paymentMethodFilter: "all",
  expiringSoonFilter: "all",
  createdByFilter: "all",
  searchQuery: "",
  pagination: {
    currentPage: 1,
    pageSize: 10,
  },
};

export const fetchAdmins = createAsyncThunk("admin/fetchAdmins",
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await getAdminsService(params);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch admins";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createAdmin = createAsyncThunk("admin/createAdmin",
  async (adminData: any, { rejectWithValue }) => {
    try {
      const response = await createAdminService(adminData);
      return response.data.data.admin;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create admin";
      return rejectWithValue(message);
    }
  }
);

export const fetchAdminById = createAsyncThunk("admin/fetchAdminById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getAdminByIdService(id);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch admin details";
      return rejectWithValue(message);
    }
  }
);

export const updateAdmin = createAsyncThunk("admin/updateAdmin",
  async ({ id, adminData }: { id: string; adminData: any }, { rejectWithValue }) => {
    try {
      const response = await updateAdminService(id, adminData);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update admin";
      return rejectWithValue(message);
    }
  }
);

export const deleteAdmin = createAsyncThunk("admin/deleteAdmin",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteAdminService(id);
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to delete admin";
      return rejectWithValue(message);
    }
  }
);

export const resendOnboarding = createAsyncThunk("admin/resendOnboarding",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await resendOnboardingService(id);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to resend onboarding";
      return rejectWithValue(message);
    }
  }
);

export const suspendAdmin = createAsyncThunk("admin/suspendAdmin",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await suspendAdminService(id);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to suspend admin";
      return rejectWithValue(message);
    }
  }
);

export const activateAdmin = createAsyncThunk("admin/activateAdmin",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await activateAdminService(id);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to activate admin";
      return rejectWithValue(message);
    }
  }
);

export const extendSubscription = createAsyncThunk("admin/extendSubscription",
  async ({ id, days }: { id: string; days: number }, { rejectWithValue }) => {
    try {
      const response = await extendSubscriptionService(id, days);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to extend subscription";
      return rejectWithValue(message);
    }
  }
);

export const fetchAdminRazorpay = createAsyncThunk("admin/fetchAdminRazorpay",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getAdminRazorpayService(id);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch Razorpay data";
      return rejectWithValue(message);
    }
  }
);

export const fetchAdminAuditLogs = createAsyncThunk("admin/fetchAdminAuditLogs",
  async ({ id, page, limit }: { id: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await getAdminAuditLogsService(id, page, limit);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch audit logs";
      return rejectWithValue(message);
    }
  }
);

export const assignCashPlan = createAsyncThunk("admin/assignCashPlan",
  async ({ id, planData }: { id: string; planData: any }, { rejectWithValue }) => {
    try {
      const response = await assignCashPlanService(id, planData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to assign cash plan";
      return rejectWithValue(message);
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearCurrentAdmin: (state) => {
      state.currentAdmin = null;
      state.razorpayData = null;
      state.auditLogs = null;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
      state.pagination.currentPage = 1;
    },
    setManagementStatusFilter: (state, action) => {
      state.managementStatusFilter = action.payload;
      state.pagination.currentPage = 1;
    },
    setPlanFilter: (state, action) => {
      state.planFilter = action.payload;
      state.pagination.currentPage = 1;
    },
    setPaymentMethodFilter: (state, action) => {
      state.paymentMethodFilter = action.payload;
      state.pagination.currentPage = 1;
    },
    setExpiringSoonFilter: (state, action) => {
      state.expiringSoonFilter = action.payload;
      state.pagination.currentPage = 1;
    },
    setCreatedByFilter: (state, action) => {
      state.createdByFilter = action.payload;
      state.pagination.currentPage = 1;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.pagination.currentPage = 1;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = action.payload.data;
        state.meta = action.payload.meta.pagination;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createAdmin.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.submitting = false;
        state.admins = [action.payload, ...state.admins];
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAdminById.pending, (state) => {
        state.fetchingCurrent = true;
        state.error = null;
      })
      .addCase(fetchAdminById.fulfilled, (state, action) => {
        state.fetchingCurrent = false;
        state.currentAdmin = action.payload;
      })
      .addCase(fetchAdminById.rejected, (state, action) => {
        state.fetchingCurrent = false;
        state.error = action.payload as string;
      })
      .addCase(updateAdmin.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.submitting = false;
        // Only update currentAdmin if it's the same admin being updated
        if (state.currentAdmin && state.currentAdmin.admin?._id === action.payload._id) {
          state.currentAdmin = { ...state.currentAdmin, admin: action.payload };
        }
        state.admins = state.admins.map(admin => admin._id === action.payload._id ? action.payload : admin);
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.admins = state.admins.filter(admin => admin._id !== action.payload);
      })
      .addCase(fetchAdminRazorpay.pending, (state) => {
        state.fetchingRazorpay = true;
      })
      .addCase(fetchAdminRazorpay.fulfilled, (state, action) => {
        state.fetchingRazorpay = false;
        state.razorpayData = action.payload;
      })
      .addCase(fetchAdminRazorpay.rejected, (state) => {
        state.fetchingRazorpay = false;
      })
      .addCase(fetchAdminAuditLogs.pending, (state) => {
        state.fetchingAuditLogs = true;
      })
      .addCase(fetchAdminAuditLogs.fulfilled, (state, action) => {
        state.fetchingAuditLogs = false;
        state.auditLogs = action.payload;
      })
      .addCase(fetchAdminAuditLogs.rejected, (state) => {
        state.fetchingAuditLogs = false;
      })
      .addCase(assignCashPlan.pending, (state) => {
        state.submitting = true;
      })
      .addCase(assignCashPlan.fulfilled, (state, action) => {
        state.submitting = false;
        if (state.currentAdmin && state.currentAdmin.admin) {
          state.currentAdmin.admin.planId = action.payload?.data?.planId;
        }
      })
      .addCase(assignCashPlan.rejected, (state) => {
        state.submitting = false;
      });
  },
});

export const { clearCurrentAdmin, setFilterStatus, setManagementStatusFilter, setPlanFilter, setPaymentMethodFilter, setExpiringSoonFilter, setCreatedByFilter, setSearchQuery, setPagination } = adminSlice.actions;
export default adminSlice.reducer;

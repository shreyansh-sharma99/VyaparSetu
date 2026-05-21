import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getRolesService,
  createRoleService,
  getRoleByIdService,
  updateRoleService,
  deleteRoleService,
} from "./rolesService";
import { toast } from "react-toastify";

export interface Permission {
  module: string;
  slug: string;
  canRead: boolean;
  canWrite: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface Role {
  _id: string;
  roleName: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RolesState {
  roles: Role[];
  currentRole: Role | null;
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

const initialState: RolesState = {
  roles: [],
  currentRole: null,
  meta: null,
  loading: false,
  submitting: false,
  fetchingCurrent: false,
  error: null,
};

export const fetchRoles = createAsyncThunk(
  "roles/fetchRoles",
  async (
    { page, limit, search }: { page: number; limit: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await getRolesService(page, limit, search);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch roles";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createRole = createAsyncThunk(
  "roles/createRole",
  async (roleData: any, { rejectWithValue }) => {
    try {
      const response = await createRoleService(roleData);
      toast.success("Role created successfully");
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create role";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchRoleById = createAsyncThunk(
  "roles/fetchRoleById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getRoleByIdService(id);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch role details";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateRole = createAsyncThunk(
  "roles/updateRole",
  async ({ id, roleData }: { id: string; roleData: any }, { rejectWithValue }) => {
    try {
      const response = await updateRoleService(id, roleData);
      toast.success("Role updated successfully");
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update role";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteRole = createAsyncThunk(
  "roles/deleteRole",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteRoleService(id);
      toast.success("Role deleted successfully");
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to delete role";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    clearCurrentRole: (state) => {
      state.currentRole = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchRoles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.data;
        state.meta = action.payload.meta.pagination;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // createRole
      .addCase(createRole.pending, (state) => {
        state.submitting = true;
      })
      .addCase(createRole.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(createRole.rejected, (state) => {
        state.submitting = false;
      })
      // fetchRoleById
      .addCase(fetchRoleById.pending, (state) => {
        state.fetchingCurrent = true;
      })
      .addCase(fetchRoleById.fulfilled, (state, action) => {
        state.fetchingCurrent = false;
        state.currentRole = action.payload;
      })
      .addCase(fetchRoleById.rejected, (state) => {
        state.fetchingCurrent = false;
      })
      // updateRole
      .addCase(updateRole.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateRole.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(updateRole.rejected, (state) => {
        state.submitting = false;
      })
      // deleteRole
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter((role) => role._id !== action.payload);
      });
  },
});

export const { clearCurrentRole } = rolesSlice.actions;
export default rolesSlice.reducer;

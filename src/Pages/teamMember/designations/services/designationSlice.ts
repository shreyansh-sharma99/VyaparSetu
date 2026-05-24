import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getDesignationsService,
  createDesignationService,
  updateDesignationService,
  deleteDesignationService,
} from "./designationService";
import { toast } from "react-toastify";

interface Designation {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DesignationState {
  designations: Designation[];
  meta: { total: number; page: number; limit: number; pages: number } | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: DesignationState = {
  designations: [],
  meta: null,
  loading: false,
  submitting: false,
  error: null,
};

export const fetchDesignations = createAsyncThunk(
  "designation/fetchDesignations",
  async ({ page = 1, limit = 10, search = "" }: { page?: number; limit?: number; search?: string }, { rejectWithValue }) => {
    try {
      const response = await getDesignationsService(page, limit, search);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch designations";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createDesignation = createAsyncThunk(
  "designation/createDesignation",
  async (data: any, { rejectWithValue, dispatch }) => {
    try {
      const response = await createDesignationService(data);
      toast.success("Designation created successfully");
      dispatch(fetchDesignations({ page: 1, limit: 10 }));
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create designation";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateDesignation = createAsyncThunk(
  "designation/updateDesignation",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue, dispatch }) => {
    try {
      const response = await updateDesignationService(id, data);
      toast.success("Designation updated successfully");
      dispatch(fetchDesignations({ page: 1, limit: 10 }));
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update designation";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteDesignation = createAsyncThunk(
  "designation/deleteDesignation",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteDesignationService(id);
      toast.success("Designation deleted successfully");
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to delete designation";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const designationSlice = createSlice({
  name: "designation",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchDesignations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDesignations.fulfilled, (state, action) => {
        state.loading = false;
        state.designations = action.payload.data;
        state.meta = action.payload.meta?.pagination || null;
      })
      .addCase(fetchDesignations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createDesignation.pending, (state) => {
        state.submitting = true;
      })
      .addCase(createDesignation.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(createDesignation.rejected, (state) => {
        state.submitting = false;
      })
      // Update
      .addCase(updateDesignation.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateDesignation.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(updateDesignation.rejected, (state) => {
        state.submitting = false;
      })
      // Delete
      .addCase(deleteDesignation.fulfilled, (state, action) => {
        state.designations = state.designations.filter((d) => d._id !== action.payload);
      });
  },
});

export default designationSlice.reducer;

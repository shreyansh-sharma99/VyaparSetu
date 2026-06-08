import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getEmailTemplates,
  getEmailTemplateById,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} from './emailTemplateService';

export interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  content: string;
  designTemplate?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface EmailTemplateState {
  templates: EmailTemplate[];
  currentTemplate: EmailTemplate | null;
  meta: PaginationMeta | null;
  loading: boolean;
  loadingCurrent: boolean;
  updating: boolean;
  error: string | null;
}

const initialState: EmailTemplateState = {
  templates: [],
  currentTemplate: null,
  meta: null,
  loading: false,
  loadingCurrent: false,
  updating: false,
  error: null,
};

export const fetchEmailTemplates = createAsyncThunk(
  'emailTemplate/fetchEmailTemplates',
  async ({ page, limit, search }: { page: number; limit: number; search?: string }, { rejectWithValue }) => {
    try {
      const response = await getEmailTemplates(page, limit, search);
      if (response.success) {
        return { data: response.data, meta: response.meta };
      }
      return rejectWithValue(response.message || 'Failed to fetch templates');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

export const fetchEmailTemplateByIdAction = createAsyncThunk(
  'emailTemplate/fetchEmailTemplateById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getEmailTemplateById(id);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch template');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

export const createEmailTemplateAction = createAsyncThunk(
  'emailTemplate/createEmailTemplate',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await createEmailTemplate(data);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to create template');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

export const updateEmailTemplateAction = createAsyncThunk(
  'emailTemplate/updateEmailTemplate',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await updateEmailTemplate(id, data);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to update template');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

export const deleteEmailTemplateAction = createAsyncThunk(
  'emailTemplate/deleteEmailTemplate',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await deleteEmailTemplate(id);
      if (response.success) {
        return id; // Return the id to remove from list
      }
      return rejectWithValue(response.message || 'Failed to delete template');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

const emailTemplateSlice = createSlice({
  name: 'emailTemplate',
  initialState,
  reducers: {
    clearCurrentTemplate: (state) => {
      state.currentTemplate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchEmailTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmailTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload.data;
        state.meta = action.payload.meta?.pagination || null;
      })
      .addCase(fetchEmailTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single
      .addCase(fetchEmailTemplateByIdAction.pending, (state) => {
        state.loadingCurrent = true;
        state.error = null;
      })
      .addCase(fetchEmailTemplateByIdAction.fulfilled, (state, action) => {
        state.loadingCurrent = false;
        state.currentTemplate = action.payload;
      })
      .addCase(fetchEmailTemplateByIdAction.rejected, (state, action) => {
        state.loadingCurrent = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createEmailTemplateAction.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(createEmailTemplateAction.fulfilled, (state) => {
        state.updating = false;
        // Optionally add to list if needed
      })
      .addCase(createEmailTemplateAction.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateEmailTemplateAction.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateEmailTemplateAction.fulfilled, (state, action) => {
        state.updating = false;
        state.currentTemplate = action.payload;
      })
      .addCase(updateEmailTemplateAction.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteEmailTemplateAction.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(deleteEmailTemplateAction.fulfilled, (state, action) => {
        state.updating = false;
        state.templates = state.templates.filter((t) => t._id !== action.payload);
      })
      .addCase(deleteEmailTemplateAction.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentTemplate } = emailTemplateSlice.actions;
export default emailTemplateSlice.reducer;

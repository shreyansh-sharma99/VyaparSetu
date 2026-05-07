import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSettings, updateSettings } from './settingsService';

interface RazorpaySettings {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

interface SmtpSettings {
  host: string;
  port: number;
  user: string;
  password?: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
}

interface PlatformSettings {
  name: string;
  logoUrl: string;
  supportEmail: string;
  currency: string;
  timezone: string;
  gstNumber: string;
  invoicePrefix: string;
  frontendUrl?: string;
  notificationEmail?: string;
}

export interface PlanFeatureDefinition {
  _id: string;
  key: string;
  label: string;
  systemHook: string;
  type: 'number' | 'boolean';
  defaultValue: number | boolean;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

interface BillingSettings {
  autoSuspend: boolean;
  gracePeriodDays: number;
  maxExtensionDays: number;
  maxTrialExtensions: number;
}

export interface SettingsData {
  razorpay: RazorpaySettings;
  smtp: SmtpSettings;
  platform: PlatformSettings;
  billing: BillingSettings;
  planFeatureDefinitions: PlanFeatureDefinition[];
  _id: string;
  createdAt: string;
  updatedAt: string;
}

interface SettingsState {
  settings: SettingsData | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: null,
  loading: false,
  updating: false,
  error: null,
};

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getSettings();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch settings');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

export const updateSettingsAction = createAsyncThunk(
  'settings/updateSettings',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await updateSettings(data);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to update settings');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateSettingsAction.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateSettingsAction.fulfilled, (state, action) => {
        state.updating = false;
        state.settings = action.payload;
      })
      .addCase(updateSettingsAction.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });
  },
});

export default settingsSlice.reducer;

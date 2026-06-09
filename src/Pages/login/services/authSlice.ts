import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, logoutApi, changePasswordApi, forgotPasswordApi } from './authService';
import { encryptData, decryptData } from '@/utility/crypto';
import { storePermissions } from '@/utility/permission';

interface AuthState {
  user: any;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  changingPassword: boolean;
  forgotPasswordLoading: boolean;
}

const getInitialAuth = () => {
  const vsetu = localStorage.getItem('vyaparsetu');
  let user = null;
  let isAuthenticated = false;

  if (vsetu) {
    try {
      const decrypted = decryptData(vsetu);
      if (decrypted) {
        const parsed = JSON.parse(decrypted);
        user = parsed.owner || parsed.user || (parsed.data ? (parsed.data.owner || parsed.data.user) : null);
        const encryptedToken = localStorage.getItem('_v_at');
        if (encryptedToken) {
          const decryptedToken = decryptData(encryptedToken);
          if (decryptedToken) {
            isAuthenticated = true;
          }
        }
      }
    } catch {
      // invalid payload
    }
  }
  return { user, isAuthenticated };
};

const initData = getInitialAuth();

const initialState: AuthState = {
  user: initData.user,
  loading: false,
  error: null,
  isAuthenticated: initData.isAuthenticated,
  changingPassword: false,
  forgotPasswordLoading: false,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: any, { rejectWithValue }) => {
    try {
      const data = await loginApi(credentials);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout API failed', error);
    } finally {
      // Always clear local state even if API fails
      dispatch(logout());
      return true;
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData: any, { rejectWithValue }) => {
    try {
      const data = await changePasswordApi(passwordData);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to change password.'
      );
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (emailData: { email: string }, { rejectWithValue }) => {
    try {
      const data = await forgotPasswordApi(emailData);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send reset link.'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          state.isAuthenticated = true;
          const loggedInUser = action.payload.data.owner || action.payload.data.user;
          state.user = loggedInUser;
          const token = action.payload.data.accessToken;
          const refreshToken = action.payload.data.refreshToken;

          if (token) {
            localStorage.setItem('_v_at', encryptData(token));
          }
          if (refreshToken) {
            localStorage.setItem('_v_rt', encryptData(refreshToken));
          }
          if (loggedInUser?.userType) {
            localStorage.setItem('userType', loggedInUser.userType);
          }

          const encryptedString = encryptData(JSON.stringify(action.payload.data));
          localStorage.setItem('vyaparsetu', encryptedString);
          storePermissions(action.payload.data);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Login failed. Please try again.';
      })
      .addCase(changePassword.pending, (state) => {
        state.changingPassword = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.changingPassword = false;
      })
      .addCase(changePassword.rejected, (state) => {
        state.changingPassword = false;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordLoading = true;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.forgotPasswordLoading = false;
      })
      .addCase(forgotPassword.rejected, (state) => {
        state.forgotPasswordLoading = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, logoutApi } from './authService';
import { encryptData, decryptData } from '@/utility/crypto';

interface AuthState {
  user: any;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
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
        user = parsed.owner || (parsed.data ? parsed.data.owner : null);
        if (localStorage.getItem('accessToken')) {
          isAuthenticated = true;
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
          state.user = action.payload.data.owner || action.payload.data.user;
          const token = action.payload.data.accessToken;

          if (token) {
            localStorage.setItem('accessToken', token);
          }
          
          const encryptedString = encryptData(JSON.stringify(action.payload.data));
          localStorage.setItem('vyaparsetu', encryptedString);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

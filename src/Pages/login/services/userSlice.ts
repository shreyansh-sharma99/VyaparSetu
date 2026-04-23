import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProfileApi } from './userService';
import { encryptData, decryptData } from '@/utility/crypto';

interface UserState {
  profile: any;
  loading: boolean;
  error: string | null;
}

const getStoredProfile = () => {
  try {
    const vsetu = localStorage.getItem('vyaparsetu');
    if (vsetu) {
      const decrypted = decryptData(vsetu);
      if (decrypted) {
        const parsed = JSON.parse(decrypted);
        return parsed.data || parsed; // Handle both full response or just data
      }
    }
  } catch (e) {
    console.error("Error loading profile from storage", e);
  }
  return null;
};

const initialState: UserState = {
  profile: getStoredProfile(),
  loading: false,
  error: null,
};

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getProfileApi();
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch profile'
      );
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.profile = null;
      localStorage.removeItem('vyaparsetu');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.success) {
          state.profile = action.payload.data;

          // Encrypt and store the response data
          const encryptedString = encryptData(JSON.stringify(action.payload));
          localStorage.setItem('vyaparsetu', encryptedString);
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;

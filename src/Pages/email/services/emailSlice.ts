import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendEmail } from './emailService';
import { toast } from 'react-toastify';

interface EmailState {
  isSending: boolean;
  error: string | null;
}

const initialState: EmailState = {
  isSending: false,
  error: null,
};

export const sendEmailAction = createAsyncThunk(
  'email/sendEmail',
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await sendEmail(payload);
      if (response.success) {
        toast.success(response.message || 'Email sent successfully');
        return response.data;
      } else {
        toast.error(response.message || 'Failed to send email');
        return rejectWithValue(response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send email';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendEmailAction.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendEmailAction.fulfilled, (state) => {
        state.isSending = false;
      })
      .addCase(sendEmailAction.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload as string;
      });
  },
});

export default emailSlice.reducer;

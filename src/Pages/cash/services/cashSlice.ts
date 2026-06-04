import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCashLedger, getCashReport, approveHandover, rejectHandover, getCashWallet, initiateHandover } from './cashService';

export interface LedgerItem {
  _id: string;
  name: string;
  email: string;
  userType: string;
  total: number;
}

export interface CollectionItem {
  _id: string;
  admin?: {
    _id: string;
    name: string;
    email: string;
    businessName: string;
  };
  plan?: {
    _id: string;
    name: string;
  };
  invoice?: string;
  amount: number;
  currency: string;
  collectedBy: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletData {
  cashInHand: number;
  pendingApprovalCash: number;
  cashToApprove: number;
  cashToApproveCount: number;
  incomingRequests?: any[];
  outgoingRequests?: any[];
  handovers?: any[];
  collections?: any[];
  recentHandovers?: any[];
  recentCollections?: any[];
}

interface CashState {
  ledger: LedgerItem[];
  report: { collections: CollectionItem[], handovers: any[] } | null;
  wallet: WalletData | null;
  loading: boolean;
  ledgerLoading: boolean;
  reportLoading: boolean;
  walletLoading: boolean;
  actionLoading: boolean;
  error: string | null;
  reportError: string | null;
}

const initialState: CashState = {
  ledger: [],
  report: null,
  wallet: null,
  loading: false,
  ledgerLoading: false,
  reportLoading: false,
  walletLoading: false,
  actionLoading: false,
  error: null,
  reportError: null,
};

export const fetchCashLedger = createAsyncThunk(
  'cash/fetchLedger',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCashLedger();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch ledger');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

export const fetchCashReport = createAsyncThunk(
  'cash/fetchReport',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await getCashReport(userId);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch report');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

export const fetchCashWallet = createAsyncThunk(
  'cash/fetchWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCashWallet();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch wallet');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

export const handleApproveHandover = createAsyncThunk(
  'cash/approveHandover',
  async (handoverId: string, { rejectWithValue }) => {
    try {
      const response = await approveHandover(handoverId);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to approve handover');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

export const handleRejectHandover = createAsyncThunk(
  'cash/rejectHandover',
  async (handoverId: string, { rejectWithValue }) => {
    try {
      const response = await rejectHandover(handoverId);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to reject handover');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

export const handleInitiateHandover = createAsyncThunk(
  'cash/initiateHandover',
  async (payload: { amount: number; toUserId?: string; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await initiateHandover(payload);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to initiate handover');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

const cashSlice = createSlice({
  name: 'cash',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Ledger
      .addCase(fetchCashLedger.pending, (state) => {
        state.ledgerLoading = true;
        state.error = null;
      })
      .addCase(fetchCashLedger.fulfilled, (state, action) => {
        state.ledgerLoading = false;
        state.ledger = action.payload;
      })
      .addCase(fetchCashLedger.rejected, (state, action) => {
        state.ledgerLoading = false;
        state.error = action.payload as string;
      })
      // Report
      .addCase(fetchCashReport.pending, (state) => {
        state.reportLoading = true;
        state.reportError = null;
      })
      .addCase(fetchCashReport.fulfilled, (state, action) => {
        state.reportLoading = false;
        state.report = action.payload;
        state.reportError = null; // Clear on success
      })
      .addCase(fetchCashReport.rejected, (state, action) => {
        state.reportLoading = false;
        state.reportError = action.payload as string;
      })
      // Wallet
      .addCase(fetchCashWallet.pending, (state) => {
        state.walletLoading = true;
        state.error = null;
      })
      .addCase(fetchCashWallet.fulfilled, (state, action) => {
        state.walletLoading = false;
        state.wallet = action.payload;
      })
      .addCase(fetchCashWallet.rejected, (state, action) => {
        state.walletLoading = false;
        state.error = action.payload as string;
      })
      // Approve Handover
      .addCase(handleApproveHandover.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(handleApproveHandover.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(handleApproveHandover.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      // Reject Handover
      .addCase(handleRejectHandover.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(handleRejectHandover.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(handleRejectHandover.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      })
      // Initiate Handover
      .addCase(handleInitiateHandover.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(handleInitiateHandover.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(handleInitiateHandover.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default cashSlice.reducer;

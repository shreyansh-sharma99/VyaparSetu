import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getTeamMembersService, createTeamMemberService, getTeamMemberByIdService, updateTeamMemberService, deleteTeamMemberService } from "./teamMemberService";
import { toast } from "react-toastify";

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  userType: string;
  permissions: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TeamMemberState {
  teamMembers: TeamMember[];
  currentTeamMember: any | null;
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

const initialState: TeamMemberState = {
  teamMembers: [],
  currentTeamMember: null,
  meta: null,
  loading: false,
  submitting: false,
  fetchingCurrent: false,
  error: null,
};

export const fetchTeamMembers = createAsyncThunk("teamMember/fetchTeamMembers",
  async ({ page, limit, search }: { page: number; limit: number; search?: string }, { rejectWithValue }) => {
    try {
      const response = await getTeamMembersService(page, limit, search);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch team members";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createTeamMember = createAsyncThunk("teamMember/createTeamMember",
  async (teamMemberData: any, { rejectWithValue }) => {
    try {
      const response = await createTeamMemberService(teamMemberData);
      toast.success("Team member created successfully");
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create team member";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchTeamMemberById = createAsyncThunk("teamMember/fetchTeamMemberById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getTeamMemberByIdService(id);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch team member details";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateTeamMember = createAsyncThunk("teamMember/updateTeamMember",
  async ({ id, teamMemberData }: { id: string; teamMemberData: any }, { rejectWithValue }) => {
    try {
      const response = await updateTeamMemberService(id, teamMemberData);
      toast.success("Team member updated successfully");
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update team member";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteTeamMember = createAsyncThunk("teamMember/deleteTeamMember",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteTeamMemberService(id);
      toast.success("Team member deleted successfully");
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to delete team member";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const teamMemberSlice = createSlice({
  name: "teamMember",
  initialState,
  reducers: {
    clearCurrentTeamMember: (state) => {
      state.currentTeamMember = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.teamMembers = action.payload.data;
        state.meta = action.payload.meta.pagination;
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTeamMember.pending, (state) => {
        state.submitting = true;
      })
      .addCase(createTeamMember.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(createTeamMember.rejected, (state) => {
        state.submitting = false;
      })
      .addCase(fetchTeamMemberById.pending, (state) => {
        state.fetchingCurrent = true;
      })
      .addCase(fetchTeamMemberById.fulfilled, (state, action) => {
        state.fetchingCurrent = false;
        state.currentTeamMember = action.payload;
      })
      .addCase(fetchTeamMemberById.rejected, (state) => {
        state.fetchingCurrent = false;
      })
      .addCase(updateTeamMember.pending, (state) => {
        state.submitting = true;
      })
      .addCase(updateTeamMember.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(updateTeamMember.rejected, (state) => {
        state.submitting = false;
      })
      .addCase(deleteTeamMember.fulfilled, (state, action) => {
        state.teamMembers = state.teamMembers.filter(member => member._id !== action.payload);
      });
  },
});

export const { clearCurrentTeamMember } = teamMemberSlice.actions;
export default teamMemberSlice.reducer;

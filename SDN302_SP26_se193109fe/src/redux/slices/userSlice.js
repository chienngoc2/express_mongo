import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api';

// Fetch all users (admin only)
export const fetchAllUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/users');
      return response.data; // array of user objects
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data?.err?.message || 'Không thể lấy danh sách người dùng!');
    }
  }
);

// Toggle admin status for a user (no backend endpoint yet - will add)
export const toggleAdminStatus = createAsyncThunk(
  'users/toggleAdmin',
  async ({ userId, adminStatus }, { rejectWithValue }) => {
    try {
      const response = await API.patch(`/users/${userId}/admin`, { admin: adminStatus });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật quyền Admin!');
    }
  }
);

const initialState = {
  users: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserError: (state) => { state.error = null; },
    // Optimistic update for admin toggle
    updateUserAdminLocally: (state, action) => {
      const { userId, admin } = action.payload;
      const idx = state.users.findIndex(u => u._id === userId);
      if (idx !== -1) state.users[idx].admin = admin;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleAdminStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.users.findIndex(u => u._id === updated._id);
        if (idx !== -1) state.users[idx] = updated;
      });
  }
});

export const { clearUserError, updateUserAdminLocally } = userSlice.actions;
export default userSlice.reducer;

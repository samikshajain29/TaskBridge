import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

// Global dashboard — GET /dashboard (no projectId)
export const fetchDashboardMetrics = createAsyncThunk(
  'dashboard/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard metrics');
    }
  }
);

// Project-specific dashboard — GET /dashboard/project/:id
export const fetchProjectDashboardMetrics = createAsyncThunk(
  'dashboard/fetchProjectMetrics',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/dashboard/project/${projectId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project dashboard metrics');
    }
  }
);

const initialState = {
  metrics: {
    totalTasks: 0,
    statusStats: { todo: 0, inprogress: 0, done: 0 },
    priorityStats: { low: 0, medium: 0, high: 0 },
    overdueTasks: 0,
    tasksPerUser: [],
    recentActivity: [],
  },
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Global dashboard
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Project-specific dashboard
      .addCase(fetchProjectDashboardMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectDashboardMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchProjectDashboardMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;

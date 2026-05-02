import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

export const createProjectThunk = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project');
    }
  }
);

// Restore last selected project from localStorage (or null)
const storedProjectId = localStorage.getItem('selectedProjectId') || null;

const initialState = {
  projects: [],
  selectedProjectId: storedProjectId,
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearProjectsError: (state) => {
      state.error = null;
    },
    setSelectedProjectId: (state, action) => {
      state.selectedProjectId = action.payload;
      // Persist to localStorage
      if (action.payload) {
        localStorage.setItem('selectedProjectId', action.payload);
      } else {
        localStorage.removeItem('selectedProjectId');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;

        // Auto-select: if no project is selected yet (or stored one no longer exists),
        // default to the first project in the list
        if (state.projects.length > 0) {
          const storedStillExists = state.selectedProjectId &&
            state.projects.some(p => p._id === state.selectedProjectId);
          if (!storedStillExists) {
            state.selectedProjectId = state.projects[0]._id;
            localStorage.setItem('selectedProjectId', state.projects[0]._id);
          }
        } else {
          state.selectedProjectId = null;
          localStorage.removeItem('selectedProjectId');
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProjectThunk.fulfilled, (state, action) => {
        state.projects.push(action.payload);
      });
  },
});

export const { clearProjectsError, setSelectedProjectId } = projectSlice.actions;
export default projectSlice.reducer;

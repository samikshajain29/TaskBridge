import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosConfig';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${projectId}/tasks`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchKanbanTasks = createAsyncThunk(
  'tasks/fetchKanbanTasks',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${projectId}/tasks/kanban`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch kanban tasks');
    }
  }
);

export const createTaskThunk = createAsyncThunk(
  'tasks/createTask',
  async ({ projectId, taskData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/projects/${projectId}/tasks`, taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export const reorderTasksThunk = createAsyncThunk(
  'tasks/reorderTasks',
  async ({ projectId, tasks }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/projects/${projectId}/tasks/reorder`, { tasks });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reorder tasks');
    }
  }
);

export const updateTaskThunk = createAsyncThunk(
  'tasks/updateTask',
  async ({ projectId, taskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

const initialState = {
  tasks: [],
  kanban: {
    todo: [],
    inprogress: [],
    done: [],
  },
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasksError: (state) => {
      state.error = null;
    },
    updateKanbanStateLocally: (state, action) => {
      state.kanban = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false; state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      // fetchKanbanTasks
      .addCase(fetchKanbanTasks.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchKanbanTasks.fulfilled, (state, action) => {
        state.loading = false; 
        state.kanban = action.payload || { todo: [], inprogress: [], done: [] };
      })
      .addCase(fetchKanbanTasks.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })
      // createTask
      .addCase(createTaskThunk.fulfilled, (state, action) => {
        const newTask = action.payload;
        if (state.kanban[newTask.status]) {
            state.kanban[newTask.status].push(newTask);
        } else {
            state.kanban.todo.push(newTask); // Fallback
        }
      })
      // updateTask
      .addCase(updateTaskThunk.fulfilled, (state, action) => {
        // Find the task and update it, or just refetch. Let's just update the specific item if found.
        const updatedTask = action.payload;
        // The easiest way to keep state consistent is removing it from all columns and adding it to the correct one
        Object.keys(state.kanban).forEach(status => {
          state.kanban[status] = state.kanban[status].filter(t => t._id !== updatedTask._id);
        });
        if (state.kanban[updatedTask.status]) {
          state.kanban[updatedTask.status].push(updatedTask);
        }
      });
  },
});

export const { clearTasksError, updateKanbanStateLocally } = taskSlice.actions;
export default taskSlice.reducer;

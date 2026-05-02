import { configureStore } from '@reduxjs/toolkit';
import projectReducer from '../features/projects/projectSlice';
import taskReducer from '../features/tasks/taskSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';

export const store = configureStore({
  reducer: {
    projects: projectReducer,
    tasks: taskReducer,
    dashboard: dashboardReducer,
  },
});

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardMetrics, fetchProjectDashboardMetrics } from '../features/dashboard/dashboardSlice';
import { fetchProjects } from '../features/projects/projectSlice';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { CheckCircle, AlertCircle, LayoutList } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Low, Medium, High Priority Colors
const STATUS_COLORS = ['#cbd5e1', '#6366f1', '#10b981']; // To Do, In Progress, Done

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { metrics, loading } = useSelector((state) => state.dashboard);
  const { projects, selectedProjectId } = useSelector((state) => state.projects);

  // Fetch projects on mount if not loaded (so selectedProjectId gets auto-set)
  useEffect(() => {
    if (projects.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch, projects.length]);

  // Fetch dashboard data whenever selectedProjectId changes
  useEffect(() => {
    if (selectedProjectId) {
      dispatch(fetchProjectDashboardMetrics(selectedProjectId));
    } else if (projects.length === 0) {
      // Fallback: no projects at all, use global dashboard
      dispatch(fetchDashboardMetrics());
    }
  }, [dispatch, selectedProjectId, projects.length]);

  // Find the selected project name for display
  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  // Format data for Recharts
  const statusData = metrics ? [
    { name: 'To Do', count: metrics.statusStats?.todo || 0 },
    { name: 'In Progress', count: metrics.statusStats?.inprogress || 0 },
    { name: 'Done', count: metrics.statusStats?.done || 0 },
  ] : [];

  const priorityData = metrics ? [
    { name: 'Low', count: metrics.priorityStats?.low || 0 },
    { name: 'Medium', count: metrics.priorityStats?.medium || 0 },
    { name: 'High', count: metrics.priorityStats?.high || 0 },
  ] : [];

  const userData = metrics?.tasksPerUser?.map(u => ({
    name: u.name,
    Total: u.total,
    Completed: u.completed
  })) || [];

  if (loading && !metrics?.totalTasks) {
    return (
      <div className="flex flex-col h-full p-6 lg:p-8 bg-gray-50">
        <div className="w-64 h-8 bg-gray-200 rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
          <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-80 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-gray-50 text-gray-800">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {selectedProject ? `${selectedProject.name} — Dashboard` : 'Dashboard Overview'}
          </h1>
          <p className="text-gray-500 mt-1">
            {selectedProject
              ? `Project analytics for ${selectedProject.name}`
              : `Welcome back, ${user?.name}`
            }
          </p>
          {metrics?.role && (
            <span className={`inline-block mt-2 px-2.5 py-0.5 text-xs font-semibold rounded-full ${
              metrics.role === 'admin'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {metrics.role === 'admin' ? 'Admin' : 'Member'}
            </span>
          )}
        </div>
      </div>

      {/* Overall Progress Bar */}
      {metrics?.totalTasks > 0 && (
        <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700 tracking-wide">
              {metrics?.role === 'admin'
                ? (selectedProject ? 'Project Progress' : 'Overall Project Progress')
                : 'My Task Progress'
              }
            </h3>
            <span className="text-sm font-bold text-indigo-600">
              {metrics.projectProgress || 0}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${metrics.projectProgress || 0}%` }}
            ></div>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            {metrics.statusStats.done} of {metrics.totalTasks} tasks completed
          </p>
          {metrics?.role !== 'admin' && (
            <p className="mt-1 text-xs text-gray-400">Based on your assigned tasks</p>
          )}
        </div>
      )}
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
        <div className="flex items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="p-4 mr-4 bg-indigo-100 text-indigo-600 rounded-full">
            <LayoutList className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Tasks</h3>
            <p className="text-3xl font-bold mt-1 text-gray-800">{metrics?.totalTasks || 0}</p>
          </div>
        </div>

        <div className="flex items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="p-4 mr-4 bg-red-100 text-red-600 rounded-full">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Overdue Tasks</h3>
            <p className="text-3xl font-bold mt-1 text-gray-800">{metrics?.overdueTasks || 0}</p>
          </div>
        </div>

        <div className="flex items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="p-4 mr-4 bg-green-100 text-green-600 rounded-full">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Completed Tasks</h3>
            <p className="text-3xl font-bold mt-1 text-gray-800">{metrics?.statusStats?.done || 0}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Status Bar Chart */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 text-gray-700">Tasks by Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Pie Chart */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 text-gray-700">Tasks by Priority</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User Performance Chart — only visible for admin role */}
      {metrics?.role === 'admin' && userData.length > 0 && (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 text-gray-700">Tasks Performance by User</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="Total" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;

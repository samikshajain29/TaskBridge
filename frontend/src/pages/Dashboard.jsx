import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardMetrics, fetchProjectDashboardMetrics } from '../features/dashboard/dashboardSlice';
import { fetchProjects } from '../features/projects/projectSlice';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { CheckCircle, AlertCircle, LayoutList } from 'lucide-react';

const COLORS = ['#8b5cf6', '#f59e0b', '#ef4444']; // Violet, Amber, Rose
const STATUS_COLORS = ['#d4d4d8', '#8b5cf6', '#10b981']; // Zinc, Violet, Emerald

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { metrics, loading } = useSelector((state) => state.dashboard);
  const { projects, selectedProjectId } = useSelector((state) => state.projects);

  useEffect(() => {
    if (projects.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch, projects.length]);

  useEffect(() => {
    if (selectedProjectId) {
      dispatch(fetchProjectDashboardMetrics(selectedProjectId));
    } else if (projects.length === 0) {
      dispatch(fetchDashboardMetrics());
    }
  }, [dispatch, selectedProjectId, projects.length]);

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

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
      <div className="flex flex-col min-h-screen p-6 lg:p-10 bg-zinc-50 font-sans">
        <div className="w-64 h-10 bg-zinc-200 rounded-2xl animate-pulse mb-10"></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-10">
          <div className="h-40 bg-zinc-200 rounded-[2.5rem] animate-pulse"></div>
          <div className="h-40 bg-zinc-200 rounded-[2.5rem] animate-pulse"></div>
          <div className="h-40 bg-zinc-200 rounded-[2.5rem] animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="h-96 bg-zinc-200 rounded-[2.5rem] animate-pulse"></div>
          <div className="h-96 bg-zinc-200 rounded-[2.5rem] animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 bg-zinc-50 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="flex items-center gap-3 mb-2">
             <div className="px-2 py-0.5 bg-primary-100 text-primary-700 text-[10px] font-bold rounded-md uppercase tracking-wider">Analytics Hub</div>
             <div className="w-1.5 h-1.5 rounded-full bg-zinc-300"></div>
             <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Real-time Updates</div>
          </div>
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight font-display">
            {selectedProject ? selectedProject.name : 'Dashboard'}
          </h1>
          <p className="text-zinc-500 mt-2 text-sm max-w-xl leading-relaxed">
            {selectedProject
              ? `Performance metrics and task distribution for ${selectedProject.name}`
              : `Welcome back, ${user?.name}. Here's what's happening with your projects.`
            }
          </p>
        </div>
        
        {metrics?.role && (
          <div className={`px-4 py-2 rounded-2xl border font-bold text-xs uppercase tracking-widest animate-in fade-in slide-in-from-right-4 duration-700 ${
            metrics.role === 'admin'
              ? 'bg-primary-50 text-primary-700 border-primary-100'
              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
          }`}>
            {metrics.role} Access
          </div>
        )}
      </div>

      {/* Overall Progress Section */}
      {metrics?.totalTasks > 0 && (
        <div className="mb-10 p-8 glass rounded-[2.5rem] border-white/40 shadow-2xl shadow-zinc-200/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32 group-hover:bg-primary-100 transition-colors duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-800">
                {metrics?.role === 'admin'
                  ? (selectedProject ? 'Project Completion' : 'Aggregated Progress')
                  : 'Your Personal Progress'
                }
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-extrabold text-primary-600">
                  {metrics.projectProgress || 0}%
                </span>
              </div>
            </div>
            
            <div className="w-full h-4 bg-zinc-100 rounded-full overflow-hidden p-1 border border-zinc-200/50">
              <div 
                className="h-full bg-primary-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                style={{ width: `${metrics.projectProgress || 0}%` }}
              ></div>
            </div>
            
            <div className="mt-6 flex flex-wrap items-center gap-6">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{metrics.statusStats.done} Completed</p>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{metrics.statusStats.inprogress} In Progress</p>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{metrics.statusStats.todo} To Do</p>
               </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-10">
        <div className="group p-8 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-2xl hover:shadow-primary-100/50 transition-all duration-500">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-primary-50 text-primary-600 rounded-2xl group-hover:scale-110 transition-transform duration-500">
              <LayoutList className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Tasks</h3>
              <p className="text-3xl font-extrabold mt-1 text-zinc-900 font-display">{metrics?.totalTasks || 0}</p>
            </div>
          </div>
        </div>

        <div className="group p-8 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-2xl hover:shadow-rose-100/50 transition-all duration-500">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform duration-500">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Overdue</h3>
              <p className="text-3xl font-extrabold mt-1 text-zinc-900 font-display">{metrics?.overdueTasks || 0}</p>
            </div>
          </div>
        </div>

        <div className="group p-8 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-500">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-500">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Completed</h3>
              <p className="text-3xl font-extrabold mt-1 text-zinc-900 font-display">{metrics?.statusStats?.done || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        {/* Status Bar Chart */}
        <div className="p-8 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm">
          <h3 className="text-lg font-bold mb-8 text-zinc-800 flex items-center gap-3">
             Status Distribution
             <div className="h-1 flex-1 bg-zinc-50 rounded-full"></div>
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 600 }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', radius: 10 }} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }} 
                />
                <Bar dataKey="count" radius={[10, 10, 10, 10]} barSize={40}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Pie Chart */}
        <div className="p-8 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm">
          <h3 className="text-lg font-bold mb-8 text-zinc-800 flex items-center gap-3">
             Priority Breakdown
             <div className="h-1 flex-1 bg-zinc-50 rounded-full"></div>
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="count"
                  strokeWidth={0}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }} 
                />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ paddingTop: '30px', fontWeight: 600, color: '#71717a' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User Performance Chart — only visible for admin role */}
      {metrics?.role === 'admin' && userData.length > 0 && (
        <div className="p-8 bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm">
          <h3 className="text-lg font-bold mb-8 text-zinc-800 flex items-center gap-3">
             Team Performance
             <div className="h-1 flex-1 bg-zinc-50 rounded-full"></div>
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa' }} />
                <Tooltip 
                   cursor={{ fill: '#f8fafc', radius: 10 }} 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }} 
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }} />
                <Bar dataKey="Total" fill="#e4e4e7" radius={[10, 10, 10, 10]} barSize={30} />
                <Bar dataKey="Completed" fill="#8b5cf6" radius={[10, 10, 10, 10]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchKanbanTasks, updateKanbanStateLocally, reorderTasksThunk, createTaskThunk, updateTaskThunk } from '../features/tasks/taskSlice';
import { fetchProjectDashboardMetrics } from '../features/dashboard/dashboardSlice';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import Column from '../components/kanban/Column';
import TaskCard from '../components/kanban/TaskCard';
import AddTaskModal from '../components/kanban/AddTaskModal';
import EditTaskModal from '../components/kanban/EditTaskModal';
import TaskDetailModal from '../components/kanban/TaskDetailModal';
import AddMemberModal from '../components/AddMemberModal';
import Button from '../components/Button';
import { Plus, UserPlus } from 'lucide-react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const ProjectDetail = () => {
  const { id: projectId } = useParams();
  const dispatch = useDispatch();
  const { kanban, loading } = useSelector((state) => state.tasks);
  const { user } = useAuth();
  
  const [activeTask, setActiveTask] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [project, setProject] = useState(null);

  // Task Detail + Edit modal state
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProjectDetails = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects/${projectId}`);
      setProject(data);
    } catch (err) {
      console.error('Failed to fetch project details', err);
    }
  }, [projectId]);

  useEffect(() => {
    dispatch(fetchKanbanTasks(projectId));
    dispatch(fetchProjectDashboardMetrics(projectId));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjectDetails();
  }, [dispatch, projectId, fetchProjectDetails]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const { task } = active.data.current;
    setActiveTask(task);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeContainer = active.data.current?.task?.status || active.data.current?.sortable?.containerId;
    const overContainer = over.data.current?.task?.status || over.data.current?.sortable?.containerId || over.id;

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    // Move task between columns optimistically
    const activeItems = kanban[activeContainer] || [];
    const overItems = kanban[overContainer] || [];
    const activeIndex = activeItems.findIndex(t => t._id === activeId);
    const overIndex = overItems.findIndex(t => t._id === overId);

    let newIndex = overIndex >= 0 ? overIndex : overItems.length;

    const newKanban = {
      ...kanban,
      [activeContainer]: [...activeItems.slice(0, activeIndex), ...activeItems.slice(activeIndex + 1)],
      [overContainer]: [
        ...overItems.slice(0, newIndex),
        { ...activeItems[activeIndex], status: overContainer },
        ...overItems.slice(newIndex)
      ]
    };

    dispatch(updateKanbanStateLocally(newKanban));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeContainer = active.data.current?.task?.status || active.data.current?.sortable?.containerId;
    const overContainer = over.data.current?.task?.status || over.data.current?.sortable?.containerId || over.id;

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      // Reorder within same column
      const items = kanban[overContainer];
      const activeIndex = items.findIndex(t => t._id === activeId);
      const overIndex = items.findIndex(t => t._id === overId);

      if (activeIndex !== overIndex) {
        const newItems = arrayMove(items, activeIndex, overIndex);
        const newKanban = { ...kanban, [overContainer]: newItems };
        dispatch(updateKanbanStateLocally(newKanban));
        
        // Prepare payload for backend
        const tasksPayload = newItems.map((t, index) => ({ _id: t._id, status: overContainer, order: index }));
        dispatch(reorderTasksThunk({ projectId, tasks: tasksPayload }));
      }
    } else {
      // Moved to different column. Status was already updated in handleDragOver.
      // Now just persist the order of the overContainer (and activeContainer if needed, backend reorders based on what we send).
      const items = kanban[overContainer];
      const tasksPayload = items.map((t, index) => ({ _id: t._id, status: overContainer, order: index }));
      dispatch(reorderTasksThunk({ projectId, tasks: tasksPayload }));
    }
  };

  const handleCreateTask = (taskData) => {
    dispatch(createTaskThunk({ projectId, taskData }));
  };

  const handleStatusChange = (taskId, newStatus) => {
    dispatch(updateTaskThunk({ projectId, taskId, taskData: { status: newStatus } }));
  };

  // --- Task click → opens detail modal ---
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  // --- Admin edit from detail modal → opens edit modal ---
  const handleOpenEdit = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  // --- Admin submits edit → update + refetch ---
  const handleEditSubmit = async (taskId, taskData) => {
    await dispatch(updateTaskThunk({ projectId, taskId, taskData }));
    // Refetch to ensure UI is fully synced (REQ 4)
    dispatch(fetchKanbanTasks(projectId));
  };

  if (loading && !kanban.todo?.length && !kanban.inprogress?.length && !kanban.done?.length) {
    return (
      <div className="flex flex-col h-full p-6 lg:p-8 bg-gray-50">
        <div className="flex items-center justify-between mb-8 animate-pulse">
          <div className="w-48 h-8 bg-gray-200 rounded"></div>
        </div>
        <div className="flex gap-6">
          <div className="flex-1 h-96 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="flex-1 h-96 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="flex-1 h-96 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const isAdmin = project?.members?.some(m => (m.user?._id || m.user) === user?._id && m.role === 'admin') || false;

  // Non-admin members for assignment dropdowns (exclude admins)
  const assignableMembers = project?.members?.filter(m => m.role !== 'admin').map(m => m.user) || [];

  return (
    <div className="flex flex-col min-h-screen p-6 lg:p-10 bg-zinc-50 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="flex items-center gap-3 mb-2">
             <div className="px-2 py-0.5 bg-primary-100 text-primary-700 text-[10px] font-bold rounded-md uppercase tracking-wider">Project Board</div>
             <div className="w-1.5 h-1.5 rounded-full bg-zinc-300"></div>
             <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{project?.members?.length || 0} Members</div>
          </div>
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight font-display">{project?.name || 'Project Board'}</h1>
          <p className="text-zinc-500 mt-2 text-sm max-w-xl leading-relaxed">Collaborate with your team, track progress, and ship faster with TaskBridge.</p>
        </div>

        <div className="flex flex-wrap items-center gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="flex -space-x-3">
            {project?.members?.map((m, idx) => (
              <div key={m.user?._id || idx} className="relative group/member">
                {m.user?.avatar ? (
                  <img src={m.user.avatar} alt={m.user.name} className="w-10 h-10 rounded-2xl border-4 border-zinc-50 ring-1 ring-zinc-100 object-cover" title={`${m.user.name} (${m.role})`} />
                ) : (
                  <div className="w-10 h-10 rounded-2xl border-4 border-zinc-50 bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-600 ring-1 ring-zinc-100" title={`${m.user?.name} (${m.role})`}>
                    {m.user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ))}
            {isAdmin && (
               <button 
                onClick={() => setIsMemberModalOpen(true)}
                className="w-10 h-10 rounded-2xl border-4 border-zinc-50 bg-zinc-100 flex items-center justify-center text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 transition-all ring-1 ring-zinc-100"
               >
                 <Plus className="w-5 h-5" />
               </button>
            )}
          </div>

          {isAdmin && (
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setIsMemberModalOpen(true)}
                className="hidden sm:flex gap-2 border-zinc-200"
              >
                <UserPlus className="w-4 h-4" />
                Invite
              </Button>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="gap-2 shadow-primary-200"
              >
                <Plus className="w-4 h-4" />
                New Task
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-4 pb-4 overflow-x-auto min-h-0">
        {!isAdmin && kanban.todo?.length === 0 && kanban.inprogress?.length === 0 && kanban.done?.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 h-64 text-gray-500">
            <p className="text-lg font-medium">No tasks assigned to you</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <Column columnId="todo" title="To Do" tasks={kanban.todo || []} isAdmin={isAdmin} currentUser={user} onStatusChange={handleStatusChange} onTaskClick={handleTaskClick} />
            <Column columnId="inprogress" title="In Progress" tasks={kanban.inprogress || []} isAdmin={isAdmin} currentUser={user} onStatusChange={handleStatusChange} onTaskClick={handleTaskClick} />
            <Column columnId="done" title="Done" tasks={kanban.done || []} isAdmin={isAdmin} currentUser={user} onStatusChange={handleStatusChange} onTaskClick={handleTaskClick} />

            <DragOverlay>
              {activeTask ? <TaskCard task={activeTask} isAdmin={isAdmin} currentUser={user} /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Add Task Modal (admin only, shown via isAdmin gate on the button) */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateTask}
        users={assignableMembers}
      />

      {/* Task Detail Modal (everyone can view, member can update status) */}
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedTask(null); }}
        task={selectedTask}
        projectName={project?.name}
        isAdmin={isAdmin}
        onEdit={handleOpenEdit}
        onStatusChange={handleStatusChange}
      />

      {/* Edit Task Modal (admin only) */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedTask(null); }}
        onSubmit={handleEditSubmit}
        task={selectedTask}
        users={assignableMembers}
      />

      <AddMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        projectId={projectId}
        currentMembers={project?.members || []}
        onMemberAdded={fetchProjectDetails}
      />
    </div>
  );
};

export default ProjectDetail;

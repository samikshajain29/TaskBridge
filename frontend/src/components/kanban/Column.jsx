import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

const Column = ({ columnId, title, tasks, isAdmin, currentUser, onStatusChange, onTaskClick }) => {
  const { setNodeRef } = useDroppable({
    id: columnId,
    data: {
      type: 'Column',
      columnId,
    }
  });

  return (
    <div className="flex flex-col flex-1 w-full min-w-[320px] max-w-[380px] bg-zinc-100/50 rounded-3xl p-4 border border-zinc-200/50">
      <div className="flex items-center justify-between px-2 mb-6">
        <div className="flex items-center gap-3">
           <div className={`w-2 h-2 rounded-full ${columnId === 'todo' ? 'bg-zinc-400' : columnId === 'inprogress' ? 'bg-primary-500' : 'bg-emerald-500'}`}></div>
           <h3 className="font-bold text-zinc-800 tracking-tight text-sm uppercase tracking-[0.1em]">{title}</h3>
        </div>
        <span className="flex items-center justify-center px-2.5 py-0.5 text-[10px] font-bold text-zinc-500 bg-white border border-zinc-200 rounded-lg shadow-sm">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto min-h-[200px] pr-1 -mr-1"
      >
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col">
            {tasks.map(task => (
              <TaskCard key={task._id} task={task} isAdmin={isAdmin} currentUser={currentUser} onStatusChange={onStatusChange} onTaskClick={onTaskClick} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

export default Column;

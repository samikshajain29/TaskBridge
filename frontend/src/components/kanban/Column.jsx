import React from 'react';
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
    <div className="flex flex-col flex-1 w-full min-w-[300px] max-w-[350px] bg-gray-100 rounded-xl p-3">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-100/50 rounded-t-xl">
        <h3 className="font-semibold text-gray-700 uppercase tracking-wide text-sm">{title}</h3>
        <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-full shadow-sm">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto min-h-[150px] custom-scrollbar"
      >
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task._id} task={task} isAdmin={isAdmin} currentUser={currentUser} onStatusChange={onStatusChange} onTaskClick={onTaskClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default Column;

'use client';

import { useState } from 'react';
import { Pencil, Trash2, Calendar, MoreVertical, Archive } from 'lucide-react';
import { Task } from '@/types';
import { useTaskStore } from '@/hooks/useTaskStore';
import { formatDueDate, isOverdue, getPriorityConfig, cn } from '@/utils';
import toast from 'react-hot-toast';
import TaskFormModal from './TaskFormModal';

interface Props {
  task: Task;
}

export default function TaskCard({ task }: Props) {
  const { toggleTask, deleteTask, updateTask } = useTaskStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isCompleted = task.status === 'completed';
  const overdue = isOverdue(task.due_date, task.status);
  const priority = getPriorityConfig(task.priority);

  const handleToggle = () => toggleTask(task.id, !isCompleted);

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    setDeleting(true);
    const ok = await deleteTask(task.id);
    if (ok) toast.success('Task deleted');
    setDeleting(false);
    setShowMenu(false);
  };

  const handleArchive = async () => {
    await updateTask(task.id, { status: 'archived' } as never);
    toast.success('Task archived');
    setShowMenu(false);
  };

  return (
    <>
      <div
        className={cn(
          'card card-lift flex items-start gap-3 group',
          isCompleted && 'opacity-60',
          deleting && 'opacity-40 pointer-events-none'
        )}
      >
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={handleToggle}
          className="task-checkbox mt-0.5"
          aria-label={`Mark "${task.title}" as ${isCompleted ? 'pending' : 'complete'}`}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <p
              className={cn(
                'font-semibold text-bark-600 text-sm leading-snug flex-1',
                isCompleted && 'line-through text-bark-400'
              )}
            >
              {task.title}
            </p>

            {/* Priority dot */}
            <span
              className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
              style={{ backgroundColor: priority.color }}
              title={priority.label}
            />
          </div>

          {task.description && (
            <p className="text-bark-400 text-xs font-medium mt-1 leading-relaxed line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {task.due_date && (
              <span
                className={cn(
                  'flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
                  overdue
                    ? 'bg-red-50 text-red-500 border border-red-200'
                    : 'bg-cream-100 text-bark-400 border border-cream-200'
                )}
              >
                <Calendar size={10} />
                {overdue && '⚠️ '}{formatDueDate(task.due_date)}
              </span>
            )}

            {task.category && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: task.category.color + '20',
                  color: task.category.color,
                  borderColor: task.category.color + '40',
                }}
              >
                {task.category.icon} {task.category.name}
              </span>
            )}

            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full border priority-${task.priority}`}
            >
              {priority.label}
            </span>
          </div>
        </div>

        {/* Actions menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-bark-300 hover:text-bark-500 hover:bg-cream-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 bg-white border border-cream-200 rounded-xl shadow-bark py-1 min-w-[140px] animate-bounce-in">
                <button
                  onClick={() => { setShowEdit(true); setShowMenu(false); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-bark-500 hover:bg-cream-50 w-full text-left transition-colors"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={handleArchive}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-bark-500 hover:bg-cream-50 w-full text-left transition-colors"
                >
                  <Archive size={14} /> Archive
                </button>
                <div className="border-t border-cream-100 my-1" />
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 w-full text-left transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showEdit && (
        <TaskFormModal task={task} onClose={() => setShowEdit(false)} />
      )}
    </>
  );
}

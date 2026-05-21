'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Calendar, Tag, Flag } from 'lucide-react';
import { Task, TaskFormData, Priority } from '@/types';
import { useTaskStore } from '@/hooks/useTaskStore';
import { getPriorityConfig } from '@/utils';
import toast from 'react-hot-toast';

interface Props {
  task?: Task | null;
  onClose: () => void;
  defaultCategoryId?: string;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent'];

export default function TaskFormModal({ task, onClose, defaultCategoryId }: Props) {
  const { categories, createTask, updateTask } = useTaskStore();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [categoryId, setCategoryId] = useState(task?.category_id ?? defaultCategoryId ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(task?.due_date ?? '');

  const isEditing = !!task;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setLoading(true);
    const data: TaskFormData = {
      title: title.trim(),
      description: description.trim() || undefined,
      category_id: categoryId || undefined,
      priority,
      due_date: dueDate || undefined,
    };

    let result;
    if (isEditing) {
      result = await updateTask(task.id, data);
      if (result) toast.success('Task updated! ✅');
    } else {
      result = await createTask(data);
      if (result) toast.success('Task created! 🌿');
    }

    if (result) onClose();
    setLoading(false);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bark-700/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-bounce-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cream-200 bg-cream-50">
          <h2
            className="text-xl font-extrabold text-bark-600"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            {isEditing ? '✏️ Edit Task' : '✨ New Task'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-bark-400 hover:bg-cream-200 hover:text-bark-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-bark-500 mb-2">
              Task Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="input-field"
              autoFocus
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-bark-500 mb-2">
              Description <span className="text-bark-300 font-medium">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add some details…"
              className="input-field resize-none"
              rows={3}
              maxLength={1000}
            />
          </div>

          {/* Priority + Category row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-bold text-bark-500 mb-2 flex items-center gap-1">
                <Flag size={14} /> Priority
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRIORITIES.map((p) => {
                  const cfg = getPriorityConfig(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-bold transition-all border"
                      style={
                        priority === p
                          ? { backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.border }
                          : { backgroundColor: '#fdf9ed', color: '#a67640', borderColor: '#d9b98f' }
                      }
                    >
                      <span>{cfg.emoji}</span> {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-bark-500 mb-2 flex items-center gap-1">
                <Tag size={14} /> Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="input-field py-2 text-sm"
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-sm font-bold text-bark-500 mb-2 flex items-center gap-1">
              <Calendar size={14} /> Due Date <span className="text-bark-300 font-medium">(optional)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-field"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : isEditing ? '✏️' : '✨'}
              {loading ? 'Saving…' : isEditing ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

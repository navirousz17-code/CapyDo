'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils';

interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

interface Props {
  taskId: string;
}

export default function SubtasksPanel({ taskId }: Props) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    if (expanded) fetchSubtasks();
  }, [expanded, taskId]);

  const fetchSubtasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/subtasks?task_id=${taskId}`);
      const data = await res.json();
      setSubtasks(Array.isArray(data) ? data : []);
    } catch { setSubtasks([]); }
    setLoading(false);
  };

  const addSubtask = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, title: newTitle.trim() }),
      });
      const data = await res.json();
      setSubtasks((prev) => [...prev, data]);
      setNewTitle('');
      setShowInput(false);
    } catch {}
    setAdding(false);
  };

  const toggleSubtask = async (id: string, completed: boolean) => {
    // Optimistic update
    setSubtasks((prev) => prev.map((s) => s.id === id ? { ...s, completed: !completed } : s));
    try {
      await fetch(`/api/subtasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });
    } catch {
      setSubtasks((prev) => prev.map((s) => s.id === id ? { ...s, completed } : s));
    }
  };

  const deleteSubtask = async (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
    try {
      await fetch(`/api/subtasks/${id}`, { method: 'DELETE' });
    } catch {
      fetchSubtasks();
    }
  };

  const completedCount = subtasks.filter((s) => s.completed).length;
  const total = subtasks.length;
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="mt-2">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-bold transition-colors w-full text-left py-1"
        style={{ color: 'var(--text-secondary)' }}
      >
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        <span>Subtasks</span>
        {total > 0 && (
          <span className="ml-1 font-extrabold" style={{ color: 'var(--text-muted)' }}>
            {completedCount}/{total}
          </span>
        )}
        {/* Mini progress bar */}
        {total > 0 && (
          <div className="flex-1 h-1.5 rounded-full ml-1 overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: 'var(--success)' }}
            />
          </div>
        )}
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="mt-2 pl-2 border-l-2 flex flex-col gap-1.5" style={{ borderColor: 'var(--border-strong)' }}>
          {loading ? (
            <div className="flex items-center gap-2 text-xs py-1" style={{ color: 'var(--text-muted)' }}>
              <Loader2 size={12} className="animate-spin" /> Loading...
            </div>
          ) : (
            <>
              {subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2 group">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => toggleSubtask(subtask.id, subtask.completed)}
                    className="task-checkbox"
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span
                    className={cn('text-xs font-semibold flex-1', subtask.completed && 'line-through opacity-50')}
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {subtask.title}
                  </span>
                  <button
                    onClick={() => deleteSubtask(subtask.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {/* Add subtask */}
              {showInput ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addSubtask(); if (e.key === 'Escape') { setShowInput(false); setNewTitle(''); } }}
                    placeholder="Subtask name..."
                    className="flex-1 text-xs px-2 py-1 rounded-lg border outline-none"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-strong)',
                      color: 'var(--text-primary)',
                    }}
                    autoFocus
                    maxLength={100}
                  />
                  <button
                    onClick={addSubtask}
                    disabled={adding || !newTitle.trim()}
                    className="text-xs font-bold px-2 py-1 rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
                  >
                    {adding ? <Loader2 size={12} className="animate-spin" /> : 'Add'}
                  </button>
                  <button
                    onClick={() => { setShowInput(false); setNewTitle(''); }}
                    className="text-xs font-bold"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowInput(true)}
                  className="flex items-center gap-1 text-xs font-semibold mt-1 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Plus size={12} /> Add subtask
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
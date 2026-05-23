'use client';
// app/dashboard/recurring/page.tsx
// Place at: app/dashboard/recurring/page.tsx

import { useEffect, useState } from 'react';
import { Plus, Trash2, Play, ToggleLeft, ToggleRight, RefreshCw, Calendar, Clock, X, Loader2 } from 'lucide-react';
import { useRecurringStore, RecurringTask, RecurringFormData } from '@/hooks/useRecurringStore';
import { useTaskStore } from '@/hooks/useTaskStore';
import { getPriorityConfig } from '@/utils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const INTERVAL_LABELS = { daily: '🔁 Daily', weekly: '📅 Weekly', monthly: '🗓️ Monthly' };
const INTERVAL_ICONS = { daily: '🔁', weekly: '📅', monthly: '🗓️' };

function intervalDescription(task: RecurringTask): string {
  if (task.interval === 'daily') return 'Every day';
  if (task.interval === 'weekly' && task.day_of_week != null) return `Every ${DAYS[task.day_of_week]}`;
  if (task.interval === 'monthly' && task.day_of_month != null) return `Every month on day ${task.day_of_month}`;
  return task.interval;
}

// ── Form Modal ──────────────────────────────────────────────────────────────
function RecurringFormModal({
  onClose,
  onSave,
  categories,
}: {
  onClose: () => void;
  onSave: (data: RecurringFormData) => Promise<RecurringTask | null>;
  categories: { id: string; name: string; color: string; icon: string }[];
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<RecurringFormData>({
    title: '',
    description: '',
    priority: 'medium',
    category_id: '',
    interval: 'daily',
    day_of_week: 1,
    day_of_month: 1,
  });

  const set = (k: keyof RecurringFormData, v: unknown) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 animate-bounce-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-extrabold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
            🔁 New Recurring Task
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="text-sm font-bold mb-1 block" style={{ color: 'var(--text-secondary)' }}>Task Title *</label>
            <input
              className="input-field"
              placeholder="e.g. Weekly team meeting"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-bold mb-1 block" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea
              className="input-field resize-none"
              rows={2}
              placeholder="Optional notes..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>

          {/* Priority + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-bold mb-1 block" style={{ color: 'var(--text-secondary)' }}>Priority</label>
              <select className="input-field" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-bold mb-1 block" style={{ color: 'var(--text-secondary)' }}>Category</label>
              <select className="input-field" value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Interval */}
          <div>
            <label className="text-sm font-bold mb-2 block" style={{ color: 'var(--text-secondary)' }}>Repeats</label>
            <div className="grid grid-cols-3 gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((i) => (
                <button
                  key={i}
                  onClick={() => set('interval', i)}
                  className="py-2 rounded-xl text-sm font-bold transition-all"
                  style={form.interval === i
                    ? { backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }
                    : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                  }
                >
                  {INTERVAL_LABELS[i]}
                </button>
              ))}
            </div>
          </div>

          {/* Weekly: day picker */}
          {form.interval === 'weekly' && (
            <div>
              <label className="text-sm font-bold mb-2 block" style={{ color: 'var(--text-secondary)' }}>Day of week</label>
              <div className="flex gap-1.5 flex-wrap">
                {DAYS.map((d, i) => (
                  <button
                    key={d}
                    onClick={() => set('day_of_week', i)}
                    className="w-10 h-10 rounded-xl text-xs font-bold transition-all"
                    style={form.day_of_week === i
                      ? { backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }
                      : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                    }
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Monthly: day of month */}
          {form.interval === 'monthly' && (
            <div>
              <label className="text-sm font-bold mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                Day of month: <span style={{ color: 'var(--text-primary)' }}>{form.day_of_month}</span>
              </label>
              <input
                type="range" min={1} max={28} step={1}
                value={form.day_of_month}
                onChange={(e) => set('day_of_month', Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>
                <span>1st</span><span>28th</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.title.trim()}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : '🔁'}
            {saving ? 'Saving...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function RecurringPage() {
  const { tasks, loading, fetchRecurring, createRecurring, updateRecurring, deleteRecurring, spawnNow } = useRecurringStore();
  const { categories } = useTaskStore();
  const [showForm, setShowForm] = useState(false);
  const [spawning, setSpawning] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { fetchRecurring(); }, []);

  const handleSpawn = async (id: string) => {
    setSpawning(id);
    await spawnNow(id);
    setSpawning(null);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await deleteRecurring(id);
    setDeleting(null);
  };

  const daily = tasks.filter((t) => t.interval === 'daily');
  const weekly = tasks.filter((t) => t.interval === 'weekly');
  const monthly = tasks.filter((t) => t.interval === 'monthly');

  const groups = [
    { label: '🔁 Daily', items: daily },
    { label: '📅 Weekly', items: weekly },
    { label: '🗓️ Monthly', items: monthly },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-7 animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
            Recurring Tasks 🔁
          </h1>
          <p className="font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Tasks that auto-spawn on a schedule.
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: '🔁', label: 'Daily',   value: daily.length },
          { icon: '📅', label: 'Weekly',  value: weekly.length },
          { icon: '🗓️', label: 'Monthly', value: monthly.length },
        ].map((s) => (
          <div key={s.label} className="card text-center border-0" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-extrabold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>{s.value}</div>
            <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl shimmer" />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && tasks.length === 0 && (
        <div className="card flex flex-col items-center py-16 text-center">
          <div className="text-6xl mb-4">🔁</div>
          <h2 className="text-xl font-extrabold mb-2" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
            No recurring tasks yet
          </h2>
          <p className="font-medium mb-6 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
            Create tasks that automatically respawn daily, weekly, or monthly.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Create your first one
          </button>
        </div>
      )}

      {/* Grouped task list */}
      {!loading && groups.map((group) => (
        <div key={group.label} className="flex flex-col gap-3">
          <h2 className="text-base font-extrabold px-1" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-secondary)' }}>
            {group.label}
          </h2>
          {group.items.map((task) => {
            const priority = getPriorityConfig(task.priority);
            const todayStr = new Date().toISOString().split('T')[0];
            const spawnedToday = task.last_spawned_at === todayStr;

            return (
              <div
                key={task.id}
                className="card flex items-start gap-4 transition-all"
                style={{ opacity: task.is_active ? 1 : 0.5 }}
              >
                {/* Priority dot */}
                <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: priority.color }} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                    {task.category && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-lg"
                        style={{ backgroundColor: task.category.color + '25', color: task.category.color }}
                      >
                        {task.category.icon} {task.category.name}
                      </span>
                    )}
                    {spawnedToday && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                        ✓ Spawned today
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs font-medium mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      <Clock size={11} /> {intervalDescription(task)}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full priority-${task.priority}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Toggle active */}
                  <button
                    onClick={() => updateRecurring(task.id, { is_active: !task.is_active })}
                    title={task.is_active ? 'Pause' : 'Resume'}
                    style={{ color: task.is_active ? 'var(--success)' : 'var(--text-muted)' }}
                  >
                    {task.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>

                  {/* Spawn now */}
                  <button
                    onClick={() => handleSpawn(task.id)}
                    disabled={spawning === task.id || spawnedToday}
                    title="Spawn task now"
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                  >
                    {spawning === task.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Play size={14} />
                    }
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(task.id)}
                    disabled={deleting === task.id}
                    title="Delete"
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-red-50 hover:text-red-400"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {deleting === task.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Trash2 size={14} />
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Tip */}
      {!loading && tasks.length > 0 && (
        <div
          className="rounded-2xl p-4 text-sm font-semibold"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
        >
          💡 Hit the <strong>▶ play button</strong> to instantly spawn a task into your task list. Toggle the switch to pause/resume a recurring task without deleting it.
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <RecurringFormModal
          onClose={() => setShowForm(false)}
          onSave={createRecurring}
          categories={categories}
        />
      )}
    </div>
  );
}
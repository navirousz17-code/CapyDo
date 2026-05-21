'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Flame, CheckCircle2, Circle, Pencil, RefreshCw } from 'lucide-react';
import { useDailyStore } from '@/hooks/useDailyStore';
import { CATEGORY_COLORS, CATEGORY_ICONS, cn } from '@/utils';
import toast from 'react-hot-toast';

const ACTIVITY_ICONS = ['⭐', '💪', '🧘', '📖', '🏃', '💧', '🥗', '😴', '🧹', '✍️', '🎵', '🌿', '🙏', '🚶', '💊', '🧴', '🐕', '📝', '🎯', '❤️'];

export default function DailyActivitiesPage() {
  const { activities, loading, fetchActivities, createActivity, deleteActivity, toggleActivity, updateActivity, getStats } = useDailyStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('⭐');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchActivities(); }, []);

  // Auto-reset check — tells user when next reset is
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const hoursUntilReset = Math.floor((midnight.getTime() - now.getTime()) / 1000 / 60 / 60);
  const minutesUntilReset = Math.floor(((midnight.getTime() - now.getTime()) / 1000 / 60) % 60);

  const stats = getStats();

  const resetForm = () => {
    setTitle(''); setIcon('⭐'); setColor(CATEGORY_COLORS[0]);
    setShowForm(false); setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Activity name is required'); return; }
    setSaving(true);
    if (editingId) {
      await updateActivity(editingId, { title, icon, color });
      toast.success('Activity updated! 🌿');
    } else {
      const result = await createActivity({ title, icon, color });
      if (result) toast.success('Daily activity added! 🌿');
    }
    resetForm();
    setSaving(false);
  };

  const startEdit = (activity: typeof activities[0]) => {
    setEditingId(activity.id);
    setTitle(activity.title);
    setIcon(activity.icon);
    setColor(activity.color);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will remove all its history.`)) return;
    await deleteActivity(id);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
            Daily Activities 🔄
          </h1>
          <p className="text-bark-400 text-sm font-medium mt-0.5">
            Resets every day at midnight · Next reset in {hoursUntilReset}h {minutesUntilReset}m
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary flex items-center gap-2">
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'Add Activity'}
        </button>
      </div>

      {/* Stats bar */}
      {activities.length > 0 && (
        <div className="card bg-gradient-to-r from-moss-50 to-cream-100 border-moss-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-moss-500" />
              <span className="font-bold text-bark-600">Today's Progress</span>
            </div>
            <span className="text-2xl font-extrabold text-moss-500" style={{ fontFamily: "'Baloo 2', cursive" }}>
              {stats.completedToday}/{stats.total}
            </span>
          </div>
          <div className="h-3 bg-white/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-moss-400 to-moss-300 rounded-full transition-all duration-700"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <p className="text-xs text-bark-400 font-semibold mt-2 text-right">{stats.completionRate}% complete</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card animate-slide-up">
          <h2 className="text-lg font-extrabold text-bark-600 mb-5" style={{ fontFamily: "'Baloo 2', cursive" }}>
            {editingId ? '✏️ Edit Activity' : '✨ New Daily Activity'}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-bark-500 mb-2">Activity Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Drink 8 glasses of water"
                className="input-field"
                autoFocus
                maxLength={80}
              />
            </div>

            {/* Preview */}
            <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl border border-cream-200">
              <span className="text-2xl">{icon}</span>
              <span className="font-bold text-sm" style={{ color }}>{title || 'Activity Name'}</span>
              <div className="ml-auto w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
            </div>

            {/* Icon picker */}
            <div>
              <label className="block text-sm font-bold text-bark-500 mb-2">Icon</label>
              <div className="grid grid-cols-10 gap-1.5">
                {ACTIVITY_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={cn(
                      'w-9 h-9 text-lg rounded-lg flex items-center justify-center transition-all border',
                      icon === ic ? 'bg-bark-500 border-bark-500 scale-110 shadow' : 'bg-cream-50 border-cream-200 hover:border-bark-300'
                    )}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label className="block text-sm font-bold text-bark-500 mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn('w-8 h-8 rounded-full border-2 transition-all', color === c ? 'border-bark-600 scale-110 shadow-md' : 'border-transparent hover:scale-105')}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving || !title.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {editingId ? '✏️ Update' : '✨ Add Activity'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Activities list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl shimmer" />)}
        </div>
      ) : activities.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🔄</div>
          <h3 className="text-xl font-extrabold text-bark-500 mb-2" style={{ fontFamily: "'Baloo 2', cursive" }}>
            No daily activities yet
          </h3>
          <p className="text-bark-400 font-medium mb-5">
            Add habits and routines that reset every day at midnight!
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus size={18} /> Add First Activity
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* All done celebration */}
          {stats.completedToday === stats.total && stats.total > 0 && (
            <div className="card bg-gradient-to-r from-moss-100 to-cream-100 border-moss-300 text-center py-5 animate-bounce-in">
              <div className="text-3xl mb-2">🎉</div>
              <p className="font-extrabold text-moss-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
                All done for today! Amazing! ✨
              </p>
              <p className="text-bark-400 text-sm font-medium mt-1">
                Resets in {hoursUntilReset}h {minutesUntilReset}m
              </p>
            </div>
          )}

          {activities.map((activity) => (
            <div
              key={activity.id}
              className={cn(
                'card card-lift flex items-center gap-4 group transition-all',
                activity.completed_today && 'opacity-75'
              )}
              style={{ borderLeft: `4px solid ${activity.color}` }}
            >
              {/* Toggle button */}
              <button
                onClick={() => toggleActivity(activity.id)}
                className="flex-shrink-0 transition-transform hover:scale-110 active:scale-95"
              >
                {activity.completed_today ? (
                  <CheckCircle2 size={28} style={{ color: activity.color }} />
                ) : (
                  <Circle size={28} className="text-bark-300 hover:text-bark-400" />
                )}
              </button>

              {/* Icon + title */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl flex-shrink-0">{activity.icon}</span>
                <div className="min-w-0">
                  <p className={cn(
                    'font-bold text-bark-600 truncate',
                    activity.completed_today && 'line-through text-bark-400'
                  )}>
                    {activity.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {activity.completed_today && (
                      <span className="text-xs font-semibold text-moss-500">✓ Done today</span>
                    )}
                    {(activity.streak ?? 0) > 0 && (
                      <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                        <Flame size={12} /> {activity.streak} day streak
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => startEdit(activity)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-bark-400 hover:text-bark-600 hover:bg-cream-100 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(activity.id, activity.title)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-bark-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reset info card */}
      {activities.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-cream-100 rounded-xl border border-cream-200">
          <RefreshCw size={18} className="text-bark-400 flex-shrink-0" />
          <p className="text-sm text-bark-400 font-medium">
            All activities automatically reset every day at <strong className="text-bark-500">midnight</strong>. 
            Complete them daily to build streaks! 🔥
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Plus, Loader2, Trash2, FolderOpen, X } from 'lucide-react';
import { useTaskStore } from '@/hooks/useTaskStore';
import { CATEGORY_COLORS, CATEGORY_ICONS, cn } from '@/utils';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

export default function CategoriesPage() {
  const { categories, fetchCategories, createCategory, tasks } = useTaskStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState(CATEGORY_ICONS[0]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Category name is required'); return; }
    setLoading(true);
    const result = await createCategory({ name: name.trim(), color, icon });
    if (result) {
      toast.success(`Category "${name}" created! 🌿`);
      setName(''); setColor(CATEGORY_COLORS[0]); setIcon(CATEGORY_ICONS[0]);
      setShowForm(false);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, catName: string) => {
    const taskCount = tasks.filter((t) => t.category_id === id).length;
    const msg = taskCount > 0
      ? `Delete "${catName}"? The ${taskCount} task${taskCount !== 1 ? 's' : ''} in it will become uncategorized.`
      : `Delete category "${catName}"?`;
    if (!confirm(msg)) return;

    const supabase = createClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) { toast.error('Failed to delete category'); return; }
    toast.success('Category deleted');
    fetchCategories();
  };

  const getTaskCount = (catId: string) =>
    tasks.filter((t) => t.category_id === catId && t.status !== 'archived').length;
  const getCompletedCount = (catId: string) =>
    tasks.filter((t) => t.category_id === catId && t.status === 'completed').length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-extrabold text-bark-600"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Categories 🗂️
          </h1>
          <p className="text-bark-400 text-sm font-medium mt-0.5">
            {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Cancel' : 'New Category'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card animate-slide-up">
          <h2
            className="text-lg font-extrabold text-bark-600 mb-5"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            ✨ Create Category
          </h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-bark-500 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name…"
                className="input-field"
                maxLength={50}
                autoFocus
              />
            </div>

            {/* Preview */}
            <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl border border-cream-200">
              <span className="text-2xl">{icon}</span>
              <div>
                <div
                  className="font-bold text-sm"
                  style={{ color }}
                >
                  {name || 'Category Name'}
                </div>
                <div className="text-xs text-bark-400 font-medium">Preview</div>
              </div>
              <div
                className="ml-auto w-4 h-4 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: color }}
              />
            </div>

            {/* Icon picker */}
            <div>
              <label className="block text-sm font-bold text-bark-500 mb-2">Icon</label>
              <div className="grid grid-cols-8 gap-1.5">
                {CATEGORY_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={cn(
                      'w-9 h-9 text-lg rounded-lg flex items-center justify-center transition-all border',
                      icon === ic
                        ? 'bg-bark-500 border-bark-500 scale-110 shadow'
                        : 'bg-cream-50 border-cream-200 hover:border-bark-300'
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
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-all',
                      color === c ? 'border-bark-600 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : '🌿'}
              {loading ? 'Creating…' : 'Create Category'}
            </button>
          </form>
        </div>
      )}

      {/* Categories grid */}
      {categories.length === 0 ? (
        <div className="card text-center py-16">
          <FolderOpen size={48} className="text-bark-300 mx-auto mb-4" />
          <h3
            className="text-xl font-extrabold text-bark-500 mb-2"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            No categories yet
          </h3>
          <p className="text-bark-400 font-medium mb-5">
            Create categories to organize your tasks better.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus size={18} /> Create First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const total = getTaskCount(cat.id);
            const done = getCompletedCount(cat.id);
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div
                key={cat.id}
                className="card card-lift relative overflow-hidden"
                style={{ borderTop: `3px solid ${cat.color}` }}
              >
                {/* Subtle color bg */}
                <div
                  className="absolute inset-0 opacity-5"
                  style={{ backgroundColor: cat.color }}
                />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-soft"
                        style={{ backgroundColor: cat.color + '20' }}
                      >
                        {cat.icon}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
                          {cat.name}
                        </h3>
                        <p className="text-xs text-bark-400 font-semibold">
                          {total} task{total !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-bark-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Progress */}
                  {total > 0 && (
                    <>
                      <div className="flex justify-between text-xs text-bark-400 font-semibold mb-1">
                        <span>{done} completed</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </>
                  )}

                  {total === 0 && (
                    <p className="text-xs text-bark-300 font-medium italic">No tasks in this category yet</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

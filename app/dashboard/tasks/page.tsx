'use client';

import { useState } from 'react';
import {
  Plus, Search, SlidersHorizontal, CheckSquare,
  Clock, AlertTriangle, CalendarCheck, ListFilter
} from 'lucide-react';
import { useTaskStore } from '@/hooks/useTaskStore';
import { FilterType, SortType } from '@/types';
import TaskCard from '@/components/tasks/TaskCard';
import TaskFormModal from '@/components/tasks/TaskFormModal';
import { cn } from '@/utils';

const FILTERS: { key: FilterType; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'All', icon: ListFilter },
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'today', label: 'Today', icon: CalendarCheck },
  { key: 'overdue', label: 'Overdue', icon: AlertTriangle },
  { key: 'completed', label: 'Done', icon: CheckSquare },
];

const SORTS: { key: SortType; label: string }[] = [
  { key: 'created_at', label: 'Newest' },
  { key: 'due_date', label: 'Due Date' },
  { key: 'priority', label: 'Priority' },
  { key: 'title', label: 'Title' },
];

export default function TasksPage() {
  const {
    loading, categories,
    filter, setFilter,
    sortBy, setSortBy,
    selectedCategoryId, setSelectedCategoryId,
    searchQuery, setSearchQuery,
    getFilteredTasks,
  } = useTaskStore();

  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const tasks = getFilteredTasks();

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-extrabold text-bark-600"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            My Tasks ✅
          </h1>
          <p className="text-bark-400 text-sm font-medium mt-0.5">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Add Task
        </button>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-bark-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks…"
            className="input-field pl-9"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-all',
            showFilters
              ? 'bg-bark-500 text-cream-50 border-bark-500'
              : 'bg-white text-bark-500 border-cream-300 hover:border-bark-400'
          )}
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="card animate-slide-up flex flex-col gap-4">
          {/* Status filter */}
          <div>
            <p className="text-xs font-bold text-bark-400 uppercase tracking-wider mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border',
                    filter === key
                      ? 'bg-bark-500 text-cream-50 border-bark-500'
                      : 'bg-cream-50 text-bark-500 border-cream-200 hover:border-bark-300'
                  )}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <div>
              <p className="text-xs font-bold text-bark-400 uppercase tracking-wider mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border',
                    !selectedCategoryId
                      ? 'bg-bark-500 text-cream-50 border-bark-500'
                      : 'bg-cream-50 text-bark-500 border-cream-200 hover:border-bark-300'
                  )}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border'
                    )}
                    style={
                      selectedCategoryId === cat.id
                        ? { backgroundColor: cat.color, color: 'white', borderColor: cat.color }
                        : { backgroundColor: cat.color + '15', color: cat.color, borderColor: cat.color + '40' }
                    }
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sort */}
          <div>
            <p className="text-xs font-bold text-bark-400 uppercase tracking-wider mb-2">Sort By</p>
            <div className="flex flex-wrap gap-2">
              {SORTS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border',
                    sortBy === key
                      ? 'bg-moss-500 text-white border-moss-500'
                      : 'bg-cream-50 text-bark-500 border-cream-200 hover:border-bark-300'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick filter pills (always visible) */}
      <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold transition-all border',
              filter === key
                ? 'bg-bark-500 text-cream-50 border-bark-500'
                : 'bg-white text-bark-500 border-cream-200'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-2xl shimmer" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🌿</div>
          <h3
            className="text-xl font-extrabold text-bark-500 mb-2"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            {filter === 'completed' ? 'No completed tasks yet' :
             filter === 'overdue' ? 'No overdue tasks! Great job 🎉' :
             filter === 'today' ? 'Nothing due today' :
             searchQuery ? 'No tasks match your search' :
             'No tasks yet'}
          </h3>
          <p className="text-bark-400 font-medium mb-5">
            {filter === 'all' && !searchQuery
              ? "Add your first task and start being productive!"
              : "Try adjusting your filters or search."}
          </p>
          {filter === 'all' && !searchQuery && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={18} /> Add First Task
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* Floating add button (mobile) */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-bark-500 hover:bg-bark-600 text-cream-50 rounded-full shadow-bark flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-10"
      >
        <Plus size={24} />
      </button>

      {showForm && <TaskFormModal onClose={() => setShowForm(false)} />}
    </div>
  );
}

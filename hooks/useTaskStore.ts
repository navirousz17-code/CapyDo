import { create } from 'zustand';
import { Task, Category, FilterType, SortType, TaskFormData } from '@/types';
import toast from 'react-hot-toast';

interface TaskStore {
  tasks: Task[];
  categories: Category[];
  loading: boolean;
  filter: FilterType;
  sortBy: SortType;
  selectedCategoryId: string | null;
  searchQuery: string;

  // Actions
  setFilter: (filter: FilterType) => void;
  setSortBy: (sort: SortType) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setSearchQuery: (q: string) => void;

  fetchTasks: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  createTask: (data: TaskFormData) => Promise<Task | null>;
  updateTask: (id: string, data: Partial<TaskFormData & { status: string }>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  toggleTask: (id: string, completed: boolean) => Promise<void>;

  createCategory: (data: { name: string; color: string; icon: string }) => Promise<Category | null>;

  getFilteredTasks: () => Task[];
  getStats: () => { total: number; completed: number; pending: number; overdue: number; completionRate: number };
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  categories: [],
  loading: false,
  filter: 'all',
  sortBy: 'created_at',
  selectedCategoryId: null,
  searchQuery: '',

  setFilter: (filter) => set({ filter }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  fetchTasks: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const tasks = await res.json();
      set({ tasks });
    } catch (err) {
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const categories = await res.json();
      set({ categories });
    } catch (err) {
      console.error(err);
    }
  },

  createTask: async (data) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create task');
      }
      const task = await res.json();
      set((s) => ({ tasks: [task, ...s.tasks] }));
      return task;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create task');
      return null;
    }
  },

  updateTask: async (id, data) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update task');
      const updated = await res.json();
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? updated : t)),       
      }));
      window.dispatchEvent(new CustomEvent('pet:task-complete'));
      return updated;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update task');
      return null;
    }
  },

  deleteTask: async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete task');
      return false;
    }
  },

  toggleTask: async (id, completed) => {
    const status = completed ? 'completed' : 'pending';
    // Optimistic update
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, status: status as Task['status'] } : t
      ),
    }));
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? updated : t)),
      }));
    } catch {
      // Revert
      get().fetchTasks();
      toast.error('Failed to update task');
    }
  },

  createCategory: async (data) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create category');
      const category = await res.json();
      set((s) => ({ categories: [...s.categories, category] }));
      return category;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create category');
      return null;
    }
  },

  getFilteredTasks: () => {
    const { tasks, filter, sortBy, selectedCategoryId, searchQuery } = get();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let filtered = tasks.filter((t) => t.status !== 'archived');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    if (selectedCategoryId) {
      filtered = filtered.filter((t) => t.category_id === selectedCategoryId);
    }

    switch (filter) {
      case 'pending':
        filtered = filtered.filter((t) => t.status === 'pending' || t.status === 'in_progress');
        break;
      case 'completed':
        filtered = filtered.filter((t) => t.status === 'completed');
        break;
      case 'today': {
        const today = now.toISOString().split('T')[0];
        filtered = filtered.filter((t) => t.due_date === today);
        break;
      }
      case 'overdue':
        filtered = filtered.filter((t) => {
          if (!t.due_date || t.status === 'completed') return false;
          return new Date(t.due_date) < now;
        });
        break;
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'due_date': {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        case 'priority': {
          const order = { urgent: 0, high: 1, medium: 2, low: 3 };
          return order[a.priority] - order[b.priority];
        }
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  },

  getStats: () => {
    const { tasks } = get();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const active = tasks.filter((t) => t.status !== 'archived');
    const total = active.length;
    const completed = active.filter((t) => t.status === 'completed').length;
    const pending = active.filter(
      (t) => t.status === 'pending' || t.status === 'in_progress'
    ).length;
    const overdue = active.filter((t) => {
      if (!t.due_date || t.status === 'completed') return false;
      return new Date(t.due_date) < now;
    }).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, overdue, completionRate };
  },
}));

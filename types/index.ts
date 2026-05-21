export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'archived';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  due_date: string | null;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface TaskFormData {
  title: string;
  description?: string;
  category_id?: string;
  priority: Priority;
  due_date?: string;
  status?: TaskStatus;
}

export interface CategoryFormData {
  name: string;
  color: string;
  icon: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

export type FilterType = 'all' | 'pending' | 'completed' | 'today' | 'overdue';
export type SortType = 'created_at' | 'due_date' | 'priority' | 'title';

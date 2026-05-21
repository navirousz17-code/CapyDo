export interface DailyActivity {
  id: string;
  user_id: string;
  title: string;
  icon: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // computed
  completed_today?: boolean;
  streak?: number;
}

export interface DailyActivityCompletion {
  id: string;
  activity_id: string;
  user_id: string;
  completed_date: string;
  completed_at: string;
}

export interface DailyActivityFormData {
  title: string;
  icon: string;
  color: string;
}

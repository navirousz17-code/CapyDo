'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTaskStore } from './useTaskStore';

export function useRealtime(userId: string | undefined) {
  const { fetchTasks, fetchCategories } = useTaskStore();

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();

    const taskChannel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` },
        () => { fetchTasks(); }
      )
      .subscribe();

    const catChannel = supabase
      .channel('categories-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${userId}` },
        () => { fetchCategories(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(taskChannel);
      supabase.removeChannel(catChannel);
    };
  }, [userId]);
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { Priority } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'MMM d, yyyy');
}

export function isOverdue(dateStr: string | null, status: string): boolean {
  if (!dateStr || status === 'completed') return false;
  const date = parseISO(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export function getPriorityConfig(priority: Priority) {
  const configs = {
    urgent: { label: 'Urgent', color: '#991b1b', bg: '#fee2e2', border: '#fca5a5', emoji: '🔴' },
    high:   { label: 'High',   color: '#92400e', bg: '#fef3c7', border: '#fcd34d', emoji: '🟠' },
    medium: { label: 'Medium', color: '#065f46', bg: '#d1fae5', border: '#6ee7b7', emoji: '🟢' },
    low:    { label: 'Low',    color: '#166534', bg: '#f0fdf4', border: '#bbf7d0', emoji: '⚪' },
  };
  return configs[priority] ?? configs.medium;
}

export function getPriorityClass(priority: Priority): string {
  return `priority-${priority}`;
}

export const CATEGORY_COLORS = [
  '#82bf7b', '#5aa352', '#c4965a', '#a67640',
  '#e5c04f', '#d9b98f', '#7d5a30', '#5c4022',
  '#60a5fa', '#818cf8', '#f472b6', '#fb923c',
];

export const CATEGORY_ICONS = [
  '📁', '🌿', '💼', '📚', '✨', '🛒', '🏃', '🎯',
  '💡', '🎨', '🏠', '❤️', '⭐', '🚀', '🎵', '🍀',
];

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '…';
}

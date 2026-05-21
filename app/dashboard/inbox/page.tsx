'use client';

import { useEffect, useState } from 'react';
import { Zap, AlertTriangle, Clock, CalendarCheck, CheckCircle2, ArrowRight, Inbox } from 'lucide-react';
import { useTaskStore } from '@/hooks/useTaskStore';
import { Task } from '@/types';
import { formatDueDate, isOverdue, getPriorityConfig, cn } from '@/utils';
import TaskCard from '@/components/tasks/TaskCard';
import TaskFormModal from '@/components/tasks/TaskFormModal';
import Link from 'next/link';

interface InboxSection {
  id: string;
  label: string;
  emoji: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  tasks: Task[];
}

export default function InboxPage() {
  const { tasks, loading, toggleTask } = useTaskStore();
  const [showForm, setShowForm] = useState(false);

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const todayStr = now.toISOString().split('T')[0];
  const tomorrowStr = new Date(now.getTime() + 86400000).toISOString().split('T')[0];

  const activeTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'archived');

  // 1. OVERDUE — past due date
  const overdue = activeTasks.filter((t) => t.due_date && new Date(t.due_date) < now);

  // 2. DUE TODAY
  const dueToday = activeTasks.filter((t) => t.due_date === todayStr);

  // 3. URGENT priority (not already overdue or today)
  const urgent = activeTasks.filter(
    (t) => t.priority === 'urgent' && t.due_date !== todayStr && !isOverdue(t.due_date, t.status)
  );

  // 4. HIGH priority due this week
  const thisWeekEnd = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0];
  const highThisWeek = activeTasks.filter(
    (t) =>
      t.priority === 'high' &&
      t.due_date &&
      t.due_date > todayStr &&
      t.due_date <= thisWeekEnd &&
      !overdue.includes(t) &&
      !dueToday.includes(t)
  );

  // 5. Due tomorrow
  const dueTomorrow = activeTasks.filter(
    (t) => t.due_date === tomorrowStr && !urgent.includes(t)
  );

  // 6. No due date urgent/high
  const noDueDateHighPriority = activeTasks.filter(
    (t) =>
      !t.due_date &&
      (t.priority === 'urgent' || t.priority === 'high') &&
      !urgent.includes(t)
  );

  const sections: InboxSection[] = [
    {
      id: 'overdue',
      label: 'Overdue',
      emoji: '🚨',
      description: 'These are past their due date — tackle them first!',
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      tasks: overdue,
    },
    {
      id: 'today',
      label: 'Due Today',
      emoji: '🔥',
      description: "Get these done before the day ends!",
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      tasks: dueToday,
    },
    {
      id: 'urgent',
      label: 'Urgent',
      emoji: '⚡',
      description: 'High-priority tasks that need your attention soon.',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      tasks: urgent,
    },
    {
      id: 'tomorrow',
      label: 'Due Tomorrow',
      emoji: '📅',
      description: "Prepare for tomorrow — don't let these sneak up on you!",
      color: 'text-bark-600',
      bg: 'bg-cream-100',
      border: 'border-cream-300',
      tasks: dueTomorrow,
    },
    {
      id: 'week',
      label: 'This Week',
      emoji: '📆',
      description: 'High priority tasks due within 7 days.',
      color: 'text-moss-600',
      bg: 'bg-moss-50',
      border: 'border-moss-200',
      tasks: highThisWeek,
    },
    {
      id: 'noDue',
      label: 'High Priority — No Deadline',
      emoji: '💡',
      description: "Important but no due date — schedule these soon!",
      color: 'text-bark-500',
      bg: 'bg-cream-50',
      border: 'border-cream-200',
      tasks: noDueDateHighPriority,
    },
  ].filter((s) => s.tasks.length > 0);

  const totalActionable = overdue.length + dueToday.length + urgent.length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
            Priority Inbox ⚡
          </h1>
          <p className="text-bark-400 text-sm font-medium mt-0.5">
            Smart view of what needs your attention right now
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          + Add Task
        </button>
      </div>

      {/* Summary banner */}
      {!loading && (
        <div className={cn(
          'card border-2 flex items-center gap-4',
          totalActionable > 0 ? 'bg-amber-50 border-amber-200' : 'bg-moss-50 border-moss-200'
        )}>
          <div className="text-4xl">{totalActionable > 0 ? '⚡' : '🎉'}</div>
          <div>
            {totalActionable > 0 ? (
              <>
                <p className="font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
                  {totalActionable} task{totalActionable !== 1 ? 's' : ''} need immediate attention
                </p>
                <p className="text-sm text-bark-400 font-medium">
                  {overdue.length > 0 && `${overdue.length} overdue · `}
                  {dueToday.length > 0 && `${dueToday.length} due today · `}
                  {urgent.length > 0 && `${urgent.length} urgent`}
                </p>
              </>
            ) : (
              <>
                <p className="font-extrabold text-moss-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
                  You're on top of everything! 🌿
                </p>
                <p className="text-sm text-bark-400 font-medium">No urgent or overdue tasks right now.</p>
              </>
            )}
          </div>
          {totalActionable > 0 && (
            <div className="ml-auto text-right">
              <p className="text-2xl font-extrabold text-amber-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
                {totalActionable}
              </p>
              <p className="text-xs text-bark-400 font-semibold">to handle</p>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl shimmer" />)}
        </div>
      )}

      {/* All clear */}
      {!loading && sections.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🌿</div>
          <h3 className="text-xl font-extrabold text-bark-500 mb-2" style={{ fontFamily: "'Baloo 2', cursive" }}>
            Inbox Zero!
          </h3>
          <p className="text-bark-400 font-medium mb-5">
            No urgent, overdue, or high-priority tasks. You're crushing it!
          </p>
          <Link href="/dashboard/tasks" className="btn-primary inline-flex items-center gap-2">
            View All Tasks <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Sections */}
      {!loading && sections.map((section) => (
        <div key={section.id} className={`card border-2 ${section.border}`}>
          {/* Section header */}
          <div className={`flex items-center gap-3 mb-4 p-3 rounded-xl ${section.bg}`}>
            <span className="text-2xl">{section.emoji}</span>
            <div>
              <h2 className={`font-extrabold ${section.color}`} style={{ fontFamily: "'Baloo 2', cursive" }}>
                {section.label}
                <span className="ml-2 text-sm bg-white/60 px-2 py-0.5 rounded-full">
                  {section.tasks.length}
                </span>
              </h2>
              <p className="text-xs text-bark-400 font-medium">{section.description}</p>
            </div>
          </div>

          {/* Tasks */}
          <div className="flex flex-col gap-2">
            {section.tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      ))}

      {showForm && <TaskFormModal onClose={() => setShowForm(false)} />}
    </div>
  );
}
'use client';

import { useRef } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { useTaskStore } from '@/hooks/useTaskStore';
import { useDailyStore } from '@/hooks/useDailyStore';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface Props {
  onClose: () => void;
}

export default function ShareCard({ onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { getStats } = useTaskStore();
  const { getStats: getDailyStats, activities } = useDailyStore();
  const stats = getStats();
  const dailyStats = getDailyStats();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Friend';
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const longestStreak = Math.max(...activities.map((a) => a.streak ?? 0), 0);

  const handleDownload = async () => {
    try {
      // Use html2canvas if available, otherwise just copy text
      toast.success('Screenshot the card to share! 📸');
    } catch {
      toast.error('Use screenshot to save the card');
    }
  };

  const handleShare = async () => {
    const text = `🌿 My TODEI-LIST Progress\n✅ ${stats.completed} tasks completed\n📊 ${stats.completionRate}% completion rate\n🔥 ${longestStreak} day streak\n\nJoin me at todei-list.app`;
    if (navigator.share) {
      await navigator.share({ title: 'My TODEI-LIST Progress', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Progress copied to clipboard! 📋');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bark-700/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm animate-bounce-in">
        {/* Close */}
        <button onClick={onClose} className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-bark text-bark-400 hover:text-bark-600">
          <X size={16} />
        </button>

        {/* The shareable card */}
        <div
          ref={cardRef}
          className="bg-gradient-to-br from-parchment to-cream-200 rounded-3xl p-6 border-2 border-cream-300 shadow-2xl"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-bark-400 text-xs font-semibold">{today}</p>
              <h2 className="text-xl font-extrabold text-bark-600">
                {displayName}'s Progress
              </h2>
            </div>
            <div className="text-3xl">🌿</div>
          </div>

          {/* Big stat */}
          <div className="bg-white/70 rounded-2xl p-4 text-center mb-4 border border-cream-300">
            <div className="text-6xl font-extrabold text-bark-600 leading-none">{stats.completionRate}%</div>
            <div className="text-bark-400 text-sm font-semibold mt-1">Completion Rate</div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { value: stats.completed, label: 'Done', emoji: '✅' },
              { value: stats.pending, label: 'Pending', emoji: '⏳' },
              { value: longestStreak, label: 'Streak', emoji: '🔥' },
            ].map((s) => (
              <div key={s.label} className="bg-white/60 rounded-xl p-2.5 text-center border border-cream-200">
                <div className="text-lg">{s.emoji}</div>
                <div className="text-xl font-extrabold text-bark-600">{s.value}</div>
                <div className="text-xs text-bark-400 font-semibold">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Habits */}
          {dailyStats.total > 0 && (
            <div className="bg-moss-100/70 rounded-xl p-3 border border-moss-200 mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-moss-600">Daily Habits</span>
                <span className="text-xs font-extrabold text-moss-600">{dailyStats.completedToday}/{dailyStats.total}</span>
              </div>
              <div className="h-2 bg-moss-200 rounded-full overflow-hidden">
                <div className="h-full bg-moss-400 rounded-full" style={{ width: `${dailyStats.completionRate}%` }} />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-bark-400 font-semibold">TODEI-LIST 🌿</div>
            <div className="text-xs text-bark-400 font-medium">todei-list.app</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <button onClick={handleDownload} className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
            <Download size={16} /> Screenshot
          </button>
          <button onClick={handleShare} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
            <Share2 size={16} /> Share
          </button>
        </div>
        <p className="text-center text-xs text-bark-400 font-medium mt-2">
          Tip: Screenshot the card above to save it! 📸
        </p>
      </div>
    </div>
  );
}
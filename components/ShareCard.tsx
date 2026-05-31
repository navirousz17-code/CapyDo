'use client';

import { useRef, useState } from 'react';
import { Download, Share2, X, Camera } from 'lucide-react';
import Image from 'next/image';
import { useTaskStore } from '@/hooks/useTaskStore';
import { useDailyStore } from '@/hooks/useDailyStore';
import { useAuth } from '@/hooks/useAuth';
import { usePetStore, getStageForXp } from '@/hooks/usePetStore';
import toast from 'react-hot-toast';

interface Props {
  onClose: () => void;
}

export default function ShareCard({ onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);
  const { user } = useAuth();
  const { getStats } = useTaskStore();
  const { getStats: getDailyStats, activities } = useDailyStore();
  const { xp } = usePetStore();

  const stats = getStats();
  const dailyStats = getDailyStats();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Friend';
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const longestStreak = Math.max(...activities.map((a) => a.streak ?? 0), 0);
  const petStage = getStageForXp(xp);

  const handleScreenshot = async () => {
    setCapturing(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      if (!cardRef.current) return;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `todei-progress-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Progress card saved! 🎉');
    } catch {
      toast.error('Screenshot failed — try your device screenshot instead!');
    } finally {
      setCapturing(false);
    }
  };

  const handleShare = async () => {
    const text = `🌿 My TODEI-LIST Progress\n✅ ${stats.completed} tasks completed\n📊 ${stats.completionRate}% completion rate\n🔥 ${longestStreak} day streak\n\nJoin me at todei-list.app`;
    if (navigator.share) {
      await navigator.share({ title: 'My TODEI-LIST Progress', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Progress copied to clipboard!');
    }
  };

  const completionBarWidth = `${Math.min(stats.completionRate, 100)}%`;
  const habitBarWidth = `${Math.min(dailyStats.completionRate, 100)}%`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bark-700/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm animate-bounce-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-20 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg text-bark-400 hover:text-bark-600 transition-colors"
        >
          <X size={16} />
        </button>

        {/* ── THE CARD (screenshottable) ── */}
        <div
          ref={cardRef}
          style={{
            background: 'linear-gradient(145deg, #fefdf0 0%, #f5f0dc 50%, #eef7e8 100%)',
            borderRadius: 28,
            border: '2px solid #e8dfc0',
            padding: 24,
            fontFamily: "'Baloo 2', cursive",
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decoration */}
          <div style={{
            position: 'absolute', top: -30, right: -30,
            width: 120, height: 120,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(130,191,122,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -20, left: -20,
            width: 100, height: 100,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(253,220,150,0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <p style={{ color: '#a67640', fontSize: 11, fontWeight: 600, margin: 0 }}>{today}</p>
              <h2 style={{ color: '#5c4022', fontSize: 18, fontWeight: 900, margin: '2px 0 0' }}>
                {displayName}'s Progress
              </h2>
            </div>
            <Image src="/icon-leaf-footer.png" alt="leaf" width={32} height={32} style={{ objectFit: 'contain' }} />
          </div>

          {/* Pet + Completion Rate side by side */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            {/* Pet */}
            <div style={{
              background: 'rgba(255,255,255,0.7)',
              borderRadius: 20,
              border: '1.5px solid #e8dfc0',
              padding: '12px 10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 90,
              gap: 4,
            }}>
              <Image
                src={petStage.image}
                alt={petStage.name}
                width={64}
                height={64}
                style={{ objectFit: 'contain' }}
              />
              <p style={{ color: '#5c4022', fontSize: 9, fontWeight: 800, margin: 0, textAlign: 'center', lineHeight: 1.2 }}>
                {petStage.name}
              </p>
              <p style={{ color: '#a67640', fontSize: 8, fontWeight: 600, margin: 0 }}>{xp} XP</p>
            </div>

            {/* Completion rate */}
            <div style={{
              flex: 1,
              background: 'rgba(255,255,255,0.7)',
              borderRadius: 20,
              border: '1.5px solid #e8dfc0',
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {/* Ring */}
              <div style={{ position: 'relative', width: 72, height: 72, marginBottom: 6 }}>
                <svg viewBox="0 0 72 72" style={{ width: 72, height: 72, transform: 'rotate(-90deg)' }}>
                  <circle cx="36" cy="36" r="28" fill="none" stroke="#faf2d3" strokeWidth="8" />
                  <circle
                    cx="36" cy="36" r="28"
                    fill="none"
                    stroke="#5aa352"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - stats.completionRate / 100)}`}
                  />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: '#5c4022', fontSize: 16, fontWeight: 900 }}>{stats.completionRate}%</span>
                </div>
              </div>
              <p style={{ color: '#a67640', fontSize: 10, fontWeight: 700, margin: 0 }}>Completion Rate</p>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
            {[
              { value: stats.completed, label: 'Done',    icon: '/icon-check.png'    },
              { value: stats.pending,   label: 'Pending', icon: '/icon-stopwatch.png' },
              { value: longestStreak,   label: 'Streak',  icon: '/icon-priority.png'  },
            ].map((s) => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.65)',
                borderRadius: 16,
                border: '1.5px solid #e8dfc0',
                padding: '10px 6px',
                textAlign: 'center',
              }}>
                <Image src={s.icon} alt={s.label} width={24} height={24} style={{ objectFit: 'contain', marginBottom: 2 }} />
                <div style={{ color: '#5c4022', fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: '#a67640', fontSize: 9, fontWeight: 700, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Habits bar */}
          {dailyStats.total > 0 && (
            <div style={{
              background: 'rgba(130,191,122,0.15)',
              borderRadius: 14,
              border: '1.5px solid rgba(130,191,122,0.3)',
              padding: '10px 12px',
              marginBottom: 14,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#2c5f28', fontSize: 10, fontWeight: 800 }}>Daily Habits</span>
                <span style={{ color: '#2c5f28', fontSize: 10, fontWeight: 900 }}>
                  {dailyStats.completedToday}/{dailyStats.total}
                </span>
              </div>
              <div style={{ height: 6, background: 'rgba(130,191,122,0.3)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: habitBarWidth, background: '#5aa352', borderRadius: 99 }} />
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Image src="/icon-leaf-footer.png" alt="" width={12} height={12} style={{ objectFit: 'contain' }} />
              <span style={{ color: '#a67640', fontSize: 10, fontWeight: 700 }}>TODEI-LIST</span>
            </div>
            <span style={{ color: '#c4965a', fontSize: 10, fontWeight: 600 }}>todei-list.app</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleScreenshot}
            disabled={capturing}
            className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
          >
            {capturing
              ? <span className="w-4 h-4 border-2 border-bark-400 border-t-transparent rounded-full animate-spin" />
              : <Camera size={16} />
            }
            {capturing ? 'Saving...' : 'Download'}
          </button>
          <button
            onClick={handleShare}
            className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
          >
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>
    </div>
  );
}
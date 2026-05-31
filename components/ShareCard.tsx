'use client';

import { useRef, useState } from 'react';
import { Share2, X, Camera } from 'lucide-react';
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

  // Use absolute URLs for html2canvas
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const handleScreenshot = async () => {
    setCapturing(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      if (!cardRef.current) return;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#fefdf0',
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 15000,
        onclone: (doc) => {
          // Make all images visible in clone
          doc.querySelectorAll('img').forEach((img) => {
            img.style.display = 'block';
            img.style.visibility = 'visible';
            img.style.opacity = '1';
          });
        },
      });
      const link = document.createElement('a');
      link.download = `todei-progress-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Progress card saved! 🎉');
    } catch {
      toast.error('Try your device screenshot instead!');
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

  const circumference = 2 * Math.PI * 40;
  const progressOffset = circumference * (1 - stats.completionRate / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-bark-700/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md animate-bounce-in my-4">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-20 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg text-bark-400 hover:text-bark-600 transition-colors"
        >
          <X size={16} />
        </button>

        {/* ── CARD ── */}
        <div
          ref={cardRef}
          style={{
            background: 'linear-gradient(160deg, #fefdf0 0%, #f7f0dc 40%, #eef7e8 100%)',
            borderRadius: 32,
            border: '2px solid #e0d5b0',
            padding: 28,
            fontFamily: "'Baloo 2', cursive",
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative blobs */}
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 160, height: 160,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(130,191,122,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -30, left: -30, width: 130, height: 130,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(253,220,150,0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '40%', left: -20, width: 80, height: 80,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200,170,120,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <p style={{ color: '#b07840', fontSize: 12, fontWeight: 600, margin: 0, letterSpacing: '0.02em' }}>{today}</p>
              <h2 style={{ color: '#4a3018', fontSize: 22, fontWeight: 900, margin: '3px 0 0', letterSpacing: '-0.02em' }}>
                {displayName}'s Progress
              </h2>
            </div>
            {/* Use plain img for html2canvas */}
            <img src={`${origin}/icon-leaf-footer.png`} alt="" width={36} height={36}
              style={{ objectFit: 'contain', display: 'block' }} />
          </div>

          {/* Pet + Ring row */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
            {/* Pet card */}
            <div style={{
              background: 'rgba(255,255,255,0.75)',
              borderRadius: 22,
              border: '1.5px solid #e0d5b0',
              padding: '16px 14px 12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              minWidth: 110, gap: 6,
              boxShadow: '0 4px 20px rgba(100,70,20,0.08)',
            }}>
              <img
                src={`${origin}${petStage.image}`}
                alt={petStage.name}
                width={80} height={80}
                style={{ objectFit: 'contain', display: 'block' }}
              />
              <p style={{ color: '#4a3018', fontSize: 11, fontWeight: 900, margin: 0, textAlign: 'center', lineHeight: 1.3 }}>
                {petStage.name}
              </p>
              <div style={{
                background: 'linear-gradient(90deg, #f5a623, #e8891a)',
                borderRadius: 99, padding: '2px 10px',
              }}>
                <p style={{ color: 'white', fontSize: 9, fontWeight: 800, margin: 0 }}>{xp} XP</p>
              </div>
            </div>

            {/* Completion ring card */}
            <div style={{
              flex: 1,
              background: 'rgba(255,255,255,0.75)',
              borderRadius: 22,
              border: '1.5px solid #e0d5b0',
              padding: 16,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(100,70,20,0.08)',
            }}>
              <div style={{ position: 'relative', width: 90, height: 90, marginBottom: 8 }}>
                <svg viewBox="0 0 100 100" style={{ width: 90, height: 90, transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f0e8cc" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#5aa352" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={`${progressOffset}`} />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ color: '#4a3018', fontSize: 20, fontWeight: 900, lineHeight: 1 }}>
                    {stats.completionRate}%
                  </span>
                </div>
              </div>
              <p style={{ color: '#b07840', fontSize: 11, fontWeight: 700, margin: 0 }}>Completion Rate</p>
              <p style={{ color: '#8a9a70', fontSize: 10, fontWeight: 600, margin: '3px 0 0' }}>
                {stats.completed}/{stats.completed + stats.pending} tasks
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              { value: stats.completed, label: 'Done',    icon: '/icon-check.png',     bg: 'rgba(90,163,82,0.1)',  border: 'rgba(90,163,82,0.25)'  },
              { value: stats.pending,   label: 'Pending', icon: '/icon-today.png',     bg: 'rgba(100,130,200,0.1)',border: 'rgba(100,130,200,0.25)' },
              { value: longestStreak,   label: 'Streak',  icon: '/icon-hype.png',      bg: 'rgba(240,130,40,0.1)', border: 'rgba(240,130,40,0.25)'  },
            ].map((s) => (
              <div key={s.label} style={{
                background: s.bg,
                borderRadius: 18,
                border: `1.5px solid ${s.border}`,
                padding: '12px 8px 10px',
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(100,70,20,0.05)',
              }}>
                <img src={`${origin}${s.icon}`} alt={s.label} width={28} height={28}
                  style={{ objectFit: 'contain', display: 'block', margin: '0 auto 4px' }} />
                <div style={{ color: '#4a3018', fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: '#b07840', fontSize: 10, fontWeight: 700, marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Habits bar */}
          {dailyStats.total > 0 && (
            <div style={{
              background: 'rgba(130,191,122,0.12)',
              borderRadius: 16,
              border: '1.5px solid rgba(130,191,122,0.3)',
              padding: '12px 14px',
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <img src={`${origin}/icon-sync.png`} alt="" width={16} height={16}
                    style={{ objectFit: 'contain', display: 'block' }} />
                  <span style={{ color: '#2c5f28', fontSize: 11, fontWeight: 800 }}>Daily Habits</span>
                </div>
                <span style={{ color: '#2c5f28', fontSize: 11, fontWeight: 900 }}>
                  {dailyStats.completedToday}/{dailyStats.total}
                </span>
              </div>
              <div style={{ height: 8, background: 'rgba(130,191,122,0.25)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(dailyStats.completionRate, 100)}%`,
                  background: 'linear-gradient(90deg, #5aa352, #82c97a)',
                  borderRadius: 99,
                }} />
              </div>
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #e0d5b0, transparent)', marginBottom: 14 }} />

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <img src={`${origin}/icon-leaf-footer.png`} alt="" width={14} height={14}
                style={{ objectFit: 'contain', display: 'block' }} />
              <span style={{ color: '#b07840', fontSize: 11, fontWeight: 800, letterSpacing: '0.05em' }}>TODEI-LIST</span>
            </div>
            <span style={{ color: '#c4a060', fontSize: 10, fontWeight: 600 }}>todei-list.app</span>
          </div>
        </div>

        {/* Buttons */}
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
          <button onClick={handleShare} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
            <Share2 size={16} /> Share
          </button>
        </div>
        <p className="text-center text-xs text-bark-400 font-medium mt-2">
          Download saves a high-quality PNG to your device
        </p>
      </div>
    </div>
  );
}
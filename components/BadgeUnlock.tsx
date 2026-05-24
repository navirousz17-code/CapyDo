'use client';

import { useState, useEffect } from 'react';
import { BADGE_DEFINITIONS, BadgeDef } from '@/lib/badges';
import AchievementAnimation from '@/components/AchievementAnimation';

const listeners: ((badgeId: string) => void)[] = [];

export function awardBadge(badgeId: string) {
  listeners.forEach((fn) => fn(badgeId));
}

export default function BadgeUnlock() {
  const [queue, setQueue] = useState<BadgeDef[]>([]);
  const [current, setCurrent] = useState<BadgeDef | null>(null);

  useEffect(() => {
    const handler = async (badgeId: string) => {
      try {
        const res = await fetch('/api/badges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ badge_id: badgeId }),
        });
        const data = await res.json();
        if (data.newly_earned) {
          const badge = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
          if (badge) setQueue((q) => [...q, badge]);
        }
      } catch {}
    };
    listeners.push(handler);
    return () => {
      const i = listeners.indexOf(handler);
      if (i > -1) listeners.splice(i, 1);
    };
  }, []);

  useEffect(() => {
    if (queue.length > 0 && !current) {
      const next = queue[0];
      setQueue((q) => q.slice(1));
      setCurrent(next);
    }
  }, [queue, current]);

  if (!current) return null;

  return (
    <AchievementAnimation
      type="badge"
      title={current.name}
      subtitle={current.description}
      image={current.image}
      onDismiss={() => setCurrent(null)}
    />
  );
}
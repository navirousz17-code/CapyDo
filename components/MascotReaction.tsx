'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

export type ReactionType = 'happy' | 'celebrate' | 'encourage' | 'sad' | 'streak' | 'morning';

interface Reaction {
  type: ReactionType;
  message: string;
  image: string;
}

const REACTIONS: Record<ReactionType, { image: string; messages: string[] }> = {
  happy: {
    image: '/reaction_happy.png',
    messages: [
      'Ayos! Task done! 👍👍',
      'Sige lang! Keep it up! ✅',
      'Yes! Isa pang tapos! 🌿',
      'Grabe ka! Productive ka ngayon ah! 💪',
      'Idol! Tuloy lang! ⭐',
    ],
  },
  celebrate: {
    image: '/reaction_celebrate.png',
    messages: [
      'LAHAT TAPOS NA! GRABE KA! 🎉🎉🎉',
      'PERFECT DAY! Idol ka talaga! 🏆',
      'ALL DONE! Pwede ka na mag-Netflix! 😂✨',
      'SLAY! Lahat ng tasks done! 🔥🔥🔥',
      'NAKAKA-PROUD! Ganyan talaga! 🎊',
    ],
  },
  encourage: {
    image: '/reaction_encourage.png',
    messages: [
      'Kaya mo yan! Ikaw pa! 💪',
      'Go go go! Konti na lang! ⚡',
      'Huy! You got this bestie! 🌿',
      'Sige pa! Almost there! ✨',
      'Ikaw na! Walang pwedeng pumigil sayo! 🔥',
    ],
  },
  sad: {
    image: '/reaction_sad.png',
    messages: [
      'Ay nako! May overdue ka na! 😱',
      'Huy! Yung tasks mo! Hindi pa tapos! ⚠️',
      'Grabe ka naman! Overdue na yan! 😤',
      'Uy! Paki-check yung tasks mo please! 🙏',
      'Sus! Kalimot ka talaga! Tingnan mo tasks mo! 😅',
    ],
  },
  streak: {
    image: '/reaction_streak.png',
    messages: [
      'STREAK! Consistent ka talaga! 🔥🔥',
      'Grabe! Hindi ka tumitigil! 🔥',
      'FIRE! Streak achieved! Ang galing! ⚡🔥',
      'Consistent queen/king! Streak goes brrr! 🏆🔥',
      'Hindi ka talaga mapigilan! STREAK! 🌿🔥',
    ],
  },
  morning: {
    image: '/reaction_morning.png',
    messages: [
      'Magandang umaga! Handa ka na ba? ☀️',
      'Good morning! Let\'s crush it today! 🌿',
      'Rise and grind bestie! 💪☀️',
      'Bagong araw, bagong tsansa! Go! ✨',
      'Kumain ka na ba? Tapos mag-task ka na! 😄',
    ],
  },
};

interface MascotReactionProps {
  trigger?: ReactionType | null;
  onDone?: () => void;
}

// Global event system for triggering reactions from anywhere
const listeners: ((type: ReactionType) => void)[] = [];

export function triggerReaction(type: ReactionType) {
  listeners.forEach((fn) => fn(type));
}

export default function MascotReaction({ trigger, onDone }: MascotReactionProps) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<Reaction | null>(null);
  const [animating, setAnimating] = useState(false);
  const [hasShownMorning, setHasShownMorning] = useState(false);

  const showReaction = useCallback((type: ReactionType) => {
    const data = REACTIONS[type];
    const message = data.messages[Math.floor(Math.random() * data.messages.length)];
    setCurrent({ type, message, image: data.image });
    setVisible(true);
    setAnimating(true);

    // Auto hide after 4 seconds
    setTimeout(() => {
      setAnimating(false);
      setTimeout(() => {
        setVisible(false);
        setCurrent(null);
        onDone?.();
      }, 500);
    }, 4000);
  }, [onDone]);

  // Register global listener
  useEffect(() => {
    const handler = (type: ReactionType) => showReaction(type);
    listeners.push(handler);
    return () => {
      const idx = listeners.indexOf(handler);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, [showReaction]);

  // Handle external trigger prop
  useEffect(() => {
    if (trigger) showReaction(trigger);
  }, [trigger]);

  // Morning greeting on first visit of the day
  useEffect(() => {
    const lastMorning = localStorage.getItem('todei-morning');
    const today = new Date().toISOString().split('T')[0];
    if (lastMorning !== today && !hasShownMorning) {
      setHasShownMorning(true);
      localStorage.setItem('todei-morning', today);
      setTimeout(() => showReaction('morning'), 2000);
    }
  }, []);

  if (!visible || !current) return null;

  return (
    <>
      <style>{`
        @keyframes mascot-slide-up {
          0% { transform: translateY(120px) scale(0.8); opacity: 0; }
          60% { transform: translateY(-10px) scale(1.05); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes mascot-slide-down {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(120px) scale(0.8); opacity: 0; }
        }
        @keyframes mascot-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes bubble-pop-up {
          0% { transform: scale(0) translateY(10px); opacity: 0; }
          70% { transform: scale(1.08) translateY(-3px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .mascot-in { animation: mascot-slide-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .mascot-out { animation: mascot-slide-down 0.5s ease-in forwards; }
        .mascot-bounce { animation: mascot-bounce 1s ease-in-out infinite; }
        .bubble-pop-up { animation: bubble-pop-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both; }
      `}</style>

      <div
        className="fixed bottom-6 left-1/2 z-50 flex flex-col items-center pointer-events-none"
        style={{ transform: 'translateX(-50%)' }}
      >
        {/* Message bubble */}
        <div
          className="bubble-pop-up mb-3 bg-white rounded-2xl px-5 py-3 shadow-2xl border-2 text-center"
          style={{
            borderColor: '#d9b98f',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: '15px',
            color: '#5c4022',
            maxWidth: '280px',
            boxShadow: '0 8px 32px rgba(125, 90, 48, 0.2)',
            position: 'relative',
          }}
        >
          {current.message}
          {/* Triangle */}
          <div style={{
            position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '10px solid transparent', borderRight: '10px solid transparent',
            borderTop: '10px solid #d9b98f',
          }} />
          <div style={{
            position: 'absolute', bottom: '-7px', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
            borderTop: '8px solid white',
          }} />
        </div>

        {/* Mascot image */}
        <div className={animating ? 'mascot-in mascot-bounce' : 'mascot-out'}>
          <Image
            src={current.image}
            alt="Mascot reaction"
            width={180}
            height={180}
            className="drop-shadow-2xl"
            style={{ imageRendering: 'crisp-edges' }}
          />
        </div>
      </div>
    </>
  );
}
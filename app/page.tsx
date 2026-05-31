'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

const FLOAT_ASSETS = [
  '/float-star.png',
  '/float-star-orange.png',
  '/float-leaf.png',
  '/float-clover.png',
  '/float-sparkle.png',
  '/float-star-pink.png',
  '/float-leaf-green.png',
  '/float-leaf-teal.png',
];

export default function LandingPage() {
  const [particles, setParticles] = useState<
    { id: number; src: string; left: string; duration: string; delay: string; size: number }[]
  >([]);

  useEffect(() => {
    const generated = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      src: FLOAT_ASSETS[i % FLOAT_ASSETS.length],
      left: `${Math.random() * 100}%`,
      duration: `${8 + Math.random() * 8}s`,
      delay: `${Math.random() * 10}s`,
      size: 24 + Math.random() * 20,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="min-h-screen parchment-bg overflow-hidden relative">
      {/* Floating particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="leaf-particle select-none"
          style={{
            left: p.left,
            animationDuration: p.duration,
            animationDelay: p.delay,
            position: 'fixed',
            display: 'inline-block',
          }}
        >
          <Image src={p.src} alt="" width={p.size} height={p.size} className="object-contain" />
        </span>
      ))}

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-moss-200 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cream-400 rounded-full opacity-20 blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="TODEI-LIST" width={44} height={44} className="rounded-xl" />
          <span className="text-xl font-bold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>
            TODEI-LIST
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="btn-ghost text-sm">Sign In</Link>
          <Link href="/auth/signup" className="btn-primary text-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center text-center px-6 pt-8 pb-20 max-w-4xl mx-auto">
        {/* Splash logo */}
        <div className="relative mb-6 animate-bounce-in">
          <div className="absolute inset-0 bg-moss-200 rounded-full blur-3xl opacity-30 scale-110" />
          <Image
            src="/splashlogo.png"
            alt="TODEI-LIST mascot"
            width={360}
            height={280}
            className="relative z-10 drop-shadow-2xl"
            priority
          />
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="inline-flex items-center gap-2 bg-cream-200 border border-cream-300 text-bark-500 text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
            <Image src="/float-sparkle.png" alt="" width={14} height={14} className="object-contain" />
            Your cozy productivity companion
          </div>

          <h1
            className="text-5xl md:text-6xl font-extrabold text-bark-600 leading-tight mb-5 text-shadow-bark"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Organize your day,{' '}
            <span className="text-moss-500 relative">
              your way
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 8 Q50 2 100 8 Q150 14 198 8" stroke="#82bf7b" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-bark-400 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            A warm and friendly task manager that keeps your goals in sight and your stress in check.
            Built for real humans who just want to get things done.{' '}
            <Image src="/float-leaf-green.png" alt="" width={20} height={20} className="object-contain inline-block align-middle" />
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/signup" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
              <CheckCircle2 size={18} />
              Start Organizing Free
            </Link>
            <Link href="/auth/login" className="btn-secondary text-base px-8 py-3">
              I have an account
            </Link>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-14 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          {[
            { icon: '/icon-sync.png',     label: 'Real-time sync'    },
            { icon: '/icon-category.png', label: 'Smart categories'  },
            { icon: '/icon-calendar.png', label: 'Due date tracking' },
            { icon: '/icon-priority.png', label: 'Priority levels'   },
            { icon: '/icon-secure.png',   label: 'Secure & private'  },
          ].map((feat) => (
            <div
              key={feat.label}
              className="flex items-center gap-2 bg-white/80 backdrop-blur border border-cream-200 rounded-full px-4 py-2 text-sm font-semibold text-bark-500 shadow-soft card-lift"
            >
              <Image src={feat.icon} alt={feat.label} width={20} height={20} className="object-contain" />
              {feat.label}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-16 w-full max-w-sm">
          {[
            { value: '100%', label: 'Free to use' },
            { value: '∞',    label: 'Tasks'       },
            { value: '24/7', label: 'Sync'        },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-extrabold text-bark-500" style={{ fontFamily: "'Baloo 2', cursive" }}>
                {stat.value}
              </div>
              <div className="text-xs text-bark-400 font-semibold mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-6 text-bark-400 text-sm font-medium flex items-center justify-center gap-1.5">
        Made with
        <Image src="/icon-leaf-footer.png" alt="leaf" width={16} height={16} className="object-contain inline-block" />
        by TODEI-LIST
      </footer>
    </div>
  );
}
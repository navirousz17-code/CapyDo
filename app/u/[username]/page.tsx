'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, TrendingUp, RefreshCw, Lock } from 'lucide-react';

interface PublicProfile {
  profile: {
    full_name: string | null;
    username: string;
    bio: string | null;
    avatar_url: string | null;
    created_at: string;
  };
  stats: {
    total: number;
    completed: number;
    completionRate: number;
    habitCount: number;
  };
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/profile/${username}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [username]);

  if (loading) return (
    <div className="min-h-screen parchment-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Image src="/logo.png" alt="TODEI-LIST" width={60} height={60} className="rounded-xl animate-float" />
        <div className="flex gap-1">
          {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-bark-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
        </div>
      </div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen parchment-bg flex flex-col items-center justify-center text-center px-6">
      <Lock size={48} className="text-bark-300 mb-4" />
      <h1 className="text-2xl font-extrabold text-bark-600 mb-2" style={{ fontFamily: "'Baloo 2', cursive" }}>
        Profile not found
      </h1>
      <p className="text-bark-400 font-medium mb-6">This profile doesn't exist or isn't public.</p>
      <Link href="/" className="btn-primary">Go Home</Link>
    </div>
  );

  const { profile, stats } = data!;
  const displayName = profile.full_name || `@${profile.username}`;
  const joinedYear = new Date(profile.created_at).getFullYear();

  return (
    <div className="min-h-screen parchment-bg flex flex-col items-center py-12 px-6">
      {/* Nav */}
      <div className="w-full max-w-lg mb-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="TODEI-LIST" width={36} height={36} className="rounded-lg" />
          <span className="font-extrabold text-bark-600" style={{ fontFamily: "'Baloo 2', cursive" }}>TODEI-LIST</span>
        </Link>
        <Link href="/auth/signup" className="btn-primary text-sm">Join Free</Link>
      </div>

      {/* Profile card */}
      <div className="w-full max-w-lg">
        <div className="card text-center mb-4 animate-bounce-in">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-moss-300 to-moss-400 flex items-center justify-center text-white text-3xl font-bold shadow-bark mx-auto mb-4">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-extrabold text-bark-600 mb-1" style={{ fontFamily: "'Baloo 2', cursive" }}>
            {displayName}
          </h1>
          <p className="text-bark-400 text-sm font-semibold mb-1">@{profile.username}</p>
          <p className="text-bark-400 text-xs font-medium mb-4">Member since {joinedYear}</p>
          {profile.bio && (
            <p className="text-bark-500 font-medium text-sm bg-cream-50 rounded-xl px-4 py-3 border border-cream-200">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="card text-center card-lift bg-moss-50 border-moss-200">
            <div className="text-3xl font-extrabold text-moss-600 mb-1" style={{ fontFamily: "'Baloo 2', cursive" }}>
              {stats.completed}
            </div>
            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-bark-400">
              <CheckCircle2 size={12} /> Tasks Completed
            </div>
          </div>
          <div className="card text-center card-lift bg-cream-100 border-cream-300">
            <div className="text-3xl font-extrabold text-bark-600 mb-1" style={{ fontFamily: "'Baloo 2', cursive" }}>
              {stats.completionRate}%
            </div>
            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-bark-400">
              <TrendingUp size={12} /> Completion Rate
            </div>
          </div>
          <div className="card text-center card-lift bg-amber-50 border-amber-100 col-span-2">
            <div className="text-3xl font-extrabold text-amber-600 mb-1" style={{ fontFamily: "'Baloo 2', cursive" }}>
              {stats.habitCount}
            </div>
            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-bark-400">
              <RefreshCw size={12} /> Daily Habits Tracked
            </div>
          </div>
        </div>

        {/* Progress ring */}
        <div className="card flex items-center gap-6 animate-slide-up">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#faf2d3" strokeWidth="12" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke="#5aa352" strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.completionRate / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-extrabold text-bark-600">{stats.completionRate}%</span>
            </div>
          </div>
          <div>
            <p className="font-extrabold text-bark-600 mb-1" style={{ fontFamily: "'Baloo 2', cursive" }}>
              Overall Progress
            </p>
            <p className="text-sm text-bark-400 font-medium">
              {stats.completed} of {stats.total} tasks completed
            </p>
            <p className="text-xs text-bark-400 font-medium mt-0.5">
              Tracking {stats.habitCount} daily habit{stats.habitCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="card text-center mt-4 bg-gradient-to-br from-moss-50 to-cream-100 border-moss-200">
          <p className="font-bold text-bark-500 mb-3 text-sm">Want to track your own productivity?</p>
          <Link href="/auth/signup" className="btn-primary inline-flex items-center gap-2">
            🌿 Join TODEI-LIST Free
          </Link>
        </div>
      </div>
    </div>
  );
}
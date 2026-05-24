'use client';
// app/dashboard/social/page.tsx

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, UserX, Loader2, X, Check } from 'lucide-react';
import { useFriendStore, Profile } from '@/hooks/useFriendStore';
import { useAuth } from '@/hooks/useAuth';
import { useTaskStore } from '@/hooks/useTaskStore';

type Tab = 'friends' | 'leaderboard' | 'activity';

function Avatar({ profile, size = 40 }: { profile: Profile; size?: number }) {
  if (!profile) return (
    <div className="rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, background: 'linear-gradient(135deg, var(--success), var(--accent))' }}>
      ?
    </div>
  );
  const initial = (profile.full_name || profile.username || '?')[0].toUpperCase();
  return profile.avatar_url ? (
    <Image src={profile.avatar_url} alt={initial} width={size} height={size}
      className="rounded-xl object-cover flex-shrink-0"
      style={{ width: size, height: size }} />
  ) : (
    <div className="rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, background: 'linear-gradient(135deg, var(--success), var(--accent))', fontSize: size * 0.4 }}>
      {initial}
    </div>
  );
}

const ACTIVITY_EMOJIS: Record<string, string> = {
  task_completed: '✅',
  badge_earned: '🏆',
  streak: '🔥',
  challenge_completed: '🎯',
  level_up: '⚡',
};

export default function SocialPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { getStats } = useTaskStore();
  const {
    friendships, activity, searchResults, loading, searchLoading,
    setCurrentUserId, fetchFriends, fetchActivity, searchUsers,
    sendRequest, respondToRequest, removeFriend, clearSearch,
    getFriends, getPendingIncoming, getPendingOutgoing, getFriendshipWith,
  } = useFriendStore();

  const [tab, setTab] = useState<Tab>('friends');
  const [searchQ, setSearchQ] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const stats = getStats();

  useEffect(() => {
    if (user) {
      setCurrentUserId(user.id);
      fetchFriends();
      fetchActivity();
    }
  }, [user]);

  const handleSearch = (q: string) => {
    setSearchQ(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchUsers(q), 400);
  };

  const friends = getFriends();
  const incoming = getPendingIncoming();
  const outgoing = getPendingOutgoing();

  const leaderboardUsers = [
    {
      profile: {
        id: user?.id ?? '',
        username: user?.user_metadata?.username ?? null,
        full_name: user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'You',
        avatar_url: null,
      },
      xp: stats.completed * 20,
      tasks: stats.completed,
      isYou: true,
    },
    ...friends.map((f) => ({
      profile: f,
      xp: Math.floor(Math.random() * 500),
      tasks: Math.floor(Math.random() * 30),
      isYou: false,
    })),
  ].sort((a, b) => b.xp - a.xp);

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
          Social 👥
        </h1>
        <p className="font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Connect with friends, compete on the leaderboard, see activity.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-strong)' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQ}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search users by name or username..."
            className="flex-1 bg-transparent outline-none text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          />
          {searchQ && (
            <button onClick={() => { setSearchQ(''); clearSearch(); }} style={{ color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {(searchResults.length > 0 || searchLoading) && searchQ.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-20 shadow-xl"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {searchLoading ? (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 size={16} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Searching...</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-4 text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No users found</div>
            ) : (
              searchResults.map((profile) => {
                const friendship = getFriendshipWith(profile.id);
                return (
                  <div key={profile.id} className="flex items-center gap-3 px-4 py-3 transition-all"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                  >
                    <Avatar profile={profile} size={36} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {profile.full_name || profile.username || 'Unknown'}
                      </p>
                      {profile.username && (
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{profile.username}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* 👁️ Stalk button — always visible */}
                      {profile.username && (
                        <button
                          onClick={() => router.push(`/u/${profile.username}`)}
                          className="text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all"
                          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                          title="View profile"
                        >
                          👁️
                        </button>
                      )}

                      {/* Friend status button */}
                      {!friendship ? (
                        <button onClick={() => sendRequest(profile.id)}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}>
                          <UserPlus size={12} /> Add
                        </button>
                      ) : friendship.status === 'pending' ? (
                        <span className="text-xs font-bold px-3 py-1.5 rounded-xl"
                          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                          {friendship.requester_id === user?.id ? 'Pending' : 'Respond'}
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-3 py-1.5 rounded-xl"
                          style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                          ✓ Friends
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Pending requests banner */}
      {incoming.length > 0 && (
        <div className="card animate-slide-up" style={{ border: '2px solid var(--accent)' }}>
          <h3 className="font-extrabold mb-3 flex items-center gap-2"
            style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
            👋 Friend Requests
            <span className="text-sm font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}>
              {incoming.length}
            </span>
          </h3>
          <div className="flex flex-col gap-2">
            {incoming.map((f) => (
              <div key={f.id} className="flex items-center gap-3">
                <Avatar profile={f.requester!} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {f.requester?.full_name || f.requester?.username || 'Unknown'}
                  </p>
                  {f.requester?.username && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{f.requester.username}</p>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  {/* 👁️ Stalk even from friend request */}
                  {f.requester?.username && (
                    <button
                      onClick={() => router.push(`/u/${f.requester!.username}`)}
                      className="text-xs font-bold px-2.5 py-1.5 rounded-xl"
                      style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                    >
                      👁️
                    </button>
                  )}
                  <button onClick={() => respondToRequest(f.id, 'accepted')}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                    style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                    <Check size={14} />
                  </button>
                  <button onClick={() => respondToRequest(f.id, 'declined')}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-red-50 hover:text-red-400"
                    style={{ color: 'var(--text-muted)' }}>
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {([
          { key: 'friends', label: `👥 Friends (${friends.length})` },
          { key: 'leaderboard', label: '🏆 Leaderboard' },
          { key: 'activity', label: '📡 Activity' },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
            style={tab === t.key
              ? { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
              : { color: 'var(--text-muted)' }
            }>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── FRIENDS TAB ── */}
      {tab === 'friends' && (
        <div className="flex flex-col gap-3">
          {loading ? (
            [1,2,3].map((i) => <div key={i} className="h-16 rounded-2xl shimmer" />)
          ) : friends.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-5xl mb-3">👥</div>
              <p className="font-extrabold text-lg mb-1" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
                No friends yet!
              </p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Search for users above to send friend requests 👆
              </p>
            </div>
          ) : (
            friends.map((friend) => {
              const friendship = getFriendshipWith(friend.id);
              return (
                <div key={friend.id} className="card flex items-center gap-3">
                  <Avatar profile={friend} size={44} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {friend.full_name || friend.username || 'Unknown'}
                    </p>
                    {friend.username && (
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>@{friend.username}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {friend.username && (
                      <button
                        onClick={() => router.push(`/u/${friend.username}`)}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                        👁️ View
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmRemove(friendship?.id ?? null)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-red-50 hover:text-red-400"
                      style={{ color: 'var(--text-muted)' }}>
                      <UserX size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Outgoing requests */}
          {outgoing.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-extrabold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
                Pending Sent
              </p>
              {outgoing.map((f) => (
                <div key={f.id} className="card flex items-center gap-3 opacity-60">
                  <Avatar profile={f.addressee!} size={36} />
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {f.addressee?.full_name || f.addressee?.username}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {f.addressee?.username && (
                      <button
                        onClick={() => router.push(`/u/${f.addressee!.username}`)}
                        className="text-xs font-bold px-2.5 py-1.5 rounded-xl"
                        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                        👁️
                      </button>
                    )}
                    <span className="text-xs font-bold px-2 py-1 rounded-lg"
                      style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                      Pending...
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── LEADERBOARD TAB ── */}
      {tab === 'leaderboard' && (
        <div className="flex flex-col gap-3">
          {leaderboardUsers.length <= 1 ? (
            <div className="card text-center py-12">
              <div className="text-5xl mb-3">🏆</div>
              <p className="font-extrabold text-lg mb-1" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
                Add friends to compete!
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                The leaderboard shows XP rankings among you and your friends.
              </p>
            </div>
          ) : (
            leaderboardUsers.map((entry, index) => (
              <div key={entry.profile.id} className="card flex items-center gap-4 transition-all"
                style={entry.isYou ? { border: '2px solid var(--accent)' } : {}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-lg flex-shrink-0"
                  style={{
                    fontFamily: "'Baloo 2', cursive",
                    backgroundColor: index === 0 ? '#fef3c7' : index === 1 ? '#f1f5f9' : index === 2 ? '#fef3c7' : 'var(--bg-secondary)',
                    color: index === 0 ? '#d97706' : index === 1 ? '#64748b' : index === 2 ? '#b45309' : 'var(--text-muted)',
                  }}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <Avatar profile={entry.profile} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    {entry.profile.full_name || entry.profile.username || 'Unknown'}
                    {entry.isYou && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-extrabold"
                        style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}>
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{entry.tasks} tasks done</p>
                </div>
                <div className="flex items-center gap-3">
                  {!entry.isYou && entry.profile.username && (
                    <button
                      onClick={() => router.push(`/u/${entry.profile.username}`)}
                      className="text-xs font-bold px-2.5 py-1.5 rounded-xl"
                      style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                      👁️
                    </button>
                  )}
                  <div className="text-right">
                    <p className="font-extrabold text-lg" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>{entry.xp}</p>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>XP</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── ACTIVITY TAB ── */}
      {tab === 'activity' && (
        <div className="flex flex-col gap-3">
          {activity.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-5xl mb-3">📡</div>
              <p className="font-extrabold text-lg mb-1" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
                No activity yet!
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Complete tasks and add friends to see activity here.
              </p>
            </div>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-4 rounded-2xl transition-all"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  {item.emoji || ACTIVITY_EMOJIS[item.type] || '⚡'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.profile && (
                      <button
                        onClick={() => item.profile?.username && router.push(`/u/${item.profile.username}`)}
                        className="font-bold text-sm hover:underline"
                        style={{ color: 'var(--text-primary)' }}>
                        {item.profile.full_name || item.profile.username || 'Someone'}
                      </button>
                    )}
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{item.title}</span>
                  </div>
                  {item.description && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                  )}
                  <p className="text-xs mt-1 font-semibold" style={{ color: 'var(--text-muted)' }}>
                    {new Date(item.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Confirm remove modal */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="card w-full max-w-xs text-center animate-bounce-in">
            <p className="text-4xl mb-3">😢</p>
            <p className="font-extrabold mb-1" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>Remove friend?</p>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>This will remove them from your friends list.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRemove(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => { removeFriend(confirmRemove); setConfirmRemove(null); }}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{ backgroundColor: '#ef4444', color: 'white' }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
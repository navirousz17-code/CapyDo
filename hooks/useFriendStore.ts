'use client';
// hooks/useFriendStore.ts
// Place at: hooks/useFriendStore.ts

import { create } from 'zustand';
import toast from 'react-hot-toast';

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  requester?: Profile;
  addressee?: Profile;
}

export interface ActivityItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string | null;
  emoji: string;
  created_at: string;
  profile?: Profile;
}

interface FriendStore {
  friendships: Friendship[];
  activity: ActivityItem[];
  searchResults: Profile[];
  loading: boolean;
  searchLoading: boolean;
  currentUserId: string | null;

  setCurrentUserId: (id: string) => void;
  fetchFriends: () => Promise<void>;
  fetchActivity: () => Promise<void>;
  searchUsers: (q: string) => Promise<void>;
  sendRequest: (addresseeId: string) => Promise<void>;
  respondToRequest: (id: string, status: 'accepted' | 'declined') => Promise<void>;
  removeFriend: (id: string) => Promise<void>;
  clearSearch: () => void;

  getFriends: () => Profile[];
  getPendingIncoming: () => Friendship[];
  getPendingOutgoing: () => Friendship[];
  getFriendshipWith: (userId: string) => Friendship | null;
}

export const useFriendStore = create<FriendStore>((set, get) => ({
  friendships: [],
  activity: [],
  searchResults: [],
  loading: false,
  searchLoading: false,
  currentUserId: null,

  setCurrentUserId: (id) => set({ currentUserId: id }),

  fetchFriends: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/friends');
      const data = await res.json();
      set({ friendships: Array.isArray(data) ? data : [] });
    } catch {}
    set({ loading: false });
  },

  fetchActivity: async () => {
    try {
      const res = await fetch('/api/activity-feed');
      const data = await res.json();
      set({ activity: Array.isArray(data) ? data : [] });
    } catch {}
  },

  searchUsers: async (q) => {
    if (q.length < 2) { set({ searchResults: [] }); return; }
    set({ searchLoading: true });
    try {
      const res = await fetch(`/api/friends/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      set({ searchResults: Array.isArray(data) ? data : [] });
    } catch {}
    set({ searchLoading: false });
  },

  sendRequest: async (addresseeId) => {
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressee_id: addresseeId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      set((s) => ({ friendships: [data, ...s.friendships] }));
      toast.success('Friend request sent! 👋');
    } catch {
      toast.error('Failed to send request');
    }
  },

  respondToRequest: async (id, status) => {
    try {
      const res = await fetch(`/api/friends/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      set((s) => ({
        friendships: s.friendships.map((f) => f.id === id ? { ...f, status } : f),
      }));
      toast.success(status === 'accepted' ? 'Friend request accepted! 🎉' : 'Request declined');
    } catch {
      toast.error('Failed to respond');
    }
  },

  removeFriend: async (id) => {
    set((s) => ({ friendships: s.friendships.filter((f) => f.id !== id) }));
    try {
      await fetch(`/api/friends/${id}`, { method: 'DELETE' });
      toast.success('Friend removed');
    } catch {
      get().fetchFriends();
    }
  },

  clearSearch: () => set({ searchResults: [] }),

  getFriends: () => {
    const { friendships, currentUserId } = get();
    return friendships
      .filter((f) => f.status === 'accepted')
      .map((f) => f.requester_id === currentUserId ? f.addressee! : f.requester!);
  },

  getPendingIncoming: () => {
    const { friendships, currentUserId } = get();
    return friendships.filter((f) => f.status === 'pending' && f.addressee_id === currentUserId);
  },

  getPendingOutgoing: () => {
    const { friendships, currentUserId } = get();
    return friendships.filter((f) => f.status === 'pending' && f.requester_id === currentUserId);
  },

  getFriendshipWith: (userId) => {
    const { friendships } = get();
    return friendships.find(
      (f) => f.requester_id === userId || f.addressee_id === userId
    ) ?? null;
  },
}));
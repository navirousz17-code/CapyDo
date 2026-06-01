import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: { full_name: string | null; username: string | null; avatar_url: string | null };
}

export interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  last_read_at: string;
  profile?: { full_name: string | null; username: string | null; avatar_url: string | null; id: string };
}

export interface Conversation {
  id: string;
  name: string | null;
  is_group: boolean;
  created_at: string;
  members?: ConversationMember[];
  lastMessage?: Message | null;
  unreadCount?: number;
}

interface MessageStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  loading: boolean;
  sendingMessage: boolean;

  setActiveConversation: (id: string | null) => void;
  fetchConversations: (userId: string) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, senderId: string) => Promise<void>;
  createDM: (currentUserId: string, friendId: string) => Promise<string | null>;
  createGroup: (currentUserId: string, memberIds: string[], name: string) => Promise<string | null>;
  markAsRead: (conversationId: string, userId: string) => Promise<void>;
  subscribeToMessages: (conversationId: string) => () => void;
  subscribeToConversations: (userId: string) => () => void;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  loading: false,
  sendingMessage: false,

  setActiveConversation: (id) => set({ activeConversationId: id }),

  fetchConversations: async (userId) => {
    const supabase = createClient();
    set({ loading: true });
    try {
      // Fetch everything through conversation_members to avoid direct conversations RLS issues
      const { data: memberRows } = await (supabase as any)
        .from('conversation_members')
        .select(`
          id,
          conversation_id,
          user_id,
          last_read_at,
          conversation:conversations(id, name, is_group, created_at)
        `)
        .eq('user_id', userId);

      if (!memberRows?.length) { set({ conversations: [], loading: false }); return; }

      const enriched: Conversation[] = await Promise.all(
        memberRows.map(async (row: any) => {
          const c = row.conversation;
          if (!c) return null;

          const { data: members } = await (supabase as any)
            .from('conversation_members')
            .select('*, profile:profiles(id, full_name, username, avatar_url)')
            .eq('conversation_id', c.id);

          const { data: lastMsgs } = await (supabase as any)
            .from('messages')
            .select('*, sender:profiles(full_name, username, avatar_url)')
            .eq('conversation_id', c.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const myMember = members?.find((m: any) => m.user_id === userId);
          let unread = 0;
          if (myMember) {
            const { count } = await (supabase as any)
              .from('messages')
              .select('id', { count: 'exact' })
              .eq('conversation_id', c.id)
              .neq('sender_id', userId)
              .gt('created_at', myMember.last_read_at);
            unread = count ?? 0;
          }

          return {
            ...c,
            members: members ?? [],
            lastMessage: lastMsgs?.[0] ?? null,
            unreadCount: unread,
          };
        })
      );

      const valid = enriched.filter(Boolean) as Conversation[];
      // Sort by last message time
      valid.sort((a, b) => {
        const aTime = a.lastMessage?.created_at ?? a.created_at;
        const bTime = b.lastMessage?.created_at ?? b.created_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      set({ conversations: valid, loading: false });
    } catch (e) {
      console.error('fetchConversations error:', e);
      set({ loading: false });
    }
  },

  fetchMessages: async (conversationId) => {
    const supabase = createClient();
    const { data } = await (supabase as any)
      .from('messages')
      .select('*, sender:profiles(full_name, username, avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (data) {
      set(s => ({ messages: { ...s.messages, [conversationId]: data } }));
    }
  },

  sendMessage: async (conversationId, content, senderId) => {
    const supabase = createClient();
    set({ sendingMessage: true });
    try {
      const { data } = await (supabase as any)
        .from('messages')
        .insert({ conversation_id: conversationId, content, sender_id: senderId })
        .select('*, sender:profiles(full_name, username, avatar_url)')
        .single();

      if (data) {
        set(s => ({
          messages: {
            ...s.messages,
            [conversationId]: [...(s.messages[conversationId] ?? []), data],
          },
          sendingMessage: false,
        }));
      }
    } catch { set({ sendingMessage: false }); }
  },

  createDM: async (currentUserId, friendId) => {
    const supabase = createClient();
    const { data: myConvos } = await (supabase as any)
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    if (myConvos?.length) {
      const { data: shared } = await (supabase as any)
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', friendId)
        .in('conversation_id', myConvos.map((c: any) => c.conversation_id));

      if (shared?.length) {
        for (const s of shared) {
          const { data: members } = await (supabase as any)
            .from('conversation_members')
            .select('conversation_id, conversation:conversations(id, is_group)')
            .eq('conversation_id', s.conversation_id);
          const match = members?.find((m: any) => m.conversation?.is_group === false);
          if (match) return match.conversation_id;
        }
      }
    }

    const { data: convo } = await (supabase as any)
      .from('conversations')
      .insert({ is_group: false })
      .select()
      .single();
    if (!convo) return null;

    // Insert current user FIRST so RLS allows the second insert
    await (supabase as any).from('conversation_members').insert({
      conversation_id: convo.id, user_id: currentUserId,
    });

    // Then insert friend
    await (supabase as any).from('conversation_members').insert({
      conversation_id: convo.id, user_id: friendId,
    });

    await get().fetchConversations(currentUserId);
    return convo.id;
  },

  createGroup: async (currentUserId, memberIds, name) => {
    const supabase = createClient();
    const { data: convo } = await (supabase as any)
      .from('conversations')
      .insert({ is_group: true, name })
      .select()
      .single();
    if (!convo) return null;

    // Insert current user first
    await (supabase as any).from('conversation_members').insert({
      conversation_id: convo.id, user_id: currentUserId,
    });

    // Then insert the rest
    for (const uid of memberIds) {
      await (supabase as any).from('conversation_members').insert({
        conversation_id: convo.id, user_id: uid,
      });
    }

    await get().fetchConversations(currentUserId);
    return convo.id;
  },

  markAsRead: async (conversationId, userId) => {
    const supabase = createClient();
    await (supabase as any)
      .from('conversation_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    set(s => ({
      conversations: s.conversations.map(c =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    }));
  },

  subscribeToMessages: (conversationId) => {
    const supabase = createClient();
    const channelName = `messages:${conversationId}`;
    supabase.getChannels().forEach(ch => {
      if (ch.topic === `realtime:${channelName}`) supabase.removeChannel(ch);
    });
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, async (payload) => {
        const { data } = await (supabase as any)
          .from('messages')
          .select('*, sender:profiles(full_name, username, avatar_url)')
          .eq('id', payload.new.id)
          .single();
        if (data) {
          set(s => ({
            messages: {
              ...s.messages,
              [conversationId]: [...(s.messages[conversationId] ?? []), data],
            },
          }));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  subscribeToConversations: (userId) => {
    const supabase = createClient();
    const channelName = `conversations:${userId}`;
    supabase.getChannels().forEach(ch => {
      if (ch.topic === `realtime:${channelName}`) supabase.removeChannel(ch);
    });
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => { get().fetchConversations(userId); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },
}));
'use client';
// components/ui/ChatSidebar.tsx

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { X, Send, Plus, Users, ChevronLeft, Search, Check, MessageCircle } from 'lucide-react';
import { useMessageStore, Conversation, ConversationMember, Message } from '@/hooks/useMessageStore';
import { useFriendStore } from '@/hooks/useFriendStore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils';

function Avatar({ url, name, size = 36 }: { url?: string | null; name: string; size?: number }) {
  const initial = (name || '?')[0].toUpperCase();
  return url ? (
    <Image src={url} alt={initial} width={size} height={size}
      className="rounded-xl object-cover flex-shrink-0" style={{ width: size, height: size }} />
  ) : (
    <div className="rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, background: 'linear-gradient(135deg, var(--success), var(--accent))', fontSize: size * 0.38 }}>
      {initial}
    </div>
  );
}

function formatTime(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getConvoName(convo: Conversation, currentUserId: string) {
  if (convo.is_group) return convo.name ?? 'Group';
  const other = convo.members?.find((m: ConversationMember) => m.user_id !== currentUserId);
  return other?.profile?.full_name || other?.profile?.username || 'Unknown';
}

function getConvoAvatar(convo: Conversation, currentUserId: string) {
  if (convo.is_group) return null;
  const other = convo.members?.find((m: ConversationMember) => m.user_id !== currentUserId);
  return other?.profile?.avatar_url ?? null;
}

// ── CREATE GROUP MODAL ────────────────────────────────────────────────────────
function CreateGroupModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const { user } = useAuth();
  const { getFriends } = useFriendStore();
  const { createGroup } = useMessageStore();
  const friends = getFriends();
  const [selected, setSelected] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  const toggle = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const handleCreate = async () => {
    if (!user || selected.length === 0 || !groupName.trim()) return;
    setCreating(true);
    const id = await createGroup(user.id, selected, groupName.trim());
    if (id) onCreated(id);
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm rounded-2xl p-5 animate-bounce-in"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-lg" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
            New Group Chat
          </h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <input className="input-field mb-3" placeholder="Group name..." value={groupName}
          onChange={e => setGroupName(e.target.value)} />
        <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Select friends:</p>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto mb-4">
          {friends.map(f => (
            <button key={f.id} onClick={() => toggle(f.id)}
              className="flex items-center gap-3 p-2.5 rounded-xl transition-all text-left"
              style={{ backgroundColor: selected.includes(f.id) ? 'var(--accent)' : 'var(--bg-secondary)' }}>
              <Avatar url={f.avatar_url} name={f.full_name || f.username || '?'} size={32} />
              <span className="font-semibold text-sm flex-1"
                style={{ color: selected.includes(f.id) ? 'var(--accent-text)' : 'var(--text-primary)' }}>
                {f.full_name || f.username || 'Unknown'}
              </span>
              {selected.includes(f.id) && <Check size={14} style={{ color: 'var(--accent-text)' }} />}
            </button>
          ))}
          {friends.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No friends yet!</p>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
          <button onClick={handleCreate} disabled={creating || selected.length === 0 || !groupName.trim()}
            className="btn-primary flex-1 text-sm flex items-center justify-center gap-1.5 disabled:opacity-40">
            {creating ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Users size={14} />}
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CHAT VIEW ─────────────────────────────────────────────────────────────────
function ChatView({ convo, onBack }: { convo: Conversation; onBack: () => void }) {
  const { user } = useAuth();
  const { messages, fetchMessages, sendMessage, markAsRead, subscribeToMessages } = useMessageStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const msgs = messages[convo.id] ?? [];

  useEffect(() => {
    fetchMessages(convo.id);
    if (user) markAsRead(convo.id, user.id);
    const unsub = subscribeToMessages(convo.id);
    return unsub;
  }, [convo.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs.length]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    const content = input.trim();
    setInput('');
    await sendMessage(convo.id, content, user.id);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const convoName = getConvoName(convo, user?.id ?? '');
  const convoAvatar = getConvoAvatar(convo, user?.id ?? '');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <button onClick={onBack} className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
          style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}>
          <ChevronLeft size={16} />
        </button>
        {convo.is_group
          ? <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg, var(--success), var(--accent))' }}>
              <Users size={14} color="white" />
            </div>
          : <Avatar url={convoAvatar} name={convoName} size={32} />
        }
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{convoName}</p>
          {convo.is_group && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {convo.members?.length} members
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1.5">
        {msgs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <MessageCircle size={32} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No messages yet</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>Say hello! 👋</p>
          </div>
        )}
        {msgs.map((msg: Message, i: number) => {
          const isMe = msg.sender_id === user?.id;
          const showAvatar = !isMe && (i === 0 || msgs[i - 1]?.sender_id !== msg.sender_id);
          const showName = !isMe && convo.is_group && showAvatar;
          return (
            <div key={msg.id} className={cn('flex gap-2', isMe ? 'flex-row-reverse' : 'flex-row')}>
              {!isMe && (
                <div className="w-6 flex-shrink-0 mt-auto mb-0.5">
                  {showAvatar && (
                    <Avatar url={msg.sender?.avatar_url} name={msg.sender?.full_name || '?'} size={24} />
                  )}
                </div>
              )}
              <div className={cn('max-w-[72%] flex flex-col', isMe ? 'items-end' : 'items-start')}>
                {showName && (
                  <p className="text-xs font-bold mb-0.5 px-1" style={{ color: 'var(--text-muted)' }}>
                    {msg.sender?.full_name || msg.sender?.username || 'Unknown'}
                  </p>
                )}
                <div className="px-3 py-2 rounded-2xl text-sm font-medium break-words"
                  style={isMe
                    ? { backgroundColor: 'var(--accent)', color: 'var(--accent-text)', borderBottomRightRadius: 6 }
                    : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderBottomLeftRadius: 6 }
                  }>
                  {msg.content}
                </div>
                <p className="text-[10px] mt-0.5 px-1" style={{ color: 'var(--text-muted)' }}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <div className="flex gap-2 items-end">
          <textarea
            className="flex-1 resize-none rounded-2xl px-3 py-2.5 text-sm font-medium outline-none transition-all"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              maxHeight: 100, minHeight: 40,
            }}
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
          />
          <button onClick={handleSend} disabled={!input.trim()}
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CONVERSATION LIST ─────────────────────────────────────────────────────────
function ConvoList({ onSelect, onNewDM, onNewGroup }: {
  onSelect: (id: string) => void;
  onNewDM: () => void;
  onNewGroup: () => void;
}) {
  const { user } = useAuth();
  const { conversations, loading } = useMessageStore();
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c: Conversation) => {
    const name = getConvoName(c, user?.id ?? '');
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const totalUnread = conversations.reduce((sum: number, c: Conversation) => sum + (c.unreadCount ?? 0), 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="pl-12 pr-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-lg flex items-center gap-2"
            style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
            Messages
            {totalUnread > 0 && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}>
                {totalUnread}
              </span>
            )}
          </h3>
          <div className="flex gap-1.5">
            <button onClick={onNewGroup} title="New Group"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              <Users size={15} />
            </button>
            <button onClick={onNewDM} title="New Message"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}>
              <Plus size={15} />
            </button>
          </div>
        </div>
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <Search size={13} style={{ color: 'var(--text-muted)' }} />
          <input className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
            placeholder="Search conversations..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-16 mx-3 my-1.5 rounded-xl shimmer" />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
            <MessageCircle size={36} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
            <p className="font-bold text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              {search ? 'No results' : 'No conversations yet'}
            </p>
            {!search && (
              <button onClick={onNewDM} className="btn-primary text-sm flex items-center gap-1.5">
                <Plus size={14} /> Start a chat
              </button>
            )}
          </div>
        ) : (
          filtered.map((c: Conversation) => {
            const name = getConvoName(c, user?.id ?? '');
            const avatar = getConvoAvatar(c, user?.id ?? '');
            return (
              <button key={c.id} onClick={() => onSelect(c.id)}
                className="w-full flex items-center gap-3 px-4 py-3 transition-all text-left"
                style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-secondary)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}>
                {c.is_group
                  ? <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, var(--success), var(--accent))' }}>
                      <Users size={16} color="white" />
                    </div>
                  : <Avatar url={avatar} name={name} size={40} />
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{name}</p>
                    {c.lastMessage && (
                      <p className="text-[10px] flex-shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>
                        {formatTime(c.lastMessage.created_at)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {c.lastMessage?.content ?? 'No messages yet'}
                    </p>
                    {(c.unreadCount ?? 0) > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1"
                        style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}>
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── NEW DM MODAL ──────────────────────────────────────────────────────────────
function NewDMModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const { user } = useAuth();
  const { getFriends } = useFriendStore();
  const { createDM } = useMessageStore();
  const friends = getFriends();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = friends.filter(f =>
    (f.full_name || f.username || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = async (friendId: string) => {
    if (!user) return;
    setLoading(friendId);
    const id = await createDM(user.id, friendId);
    if (id) onCreated(id);
    setLoading(null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm rounded-2xl p-5 animate-bounce-in"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-lg" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
            New Message
          </h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <Search size={13} style={{ color: 'var(--text-muted)' }} />
          <input className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
            placeholder="Search friends..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
          {filtered.map(f => (
            <button key={f.id} onClick={() => handleSelect(f.id)}
              className="flex items-center gap-3 p-2.5 rounded-xl transition-all text-left"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-card)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-secondary)'}>
              <Avatar url={f.avatar_url} name={f.full_name || f.username || '?'} size={36} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                  {f.full_name || f.username || 'Unknown'}
                </p>
                {f.username && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{f.username}</p>}
              </div>
              {loading === f.id && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: 'var(--text-muted)' }} />}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No friends found</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN SIDEBAR ──────────────────────────────────────────────────────────────
interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
  initialConvoId?: string | null;
}

export default function ChatSidebar({ open, onClose, initialConvoId }: ChatSidebarProps) {
  const { user } = useAuth();
  const { conversations, activeConversationId, setActiveConversation, fetchConversations, subscribeToConversations } = useMessageStore();
  const { fetchFriends, setCurrentUserId } = useFriendStore();
  const [showNewDM, setShowNewDM] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);

  useEffect(() => {
    if (!user || !open) return;
    setCurrentUserId(user.id);
    fetchFriends();
    fetchConversations(user.id);
    const unsub = subscribeToConversations(user.id);
    return unsub;
  }, [user, open]);

  useEffect(() => {
    if (initialConvoId) setActiveConversation(initialConvoId);
  }, [initialConvoId]);

  const activeConvo = conversations.find((c: Conversation) => c.id === activeConversationId);

  const handleConvoSelect = (id: string) => {
    setActiveConversation(id);
    if (user) useMessageStore.getState().markAsRead(id, user.id);
  };

  const handleNewChat = (id: string) => {
    setShowNewDM(false);
    setShowNewGroup(false);
    setActiveConversation(id);
  };

  const totalUnread = conversations.reduce((sum: number, c: Conversation) => sum + (c.unreadCount ?? 0), 0);

  return (
    <>
      {/* Overlay */}
      {open && <div className="fixed inset-0 z-40 lg:hidden" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={onClose} />}

      {/* Sidebar */}
      <div className={cn(
        'fixed right-0 top-0 h-full z-40 flex flex-col transition-transform duration-300',
        open ? 'translate-x-0' : 'translate-x-full'
      )} style={{
        width: 340, backgroundColor: 'var(--bg-card)',
        borderLeft: '1px solid var(--border)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
      }}>
        {/* Close button */}
        <button onClick={onClose}
          className="absolute top-3 left-3 z-10 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
          <X size={14} />
        </button>

        {/* Content */}
        <div className="flex-1 overflow-hidden pt-0">
          {activeConvo
            ? <ChatView convo={activeConvo} onBack={() => setActiveConversation(null)} />
            : <ConvoList
                onSelect={handleConvoSelect}
                onNewDM={() => setShowNewDM(true)}
                onNewGroup={() => setShowNewGroup(true)}
              />
          }
        </div>
      </div>

      {/* Modals */}
      {showNewDM && <NewDMModal onClose={() => setShowNewDM(false)} onCreated={handleNewChat} />}
      {showNewGroup && <CreateGroupModal onClose={() => setShowNewGroup(false)} onCreated={handleNewChat} />}
    </>
  );
}

// ── CHAT BUTTON (floating or in header) ──────────────────────────────────────
export function ChatButton({ onClick }: { onClick: () => void }) {
  const { conversations } = useMessageStore();
  const totalUnread = conversations.reduce((sum: number, c: Conversation) => sum + (c.unreadCount ?? 0), 0);

  return (
    <button onClick={onClick}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
      style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
      title="Messages">
      <MessageCircle size={18} />
      {totalUnread > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}>
          {totalUnread > 9 ? '9+' : totalUnread}
        </span>
      )}
    </button>
  );
}
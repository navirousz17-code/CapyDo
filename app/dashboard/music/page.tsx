'use client';
// app/dashboard/music/page.tsx

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Trash2, X, Music, ExternalLink } from 'lucide-react';

type SourceType = 'spotify' | 'youtube';

interface Playlist {
  id: string;
  title: string;
  url: string;
  embedId: string;
  type: 'playlist' | 'album' | 'artist' | 'track' | 'video' | 'yt-playlist';
  source: SourceType;
  tag: string;
  addedAt: string;
}

const TAGS = [
  { key: 'Focus', label: 'Focus', icon: '/tag-focus.png' },
  { key: 'Hype',  label: 'Hype',  icon: '/tag-hype.png'  },
  { key: 'Chill', label: 'Chill', icon: '/tag-chill.png' },
  { key: 'Feels', label: 'Feels', icon: '/tag-feels.png' },
  { key: 'Night', label: 'Night', icon: '/tag-night.png' },
  { key: 'Vibes', label: 'Vibes', icon: '/tag-vibes.png' },
  { key: 'Faves', label: 'Faves', icon: '/tag-faves.png' },
];

const TAG_KEYS = TAGS.map(t => t.key);

const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: '1',
    title: 'Daniel Caesar',
    url: 'https://open.spotify.com/artist/20wkVLutqVOYrc0kxFs7rA',
    embedId: 'artist/20wkVLutqVOYrc0kxFs7rA',
    type: 'artist',
    source: 'spotify',
    tag: 'Faves',
    addedAt: new Date().toISOString(),
  },
];

function extractSpotifyId(input: string): { embedId: string; type: Playlist['type'] } | null {
  const iframeMatch = input.match(/src="https:\/\/open\.spotify\.com\/embed\/(playlist|album|artist|track)\/([a-zA-Z0-9]+)/);
  if (iframeMatch) return { type: iframeMatch[1] as Playlist['type'], embedId: `${iframeMatch[1]}/${iframeMatch[2]}` };
  const embedMatch = input.match(/open\.spotify\.com\/embed\/(playlist|album|artist|track)\/([a-zA-Z0-9]+)/);
  if (embedMatch) return { type: embedMatch[1] as Playlist['type'], embedId: `${embedMatch[1]}/${embedMatch[2]}` };
  const uriMatch = input.match(/spotify:(playlist|album|artist|track):([a-zA-Z0-9]+)/);
  if (uriMatch) return { type: uriMatch[1] as Playlist['type'], embedId: `${uriMatch[1]}/${uriMatch[2]}` };
  const urlMatch = input.match(/open\.spotify\.com\/(playlist|album|artist|track)\/([a-zA-Z0-9]+)/);
  if (urlMatch) return { type: urlMatch[1] as Playlist['type'], embedId: `${urlMatch[1]}/${urlMatch[2]}` };
  return null;
}

function extractYouTubeId(input: string): { embedId: string; type: Playlist['type'] } | null {
  const playlistMatch = input.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  const videoMatch = input.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  if (playlistMatch) return { embedId: playlistMatch[1], type: 'yt-playlist' };
  if (videoMatch) return { embedId: videoMatch[1], type: 'video' };
  return null;
}

function detectSource(input: string): SourceType | null {
  if (input.includes('spotify.com') || input.includes('spotify:')) return 'spotify';
  if (input.includes('youtube.com') || input.includes('youtu.be')) return 'youtube';
  return null;
}

function SpotifyEmbed({ embedId }: { embedId: string }) {
  return (
    <iframe
      src={`https://open.spotify.com/embed/${embedId}?utm_source=generator&theme=0`}
      width="100%" height={352} frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy" style={{ borderRadius: 12 }}
    />
  );
}

function YouTubeEmbed({ embedId, type }: { embedId: string; type: Playlist['type'] }) {
  const src = type === 'yt-playlist'
    ? `https://www.youtube.com/embed/videoseries?list=${embedId}`
    : `https://www.youtube.com/embed/${embedId}`;
  return (
    <iframe
      src={src} width="100%" height={315} frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen loading="lazy" style={{ borderRadius: 12 }}
    />
  );
}

function TagIcon({ tagKey, size = 20 }: { tagKey: string; size?: number }) {
  const tag = TAGS.find(t => t.key === tagKey);
  if (!tag) return null;
  return <Image src={tag.icon} alt={tag.label} width={size} height={size} className="object-contain" />;
}

export default function MusicPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [activeTag, setActiveTag] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formUrl, setFormUrl] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formTag, setFormTag] = useState(TAG_KEYS[0]);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('todei-music');
      if (saved) {
        setPlaylists(JSON.parse(saved));
      } else {
        setPlaylists(DEFAULT_PLAYLISTS);
        localStorage.setItem('todei-music', JSON.stringify(DEFAULT_PLAYLISTS));
      }
    } catch {
      setPlaylists(DEFAULT_PLAYLISTS);
    }
  }, []);

  const save = (updated: Playlist[]) => {
    setPlaylists(updated);
    localStorage.setItem('todei-music', JSON.stringify(updated));
  };

  const handleAdd = () => {
    setFormError('');
    if (!formUrl.trim()) { setFormError('Paste a link first!'); return; }
    if (!formTitle.trim()) { setFormError('Give it a name!'); return; }

    const source = detectSource(formUrl.trim());
    if (!source) { setFormError('Only Spotify and YouTube links are supported.'); return; }

    let embedId = '';
    let type: Playlist['type'] = 'track';

    if (source === 'spotify') {
      const extracted = extractSpotifyId(formUrl.trim());
      if (!extracted) { setFormError('Invalid Spotify link.'); return; }
      embedId = extracted.embedId;
      type = extracted.type;
    } else {
      const extracted = extractYouTubeId(formUrl.trim());
      if (!extracted) { setFormError('Invalid YouTube link.'); return; }
      embedId = extracted.embedId;
      type = extracted.type;
    }

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      title: formTitle.trim(),
      url: formUrl.trim(),
      embedId, type, source,
      tag: formTag,
      addedAt: new Date().toISOString(),
    };

    save([newPlaylist, ...playlists]);
    setFormUrl('');
    setFormTitle('');
    setFormTag(TAG_KEYS[0]);
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    save(playlists.filter((p) => p.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const filtered = activeTag === 'All' ? playlists : playlists.filter((p) => p.tag === activeTag);

  const TYPE_ICON: Record<string, string> = {
    playlist: '/stat-total.png',
    album: '/stat-total.png',
    artist: '/stat-spotify.png',
    track: '/stat-tracks.png',
    video: '/stat-youtube.png',
    'yt-playlist': '/stat-youtube.png',
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
            My Music
          </h1>
          <p className="font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Spotify & YouTube — all in one place.
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Tag filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTag('All')}
          className="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
          style={activeTag === 'All'
            ? { backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }
            : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
          }
        >
          All
        </button>
        {TAGS.map((tag) => (
          <button
            key={tag.key}
            onClick={() => setActiveTag(tag.key)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
            style={activeTag === tag.key
              ? { backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }
              : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
            }
          >
            <Image src={tag.icon} alt={tag.label} width={20} height={20} className="object-contain" />
            {tag.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total',   value: playlists.length,                                                    icon: '/stat-total.png'   },
          { label: 'Spotify', value: playlists.filter(p => p.source === 'spotify').length,                icon: '/stat-spotify.png' },
          { label: 'YouTube', value: playlists.filter(p => p.source === 'youtube').length,                icon: '/stat-youtube.png' },
          { label: 'Tracks',  value: playlists.filter(p => p.type === 'track' || p.type === 'video').length, icon: '/stat-tracks.png'  },
        ].map((s) => (
          <div key={s.label} className="card text-center border-0 py-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="flex justify-center mb-1">
              <Image src={s.icon} alt={s.label} width={32} height={32} className="object-contain" />
            </div>
            <div className="text-xl font-extrabold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>{s.value}</div>
            <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="flex justify-center mb-3">
            <Image src="/stat-total.png" alt="music" width={56} height={56} className="object-contain" />
          </div>
          <p className="font-extrabold text-lg mb-1" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
            No music yet!
          </p>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
            Add a Spotify or YouTube link.
          </p>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 mx-auto">
            <Plus size={16} /> Add Music
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((playlist) => (
            <div key={playlist.id} className="card flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {/* Type icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: playlist.source === 'spotify' ? '#1DB95420' : '#FF000020' }}
                >
                  <Image src={TYPE_ICON[playlist.type]} alt={playlist.type} width={24} height={24} className="object-contain" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{playlist.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {/* Source badge */}
                    <span
                      className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: playlist.source === 'spotify' ? '#1DB95420' : '#FF000020',
                        color: playlist.source === 'spotify' ? '#1DB954' : '#FF0000',
                      }}
                    >
                      <Image
                        src={playlist.source === 'spotify' ? '/stat-spotify.png' : '/stat-youtube.png'}
                        alt={playlist.source} width={16} height={16} className="object-contain"
                      />
                      {playlist.source === 'spotify' ? 'Spotify' : 'YouTube'}
                    </span>
                    {/* Tag badge */}
                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                      <TagIcon tagKey={playlist.tag} size={12} />
                      {playlist.tag}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setExpandedId(expandedId === playlist.id ? null : playlist.id)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                    style={{
                      backgroundColor: expandedId === playlist.id
                        ? (playlist.source === 'spotify' ? '#1DB954' : '#FF0000')
                        : 'var(--bg-secondary)',
                      color: expandedId === playlist.id ? 'white' : 'var(--text-secondary)',
                    }}
                  >
                    {expandedId === playlist.id ? '▲ Hide' : '▶ Play'}
                  </button>
                  <a
                    href={playlist.url} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                  >
                    <ExternalLink size={13} />
                  </a>
                  <button
                    onClick={() => handleDelete(playlist.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-red-50 hover:text-red-400"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {expandedId === playlist.id && (
                <div className="animate-slide-up">
                  {playlist.source === 'spotify'
                    ? <SpotifyEmbed embedId={playlist.embedId} />
                    : <YouTubeEmbed embedId={playlist.embedId} type={playlist.type} />
                  }
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="flex flex-col gap-2">
        <div className="rounded-2xl p-4 text-sm font-semibold flex items-start gap-3"
          style={{ backgroundColor: '#1DB95415', color: 'var(--text-secondary)', border: '1px solid #1DB95430' }}>
          <Image src="/stat-spotify.png" alt="spotify" width={20} height={20} className="object-contain flex-shrink-0 mt-0.5" />
          <span>Spotify: right click anything → Share → <strong>Copy link</strong></span>
        </div>
        <div className="rounded-2xl p-4 text-sm font-semibold flex items-start gap-3"
          style={{ backgroundColor: '#FF000015', color: 'var(--text-secondary)', border: '1px solid #FF000030' }}>
          <Image src="/stat-youtube.png" alt="youtube" width={20} height={20} className="object-contain flex-shrink-0 mt-0.5" />
          <span>YouTube: copy any video or playlist URL from your browser</span>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAdd(false); }}
        >
          <div className="w-full max-w-md rounded-2xl p-6 animate-bounce-in"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold flex items-center gap-2"
                style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
                <Music size={20} style={{ color: 'var(--accent)' }} /> Add Music
              </h2>
              <button onClick={() => setShowAdd(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Source badges */}
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: '#1DB95420', color: '#1DB954' }}>
                  <Image src="/stat-spotify.png" alt="spotify" width={18} height={18} className="object-contain" /> Spotify
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: '#FF000020', color: '#FF0000' }}>
                  <Image src="/stat-youtube.png" alt="youtube" width={18} height={18} className="object-contain" /> YouTube
                </span>
              </div>

              <div>
                <label className="text-sm font-bold mb-1 block" style={{ color: 'var(--text-secondary)' }}>Link *</label>
                <input
                  className="input-field"
                  placeholder="Paste Spotify or YouTube link..."
                  value={formUrl}
                  onChange={(e) => { setFormUrl(e.target.value); setFormError(''); }}
                  autoFocus
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Works with Spotify playlists, albums, artists, tracks & YouTube videos, playlists
                </p>
              </div>

              <div>
                <label className="text-sm font-bold mb-1 block" style={{ color: 'var(--text-secondary)' }}>Name *</label>
                <input
                  className="input-field"
                  placeholder="e.g. Daniel Caesar Vibes"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-bold mb-2 block" style={{ color: 'var(--text-secondary)' }}>Tag</label>
                <div className="flex gap-2 flex-wrap">
                  {TAGS.map((tag) => (
                    <button
                      key={tag.key}
                      onClick={() => setFormTag(tag.key)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all"
                      style={formTag === tag.key
                        ? { backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }
                        : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                      }
                    >
                      <Image src={tag.icon} alt={tag.label} width={18} height={18} className="object-contain" />
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {formError && <p className="text-sm font-semibold text-red-500">{formError}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAdd} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Music size={16} /> Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Camera, Download, Share2, RefreshCw, FlipHorizontal, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePetStore, getStageForXp } from '@/hooks/usePetStore';
import { useTaskStore } from '@/hooks/useTaskStore';
import toast from 'react-hot-toast';

// ── FILTERS ──────────────────────────────────────────────────────────────────
const FILTERS = [
  { id: 'none',        name: 'Original',    emoji: '✨', css: 'none',                                                         overlay: null },
  { id: 'golden',      name: 'Golden Hour', emoji: '🌅', css: 'sepia(0.4) saturate(1.8) brightness(1.1) contrast(1.05)',      overlay: 'rgba(255,180,50,0.08)' },
  { id: 'soft-warm',   name: 'Soft Warm',   emoji: '🧡', css: 'sepia(0.2) saturate(1.3) brightness(1.08)',                    overlay: 'rgba(255,150,80,0.06)' },
  { id: 'cool-breeze', name: 'Cool Breeze', emoji: '💙', css: 'saturate(0.85) hue-rotate(15deg) brightness(1.05)',            overlay: 'rgba(100,180,255,0.07)' },
  { id: 'vintage',     name: 'Vintage',     emoji: '📷', css: 'sepia(0.55) contrast(1.1) brightness(0.95) saturate(0.9)',     overlay: 'rgba(180,120,60,0.1)' },
  { id: 'moody',       name: 'Moody',       emoji: '🌑', css: 'brightness(0.82) contrast(1.25) saturate(1.15)',               overlay: 'rgba(20,10,40,0.15)' },
  { id: 'dreamy',      name: 'Dreamy',      emoji: '💜', css: 'saturate(1.4) brightness(1.08) hue-rotate(-10deg)',            overlay: 'rgba(180,100,255,0.08)' },
  { id: 'neon',        name: 'Neon',        emoji: '🔮', css: 'saturate(2.5) brightness(0.85) contrast(1.3)',                 overlay: 'rgba(100,0,255,0.08)' },
  { id: 'faded',       name: 'Faded',       emoji: '🤍', css: 'saturate(0.5) brightness(1.2) contrast(0.88)',                 overlay: 'rgba(255,255,255,0.12)' },
  { id: 'forest',      name: 'Forest',      emoji: '🌿', css: 'saturate(1.3) hue-rotate(-20deg) brightness(0.95)',            overlay: 'rgba(30,120,60,0.08)' },
  { id: 'sunset',      name: 'Sunset',      emoji: '🌸', css: 'sepia(0.3) saturate(1.6) hue-rotate(-15deg) brightness(1.05)',overlay: 'rgba(255,100,150,0.08)' },
  { id: 'noir',        name: 'Noir',        emoji: '🖤', css: 'grayscale(1) contrast(1.3) brightness(0.9)',                   overlay: null },
];

// ── FRAMES ───────────────────────────────────────────────────────────────────
const FRAMES = [
  { id: 'none',          name: 'None',          emoji: '⬜', style: null },
  { id: 'cozy',          name: 'Cozy',          emoji: '🌿', style: { border: '12px solid #5aa352', borderRadius: 16, boxShadow: '0 0 0 4px #82c97a, 0 0 0 8px #d4edcc' } },
  { id: 'golden',        name: 'Golden',        emoji: '✨', style: { border: '10px solid #f59e0b', borderRadius: 12, boxShadow: '0 0 0 4px #fbbf24, 0 0 30px rgba(245,158,11,0.4)' } },
  { id: 'shadow',        name: 'Shadow',        emoji: '👑', style: { border: '10px solid #7c3aed', borderRadius: 12, boxShadow: '0 0 0 4px #a855f7, 0 0 40px rgba(124,58,237,0.5)' } },
  { id: 'pink',          name: 'Pink',          emoji: '🎀', style: { border: '10px solid #ec4899', borderRadius: 20, boxShadow: '0 0 0 4px #f9a8d4, 0 0 20px rgba(236,72,153,0.3)' } },
  { id: 'ocean',         name: 'Ocean',         emoji: '🌊', style: { border: '10px solid #0891b2', borderRadius: 12, boxShadow: '0 0 0 4px #67e8f9, 0 0 30px rgba(8,145,178,0.4)' } },
  { id: 'fire',          name: 'Fire',          emoji: '🔥', style: { border: '10px solid #ef4444', borderRadius: 8, boxShadow: '0 0 0 4px #fbbf24, 0 0 40px rgba(239,68,68,0.5)' } },
  { id: 'polaroid',      name: 'Polaroid',      emoji: '📸', style: { border: '16px solid white', borderBottom: '48px solid white', borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' } },
];

// ── STICKERS ─────────────────────────────────────────────────────────────────
const STICKER_PACKS = {
  '🌿 Nature': ['🌿', '🍃', '🌸', '🌺', '🌻', '🍀', '🌱', '🌾', '🍂', '🌊', '⭐', '✨'],
  '😄 Mood':   ['😊', '😍', '🥰', '😎', '🤩', '😤', '🔥', '💪', '👑', '💯', '🎉', '🎊'],
  '💜 Cute':   ['💜', '🖤', '🤍', '💛', '🩷', '🌈', '🦋', '🐾', '🦫', '🐻', '🍭', '🎀'],
  '⚡ Epic':   ['⚡', '💥', '🗡️', '🛡️', '💎', '👁️', '🌑', '🔮', '⚔️', '🏆', '🎯', '👾'],
};

interface PlacedSticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
}

export default function PhotoboothPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { user } = useAuth();
  const { xp } = usePetStore();
  const { getStats } = useTaskStore();
  const stats = getStats();
  const petStage = getStageForXp(xp);
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Friend';

  const [cameraActive, setCameraActive] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);
  const [mirrored, setMirrored] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [selectedFrame, setSelectedFrame] = useState(FRAMES[0]);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [activePack, setActivePack] = useState('🌿 Nature');
  const [showPet, setShowPet] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [filterPack, setFilterPack] = useState<'aesthetic' | 'mood' | 'dark'>('aesthetic');

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(p => { if (p.avatar_url) setAvatarUrl(p.avatar_url); }).catch(() => {});
    return () => { stopCamera(); };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setCaptured(null);
    } catch {
      toast.error('Camera access denied. Please allow camera permission!');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d')!;

    // Mirror if needed
    if (mirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    if (mirrored) { ctx.setTransform(1, 0, 0, 1, 0, 0); }

    // Apply overlay color if filter has one
    if (selectedFilter.overlay) {
      ctx.fillStyle = selectedFilter.overlay;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCaptured(dataUrl);
    stopCamera();
    toast.success('Photo taken! 📸 Now customize it!');
  }, [mirrored, selectedFilter]);

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);
    const interval = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(interval);
        setCountdown(null);
        takePhoto();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const handleDownload = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const el = document.getElementById('photo-result');
      if (!el) return;
      const canvas = await html2canvas(el, {
        backgroundColor: null, scale: 3, useCORS: true, allowTaint: true, logging: false,
        onclone: doc => { doc.querySelectorAll('img').forEach(img => { img.crossOrigin = 'anonymous'; }); },
      });
      const link = document.createElement('a');
      link.download = `capydo-photo-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Photo saved! 📸');
    } catch { toast.error('Try screenshotting manually!'); }
  };

  const handleShare = async () => {
    const text = `📸 Just used CapyDo Photobooth! 🦫\nCheck it out at capydo.app`;
    if (navigator.share) { await navigator.share({ title: 'CapyDo Photobooth', text }); }
    else { navigator.clipboard.writeText(text); toast.success('Copied!'); }
  };

  // Sticker drag
  const handleStickerMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(`sticker-${id}`);
    if (!el || !overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const stickerRect = el.getBoundingClientRect();
    setDragOffset({ x: e.clientX - stickerRect.left, y: e.clientY - stickerRect.top });
    setDragging(id);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || !overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const y = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
    setPlacedStickers(s => s.map(st => st.id === dragging ? { ...st, x: Math.max(0, Math.min(90, x)), y: Math.max(0, Math.min(90, y)) } : st));
  }, [dragging, dragOffset]);

  const handleMouseUp = useCallback(() => setDragging(null), []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [handleMouseMove, handleMouseUp]);

  const addSticker = (emoji: string) => {
    setPlacedStickers(s => [...s, { id: Date.now().toString(), emoji, x: 10 + Math.random() * 40, y: 10 + Math.random() * 40, size: 36 }]);
  };

  const removeSticker = (id: string) => setPlacedStickers(s => s.filter(st => st.id !== id));

  const filterGroups = {
    aesthetic: FILTERS.slice(0, 6),
    mood: FILTERS.slice(6, 9),
    dark: FILTERS.slice(9),
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold flex items-center gap-2" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
          📸 Photobooth
        </h1>
        <p className="font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Take a photo, add filters & stickers, and share with friends!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── LEFT: CAMERA / RESULT ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Camera viewport */}
          <div className="card p-0 overflow-hidden relative" style={{ aspectRatio: '4/3', backgroundColor: '#0a0a0a' }}>
            {/* Live camera */}
            {cameraActive && (
              <div className="w-full h-full relative" style={{ filter: selectedFilter.css !== 'none' ? selectedFilter.css : undefined }}>
                <video ref={videoRef} autoPlay playsInline muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: mirrored ? 'scaleX(-1)' : 'none' }} />
                {/* Filter overlay */}
                {selectedFilter.overlay && (
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: selectedFilter.overlay, pointerEvents: 'none' }} />
                )}
                {/* Frame overlay on live camera */}
                {selectedFrame.style && (
                  <div style={{ position: 'absolute', inset: 0, ...selectedFrame.style, pointerEvents: 'none' }} />
                )}
                {/* Pet overlay */}
                {showPet && (
                  <div style={{ position: 'absolute', bottom: 12, right: 12, opacity: 0.9 }}>
                    <img src={petStage.image} alt={petStage.name} width={80} height={80} style={{ objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }} />
                  </div>
                )}
              </div>
            )}

            {/* Captured photo */}
            {captured && (
              <div id="photo-result" ref={overlayRef} className="w-full h-full relative select-none"
                style={{ filter: selectedFilter.css !== 'none' ? selectedFilter.css : undefined }}>
                <img src={captured} alt="captured" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                {/* Overlay color */}
                {selectedFilter.overlay && (
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: selectedFilter.overlay, pointerEvents: 'none' }} />
                )}
                {/* Frame */}
                {selectedFrame.style && (
                  <div style={{ position: 'absolute', inset: 0, ...selectedFrame.style, pointerEvents: 'none' }} />
                )}
                {/* Pet */}
                {showPet && (
                  <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
                    <img src={petStage.image} alt={petStage.name} width={80} height={80} style={{ objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }} />
                    <p style={{ color: 'white', fontSize: 9, fontWeight: 800, textAlign: 'center', textShadow: '0 1px 3px rgba(0,0,0,0.8)', marginTop: 2 }}>{petStage.name}</p>
                  </div>
                )}
                {/* Placed stickers */}
                {placedStickers.map(st => (
                  <div key={st.id} id={`sticker-${st.id}`}
                    onMouseDown={e => handleStickerMouseDown(e, st.id)}
                    onDoubleClick={() => removeSticker(st.id)}
                    style={{ position: 'absolute', left: `${st.x}%`, top: `${st.y}%`, fontSize: st.size, cursor: dragging === st.id ? 'grabbing' : 'grab', userSelect: 'none', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))', zIndex: 10 }}
                    title="Drag to move · Double-click to remove">
                    {st.emoji}
                  </div>
                ))}
                {/* Watermark */}
                <div style={{ position: 'absolute', bottom: 8, left: 12, display: 'flex', alignItems: 'center', gap: 4, opacity: 0.7 }}>
                  <span style={{ color: 'white', fontSize: 10, fontWeight: 800, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>🦫 CapyDo</span>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!cameraActive && !captured && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                <div className="text-6xl opacity-30">📷</div>
                <p className="font-bold text-sm opacity-50 text-white">Click "Open Camera" to start</p>
              </div>
            )}

            {/* Countdown overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                <span className="text-white font-extrabold" style={{ fontSize: 120, fontFamily: "'Baloo 2', cursive", textShadow: '0 0 40px white', animation: 'countPulse 1s ease-in-out' }}>
                  {countdown}
                </span>
              </div>
            )}
          </div>

          {/* Camera controls */}
          <div className="flex gap-2 flex-wrap">
            {!cameraActive && !captured && (
              <button onClick={startCamera}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}>
                <Camera size={16} /> Open Camera
              </button>
            )}
            {cameraActive && (
              <>
                <button onClick={takePhoto}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}>
                  <Camera size={16} /> Snap!
                </button>
                <button onClick={startCountdown}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                  3s Timer
                </button>
                <button onClick={() => setMirrored(m => !m)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl transition-all"
                  style={{ backgroundColor: mirrored ? 'var(--accent)' : 'var(--bg-secondary)', color: mirrored ? 'var(--accent-text)' : 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  <FlipHorizontal size={16} />
                </button>
                <button onClick={stopCamera}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl transition-all"
                  style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <X size={16} />
                </button>
              </>
            )}
            {captured && (
              <>
                <button onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}>
                  <Download size={16} /> Download
                </button>
                <button onClick={handleShare}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                  <Share2 size={16} /> Share
                </button>
                <button onClick={() => { setCaptured(null); setPlacedStickers([]); startCamera(); }}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  <RefreshCw size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── RIGHT: CONTROLS ── */}
        <div className="flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: '80vh' }}>

          {/* Filters */}
          <div className="card">
            <h3 className="font-extrabold mb-2" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>🎨 Filters</h3>
            <div className="flex gap-1.5 mb-3">
              {(['aesthetic', 'mood', 'dark'] as const).map(pack => (
                <button key={pack} onClick={() => setFilterPack(pack)}
                  className="text-xs font-bold px-2.5 py-1 rounded-full capitalize transition-all"
                  style={filterPack === pack
                    ? { backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }
                    : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  {pack}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {filterGroups[filterPack].map(f => (
                <button key={f.id} onClick={() => setSelectedFilter(f)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                  style={{
                    backgroundColor: selectedFilter.id === f.id ? 'var(--accent)' : 'var(--bg-secondary)',
                    border: selectedFilter.id === f.id ? 'none' : '1px solid var(--border)',
                    transform: selectedFilter.id === f.id ? 'scale(1.05)' : 'scale(1)',
                  }}>
                  <span style={{ fontSize: 20 }}>{f.emoji}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: selectedFilter.id === f.id ? 'var(--accent-text)' : 'var(--text-muted)' }}>{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Frames */}
          <div className="card">
            <h3 className="font-extrabold mb-3" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>🖼️ Frames</h3>
            <div className="grid grid-cols-4 gap-2">
              {FRAMES.map(f => (
                <button key={f.id} onClick={() => setSelectedFrame(f)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                  style={{
                    backgroundColor: selectedFrame.id === f.id ? 'var(--accent)' : 'var(--bg-secondary)',
                    border: selectedFrame.id === f.id ? 'none' : '1px solid var(--border)',
                    transform: selectedFrame.id === f.id ? 'scale(1.05)' : 'scale(1)',
                  }}>
                  <span style={{ fontSize: 18 }}>{f.emoji}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: selectedFrame.id === f.id ? 'var(--accent-text)' : 'var(--text-muted)' }}>{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pet toggle */}
          <div className="card flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <img src={petStage.image} alt="" width={36} height={36} style={{ objectFit: 'contain' }} />
              <div>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Show {petStage.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your pet in corner</p>
              </div>
            </div>
            <button onClick={() => setShowPet(p => !p)}
              className="relative w-12 h-6 rounded-full transition-colors flex-shrink-0"
              style={{ backgroundColor: showPet ? 'var(--accent)' : 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
                style={{ transform: showPet ? 'translateX(28px)' : 'translateX(4px)' }} />
            </button>
          </div>

          {/* Stickers — only show after photo taken */}
          {captured && (
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>🎭 Stickers</h3>
                {placedStickers.length > 0 && (
                  <button onClick={() => setPlacedStickers([])}
                    className="text-xs font-bold px-2 py-1 rounded-lg"
                    style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                    Clear
                  </button>
                )}
              </div>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Tap to add · Drag to move · Double-tap to remove</p>

              {/* Pack tabs */}
              <div className="flex gap-1 mb-2 flex-wrap">
                {Object.keys(STICKER_PACKS).map(pack => (
                  <button key={pack} onClick={() => setActivePack(pack)}
                    className="text-xs font-bold px-2 py-1 rounded-full transition-all"
                    style={activePack === pack
                      ? { backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }
                      : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    {pack}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-6 gap-1.5">
                {STICKER_PACKS[activePack as keyof typeof STICKER_PACKS].map(emoji => (
                  <button key={emoji} onClick={() => addSticker(emoji)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-xl transition-all hover:scale-125"
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <style>{`
        @keyframes countPulse { 0%{transform:scale(0.5);opacity:0} 50%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  );
}

'use client';
// components/WidgetCustomizer.tsx
// Place at: components/WidgetCustomizer.tsx

import { useState, useRef } from 'react';
import { Settings2, X, GripVertical, Eye, EyeOff, RotateCcw, Check } from 'lucide-react';
import { useWidgetStore, Widget } from '@/hooks/useWidgetStore';

export default function WidgetCustomizer() {
  const { widgets, editMode, toggleWidget, reorder, setEditMode, reset } = useWidgetStore();
  const [isOpen, setIsOpen] = useState(false);

  const sorted = [...widgets].sort((a, b) => a.order - b.order);

  // Drag state
  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverIndex.current = index;
  };

  const handleDrop = () => {
    if (dragIndex.current === null || dragOverIndex.current === null) return;
    if (dragIndex.current !== dragOverIndex.current) {
      reorder(dragIndex.current, dragOverIndex.current);
    }
    dragIndex.current = null;
    dragOverIndex.current = null;
  };

  const enabledCount = widgets.filter((w) => w.enabled).length;

  return (
    <>
      {/* Floating customize button - top right of dashboard */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl transition-all hover:scale-105"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
        }}
        title="Customize Dashboard"
      >
        <Settings2 size={14} />
        Customize
      </button>

      {/* Panel overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div
            className="w-full max-w-sm rounded-2xl animate-bounce-in overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div>
                <h2 className="font-extrabold text-lg" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
                  🏠 Customize Dashboard
                </h2>
                <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {enabledCount} of {widgets.length} widgets shown
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Instructions */}
            <div
              className="px-5 py-2.5 flex items-center gap-2 text-xs font-semibold"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
            >
              <GripVertical size={12} />
              Drag to reorder · Toggle eye to show/hide
            </div>

            {/* Widget list */}
            <div className="px-4 py-3 flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
              {sorted.map((widget, index) => (
                <div
                  key={widget.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={handleDrop}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all cursor-grab active:cursor-grabbing select-none"
                  style={{
                    backgroundColor: widget.enabled ? 'var(--bg-secondary)' : 'transparent',
                    border: `1px solid ${widget.enabled ? 'var(--border-strong)' : 'var(--border)'}`,
                    opacity: widget.enabled ? 1 : 0.5,
                  }}
                >
                  {/* Drag handle */}
                  <GripVertical size={16} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0" />

                  {/* Emoji */}
                  <span className="text-xl flex-shrink-0">{widget.emoji}</span>

                  {/* Label */}
                  <span
                    className="flex-1 font-semibold text-sm"
                    style={{ color: widget.enabled ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  >
                    {widget.label}
                  </span>

                  {/* Order badge */}
                  {widget.enabled && (
                    <span
                      className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--border)', color: 'var(--text-muted)' }}
                    >
                      {index + 1}
                    </span>
                  )}

                  {/* Toggle */}
                  <button
                    onClick={() => toggleWidget(widget.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
                    style={widget.enabled
                      ? { backgroundColor: 'var(--success-bg)', color: 'var(--success)' }
                      : { backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }
                    }
                    title={widget.enabled ? 'Hide widget' : 'Show widget'}
                  >
                    {widget.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <button
                onClick={() => { reset(); }}
                className="flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-xl transition-all"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
              >
                <RotateCcw size={14} /> Reset
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Check size={16} /> Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
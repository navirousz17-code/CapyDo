'use client';
// components/VoiceInput.tsx
// Place at: components/VoiceInput.tsx — REPLACE existing file

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, X, CheckCircle2, Loader2 } from 'lucide-react';
import { useTaskStore } from '@/hooks/useTaskStore';
import toast from 'react-hot-toast';

type State = 'idle' | 'listening' | 'processing' | 'done' | 'error';

interface CreatedTask {
  title: string;
  priority: string;
  due_date: string | null;
}

// Proper TypeScript types for Web Speech API
interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: ISpeechRecognitionErrorEvent) => void) | null;
}

interface ISpeechRecognitionEvent extends Event {
  results: ISpeechRecognitionResultList;
}

interface ISpeechRecognitionResultList {
  length: number;
  item(index: number): ISpeechRecognitionResult;
  [index: number]: ISpeechRecognitionResult;
}

interface ISpeechRecognitionResult {
  length: number;
  item(index: number): ISpeechRecognitionAlternative;
  [index: number]: ISpeechRecognitionAlternative;
  isFinal: boolean;
}

interface ISpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface ISpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface ISpeechRecognitionConstructor {
  new(): ISpeechRecognition;
}

// Check browser support
const getSpeechRecognition = (): ISpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') return null;
  return (
    (window as Window & { SpeechRecognition?: ISpeechRecognitionConstructor }).SpeechRecognition ||
    (window as Window & { webkitSpeechRecognition?: ISpeechRecognitionConstructor }).webkitSpeechRecognition ||
    null
  );
};

export default function VoiceInput() {
  const { fetchTasks } = useTaskStore();
  const [state, setState] = useState<State>('idle');
  const [transcript, setTranscript] = useState('');
  const [createdTask, setCreatedTask] = useState<CreatedTask | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startListening = () => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      toast.error('Voice input not supported in this browser. Try Chrome!');
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setState('listening');

    recognition.onresult = (e: ISpeechRecognitionEvent) => {
      const result = Array.from({ length: e.results.length })
        .map((_, i) => e.results[i][0].transcript)
        .join(' ');
      setTranscript(result);
    };

    recognition.onend = () => {
      const current = recognitionRef.current;
      if (current && transcript.trim()) {
        processTranscript(transcript);
      } else {
        setState('idle');
      }
    };

    recognition.onerror = (e: ISpeechRecognitionErrorEvent) => {
      console.error('Speech error:', e.error);
      setState('error');
      toast.error('Could not hear you. Try again!');
    };

    recognitionRef.current = recognition;
    recognition.start();

    // Auto-stop after 10 seconds
    timeoutRef.current = setTimeout(() => recognition.stop(), 10000);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const processTranscript = async (text: string) => {
    setState('processing');
    try {
      const res = await fetch('/api/voice-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setCreatedTask(data.task);
      setState('done');
      fetchTasks();

      // Auto close after 3 seconds
      timeoutRef.current = setTimeout(() => handleClose(), 3000);
    } catch {
      setState('error');
      toast.error('Failed to create task from voice');
    }
  };

  const handleClose = () => {
    setState('idle');
    setTranscript('');
    setCreatedTask(null);
    setIsOpen(false);
    recognitionRef.current?.stop();
  };

  const handleMicClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      setTranscript('');
      setCreatedTask(null);
      setState('idle');
      setTimeout(() => startListening(), 300);
      return;
    }
    if (state === 'listening') {
      stopListening();
    } else if (state === 'idle') {
      setTranscript('');
      startListening();
    }
  };

  const PRIORITY_COLORS: Record<string, string> = {
    urgent: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
  };

  return (
    <>
      {/* Floating mic button */}
      <div className="fixed bottom-24 right-5 z-40 flex flex-col items-end gap-3">

        {/* Popup card */}
        {isOpen && (
          <div
            className="w-72 rounded-2xl p-4 animate-bounce-in shadow-xl"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-strong)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-sm" style={{ fontFamily: "'Baloo 2', cursive", color: 'var(--text-primary)' }}>
                🎙️ Voice Task
              </span>
              <button onClick={handleClose} style={{ color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>

            {/* State displays */}
            {state === 'idle' && (
              <div className="text-center py-4">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Tap the mic to start speaking
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  e.g. "Add urgent task to finish report tomorrow"
                </p>
              </div>
            )}

            {state === 'listening' && (
              <div className="text-center py-4">
                {/* Sound wave animation */}
                <div className="flex items-center justify-center gap-1 mb-3 h-8">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-full bg-red-400"
                      style={{
                        height: `${8 + i * 4}px`,
                        animation: `soundWave 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-sm font-bold" style={{ color: '#ef4444' }}>Listening...</p>
                {transcript && (
                  <p className="text-xs mt-2 font-medium italic" style={{ color: 'var(--text-secondary)' }}>
                    "{transcript}"
                  </p>
                )}
                <button
                  onClick={stopListening}
                  className="mt-3 text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                >
                  Done speaking
                </button>
              </div>
            )}

            {state === 'processing' && (
              <div className="text-center py-4">
                <Loader2 size={24} className="animate-spin mx-auto mb-2" style={{ color: 'var(--accent)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Creating your task...
                </p>
                {transcript && (
                  <p className="text-xs mt-1 italic" style={{ color: 'var(--text-muted)' }}>
                    "{transcript}"
                  </p>
                )}
              </div>
            )}

            {state === 'done' && createdTask && (
              <div className="animate-slide-up">
                <div
                  className="flex items-start gap-3 p-3 rounded-xl mb-3"
                  style={{ backgroundColor: 'var(--success-bg)' }}
                >
                  <CheckCircle2 size={18} style={{ color: 'var(--success)' }} className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {createdTask.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: (PRIORITY_COLORS[createdTask.priority] ?? '#eab308') + '25',
                          color: PRIORITY_COLORS[createdTask.priority] ?? '#eab308',
                        }}
                      >
                        {createdTask.priority}
                      </span>
                      {createdTask.due_date && (
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                          📅 {createdTask.due_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { setTranscript(''); setState('idle'); startListening(); }}
                  className="w-full text-sm font-bold py-2 rounded-xl transition-all"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                >
                  🎙️ Add another
                </button>
              </div>
            )}

            {state === 'error' && (
              <div className="text-center py-4">
                <p className="text-sm font-semibold text-red-500 mb-3">Something went wrong!</p>
                <button
                  onClick={() => { setState('idle'); startListening(); }}
                  className="text-sm font-bold px-4 py-2 rounded-xl"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mic button */}
        <button
          onClick={handleMicClick}
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95"
          style={{
            backgroundColor: state === 'listening' ? '#ef4444' : 'var(--accent)',
            color: 'var(--accent-text)',
          }}
          title="Voice Task Input"
        >
          {state === 'listening'
            ? <MicOff size={22} />
            : state === 'processing'
              ? <Loader2 size={22} className="animate-spin" />
              : <Mic size={22} />
          }
        </button>
      </div>

      <style jsx>{`
        @keyframes soundWave {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </>
  );
}
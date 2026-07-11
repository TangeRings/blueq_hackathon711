"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import { ChatMessage, ProjectState } from '../types';
import { Send, Sparkles, Loader2, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';

interface FloatingMentorChatProps {
  chatHistory: ChatMessage[];
  projectState: ProjectState;
  onSendMessage: (text: string) => Promise<void>;
  isSending: boolean;
}

type Height = 'collapsed' | 'default' | 'tall';

export default function FloatingMentorChat({
  chatHistory,
  onSendMessage,
  isSending,
}: FloatingMentorChatProps) {
  const [height, setHeight] = useState<Height>('collapsed');
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = height !== 'collapsed';

  useEffect(() => {
    if (isOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isSending, isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 120);
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const toggleOpen = () => setHeight(h => h === 'collapsed' ? 'default' : 'collapsed');
  const toggleTall  = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeight(h => h === 'tall' ? 'default' : 'tall');
  };

  const bodyHeight = height === 'tall' ? 'h-[480px]' : 'h-[240px]';

  return (
    <div className="border-t flex flex-col shrink-0" style={{ background: '#d8dce6', borderColor: '#c4c9d6' }}>
      {/* ── Title bar ── */}
      <div
        className="px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors select-none"
        style={{ background: 'transparent' }}
        onClick={toggleOpen}
      >
        <div className="flex items-center gap-2.5">
          {/* macOS-style dots */}
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Sparkles size={9} className="text-white" />
          </div>
          <span className="text-xs font-semibold tracking-tight" style={{ color: '#1e293b' }}>AI Mentor</span>

          {isSending && isOpen && (
            <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: '#6366f1' }}>
              <Loader2 size={9} className="animate-spin" /> thinking…
            </span>
          )}
          {!isSending && !isOpen && chatHistory.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ color: '#94a3b8', background: '#e2e8f0', border: '1px solid #cbd5e1' }}>
              {chatHistory.length} msg{chatHistory.length !== 1 ? 's' : ''}
            </span>
          )}
          {!isSending && isOpen && (
            <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: '#10b981' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              active
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          {isOpen && (
            <button
              onClick={toggleTall}
              className="p-1.5 rounded transition-colors"
              style={{ color: '#94a3b8' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              title={height === 'tall' ? 'Shrink' : 'Expand'}
            >
              {height === 'tall' ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); toggleOpen(); }}
            className="p-1.5 rounded transition-colors"
            style={{ color: '#94a3b8' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {isOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      {isOpen && (
        <>
          <div className={`${bodyHeight} overflow-y-auto px-5 py-4 space-y-4 transition-all`} style={{ background: '#e4e8f0' }}>

            {chatHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center pb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold" style={{ color: '#1e293b' }}>Start with your idea</p>
                  <p className="text-[11px] max-w-[200px] leading-relaxed" style={{ color: '#64748b' }}>
                    Tell me what you're thinking about building — I'll ask a couple of questions before we lock anything in.
                  </p>
                </div>
              </div>
            )}

            {chatHistory.map((msg) => {
              const isMentor = msg.sender === 'mentor';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isMentor ? 'mr-10' : 'ml-10 flex-row-reverse'}`}
                >
                  <div
                    className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5"
                    style={
                      isMentor
                        ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }
                        : { background: '#e2e8f0', color: '#475569', border: '1px solid #cbd5e1' }
                    }
                  >
                    {isMentor ? 'M' : 'S'}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className={`flex items-center gap-1.5 ${isMentor ? '' : 'flex-row-reverse'}`}>
                      <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>
                        {isMentor ? 'PBL Mentor' : 'You'}
                      </span>
                      <span className="text-[9px] font-mono" style={{ color: '#cbd5e1' }}>{msg.timestamp}</span>
                    </div>
                    <div
                      className="px-3.5 py-2.5 rounded-xl text-xs leading-relaxed break-words"
                      style={
                        isMentor
                          ? { background: '#ffffff', border: '1px solid #e2e8f0', color: '#334155', borderRadius: '2px 12px 12px 12px' }
                          : { background: '#6366f1', color: '#ffffff', borderRadius: '12px 2px 12px 12px' }
                      }
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex gap-2.5 mr-10">
                <div
                  className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  <Loader2 size={10} className="animate-spin text-white" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono block" style={{ color: '#94a3b8' }}>PBL Mentor</span>
                  <div
                    className="px-3.5 py-2.5 text-xs flex items-center gap-1.5"
                    style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#94a3b8', borderRadius: '2px 12px 12px 12px' }}
                  >
                    <span className="flex gap-0.5">
                      {[0, 150, 300].map(d => (
                        <span
                          key={d}
                          className="w-1.5 h-1.5 rounded-full animate-bounce"
                          style={{ background: '#94a3b8', animationDelay: `${d}ms` }}
                        />
                      ))}
                    </span>
                    <span>Thinking…</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 px-4 py-3 border-t"
            style={{ background: '#d8dce6', borderColor: '#c4c9d6' }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSending}
              placeholder={
                isSending
                  ? 'Mentor is thinking…'
                  : chatHistory.length === 0
                    ? "Describe your startup idea to get started…"
                    : "Continue the conversation…"
              }
              className="flex-1 px-3.5 py-2 rounded-lg text-xs focus:outline-none transition-all"
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                color: '#1e293b',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
              onBlur={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0"
              style={{
                background: inputText.trim() && !isSending ? '#6366f1' : '#e2e8f0',
                color: inputText.trim() && !isSending ? '#fff' : '#94a3b8',
              }}
            >
              <Send size={11} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}

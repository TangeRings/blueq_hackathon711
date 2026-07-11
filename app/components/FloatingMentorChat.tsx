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
  projectState,
  onSendMessage,
  isSending,
}: FloatingMentorChatProps) {
  const [height, setHeight] = useState<Height>('collapsed');
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = height !== 'collapsed';

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isSending, isOpen]);

  // Auto-focus input when panel opens
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
    <div className="border-t border-slate-200 bg-white flex flex-col shrink-0">
      {/* ── Title bar (always visible) ── */}
      <div
        className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
        onClick={toggleOpen}
      >
        {/* Left: dots + label */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
            <Sparkles size={8} className="text-white" />
          </div>
          <span className="text-xs font-semibold text-slate-700 tracking-tight">AI Mentor</span>

          {isSending && isOpen && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
              <Loader2 size={9} className="animate-spin" /> thinking…
            </span>
          )}
          {!isSending && !isOpen && chatHistory.length > 0 && (
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              {chatHistory.length} msg{chatHistory.length !== 1 ? 's' : ''}
            </span>
          )}
          {!isSending && isOpen && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              active
            </span>
          )}
        </div>

        {/* Right: resize + collapse */}
        <div className="flex items-center gap-0.5">
          {isOpen && (
            <button
              onClick={toggleTall}
              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title={height === 'tall' ? 'Shrink' : 'Expand'}
            >
              {height === 'tall' ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); toggleOpen(); }}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {isOpen ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
        </div>
      </div>

      {/* ── Collapsible body ── */}
      {isOpen && (
        <>
          {/* Messages */}
          <div className={`${bodyHeight} overflow-y-auto px-5 py-4 space-y-4 bg-slate-50/20 transition-all`}>

            {/* Empty state */}
            {chatHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center pb-4">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shadow">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-700">Start with your idea</p>
                  <p className="text-[11px] text-slate-400 max-w-[200px] leading-relaxed">
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
                  <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center border text-[10px] font-bold mt-0.5 ${
                    isMentor
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}>
                    {isMentor ? 'M' : 'S'}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className={`flex items-center gap-1.5 ${isMentor ? '' : 'flex-row-reverse'}`}>
                      <span className="text-[10px] font-mono text-slate-400">
                        {isMentor ? 'PBL Mentor' : 'You'}
                      </span>
                      <span className="text-[9px] text-slate-300 font-mono">{msg.timestamp}</span>
                    </div>
                    <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed break-words ${
                      isMentor
                        ? 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-xs'
                        : 'bg-slate-900 text-white rounded-tr-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex gap-2.5 mr-10">
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-slate-900 text-white border border-slate-900 mt-0.5">
                  <Loader2 size={10} className="animate-spin" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 block">PBL Mentor</span>
                  <div className="px-3 py-2 rounded-xl bg-white border border-slate-100 text-slate-400 text-xs rounded-tl-sm shadow-xs flex items-center gap-1.5">
                    <span className="flex gap-0.5">
                      {[0, 150, 300].map(d => (
                        <span
                          key={d}
                          className="w-1 h-1 rounded-full bg-slate-300 animate-bounce"
                          style={{ animationDelay: `${d}ms` }}
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

          {/* Input bar */}
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 px-4 py-3 border-t border-slate-100 bg-white"
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
              className="flex-1 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0"
            >
              <Send size={11} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}

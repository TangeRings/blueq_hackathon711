"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import { ChatMessage, ProjectState } from '../types';
import { Send, Sparkles, Loader2, RefreshCw } from 'lucide-react';

interface MentorChatProps {
  chatHistory: ChatMessage[];
  projectState: ProjectState;
  onSendMessage: (text: string) => Promise<void>;
  onStateUpdate?: (updates: any) => void;
  isSending: boolean;
}

export default function MentorChat({ 
  chatHistory, 
  projectState, 
  onSendMessage, 
  onStateUpdate,
  isSending 
}: MentorChatProps) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isSending]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="border border-slate-100 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col h-[380px]">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-white">
            <Sparkles size={11} className="animate-pulse" />
          </div>
          <span className="text-xs font-semibold text-slate-800 font-display tracking-tight">AI Mentor Consultations</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Active Session</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {chatHistory.map((msg) => {
          const isMentor = msg.sender === 'mentor';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isMentor ? 'mr-12' : 'ml-12 flex-row-reverse text-right'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border text-xs font-semibold ${
                isMentor 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                {isMentor ? 'M' : 'S'}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">
                    {isMentor ? 'PBL Mentor' : 'Alex Chen'}
                  </span>
                  <span className="text-[9px] text-slate-300 font-mono">
                    {msg.timestamp || 'Just now'}
                  </span>
                </div>
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed text-left inline-block ${
                  isMentor 
                    ? 'bg-slate-50 border border-slate-100/80 text-slate-800 rounded-tl-xs' 
                    : 'bg-slate-900 text-white rounded-tr-xs'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex gap-3 mr-12 max-w-3xl">
            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-slate-900 text-white border border-slate-900 shadow-sm">
              <Loader2 size={12} className="animate-spin" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400">PBL Mentor</span>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100/80 text-slate-500 text-xs rounded-tl-xs flex items-center gap-2">
                <RefreshCw size={12} className="animate-spin text-slate-400" />
                <span>Analyzing project memory and synthesize feedback...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isSending}
          placeholder={isSending ? "Mentor is writing..." : "Consult Project Mentor... e.g. 'I did 5 more interviews, users want ingredient tracker.'"}
          className="flex-1 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-slate-400 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
        >
          <span>Send</span>
          <Send size={12} />
        </button>
      </form>
    </div>
  );
}

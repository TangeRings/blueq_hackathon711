"use client";

import { CoachingSignal } from '../types';
import { AlertCircle, Circle } from 'lucide-react';

interface CoachingSignalsPanelProps {
  signals?: CoachingSignal[];
}

export default function CoachingSignalsPanel({ signals }: CoachingSignalsPanelProps) {
  const items = signals ?? [];
  if (items.length === 0) return null;

  const detectedCount = items.filter(s => s.detected).length;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
          Common Pitfalls
        </span>
        <span className={`text-[10px] font-mono ${detectedCount > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
          {detectedCount} flagged
        </span>
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed">
        Mistakes the mentor watches for. A pitfall is flagged only when the conversation reveals it.
      </p>

      <div className="space-y-1.5">
        {items.map(sig => (
          <div
            key={sig.id}
            className={`rounded-lg border p-2.5 transition-colors ${
              sig.detected
                ? 'border-rose-300 bg-rose-50/50 ring-1 ring-rose-100'
                : 'border-slate-100 bg-slate-50/30'
            }`}
          >
            <div className="flex items-start gap-2">
              {sig.detected ? (
                <AlertCircle size={13} className="text-rose-500 shrink-0 mt-0.5" />
              ) : (
                <Circle size={13} className="text-slate-300 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 min-w-0">
                <span
                  className={`block text-[11px] leading-snug ${
                    sig.detected ? 'text-rose-700 font-semibold' : 'text-slate-500'
                  }`}
                >
                  {sig.label}
                </span>
                {sig.detected && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-rose-600/90">
                    <span className="text-rose-400">&rarr;</span>
                    {sig.strategyName}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

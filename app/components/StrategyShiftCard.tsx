"use client";

import { StrategyShift } from '../types';
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';

interface StrategyShiftCardProps {
  strategyShift: StrategyShift;
}

function StrategyColumn({
  label,
  strategy,
  completion,
  variant,
}: {
  label: string;
  strategy: string;
  completion: { done: number; total: number };
  variant: 'previous' | 'current';
}) {
  const pct = completion.total > 0 ? Math.round((completion.done / completion.total) * 100) : 0;
  const isCurrent = variant === 'current';

  return (
    <div
      className={`flex-1 rounded-xl border p-4 ${
        isCurrent ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50/60'
      }`}
    >
      <span
        className={`text-[9px] font-mono uppercase tracking-widest ${
          isCurrent ? 'text-emerald-600' : 'text-slate-400'
        }`}
      >
        {label}
      </span>
      <p className="text-xs font-semibold text-slate-800 leading-snug mt-1.5 min-h-[2.5rem]">
        {strategy}
      </p>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Completion</span>
          <span
            className={`text-sm font-bold font-mono ${isCurrent ? 'text-emerald-600' : 'text-rose-500'}`}
          >
            {completion.done}/{completion.total}
          </span>
        </div>
        <div className="h-2 w-full bg-white border border-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isCurrent ? 'bg-emerald-500' : 'bg-rose-400'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function StrategyShiftCard({ strategyShift }: StrategyShiftCardProps) {
  return (
    <div className="rounded-2xl border border-slate-900/10 bg-slate-900 text-white p-5 shadow-lg shadow-slate-900/5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <Sparkles size={15} className="text-emerald-300" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-300">
              Agent Evolution
            </span>
            <span className="flex items-center gap-1 text-[9px] font-mono text-white/50">
              <TrendingUp size={10} /> strategy updated
            </span>
          </div>
          <p className="text-sm font-medium leading-relaxed text-white/95">
            {strategyShift.message}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch gap-3">
        <StrategyColumn
          label="Previous strategy"
          strategy={strategyShift.previous.strategy}
          completion={strategyShift.previous.completion}
          variant="previous"
        />
        <div className="flex md:flex-col items-center justify-center text-white/40 shrink-0">
          <ArrowRight size={18} className="hidden md:block" />
          <ArrowRight size={18} className="md:hidden rotate-90" />
        </div>
        <StrategyColumn
          label="Current strategy"
          strategy={strategyShift.current.strategy}
          completion={strategyShift.current.completion}
          variant="current"
        />
      </div>

      <p className="text-[11px] text-white/50 leading-relaxed border-t border-white/10 pt-3">
        The mentor didn&apos;t just remember what you did — it changed <span className="text-white/80 font-medium">how it teaches you</span>.
      </p>
    </div>
  );
}

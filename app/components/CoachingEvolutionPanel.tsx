"use client";

import { CoachingStep, LearnerPattern } from '../types';
import { TrendingUp, Check, X, Sparkles, ArrowDown } from 'lucide-react';

interface CoachingEvolutionPanelProps {
  coachingEvolution: CoachingStep[];
  learnerPattern?: LearnerPattern;
}

function CompletionBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const isStrong = pct >= 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Completion</span>
        <span className={`text-[10px] font-mono font-semibold ${isStrong ? 'text-emerald-600' : 'text-rose-500'}`}>
          {done}/{total}
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isStrong ? 'bg-emerald-500' : 'bg-rose-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function CoachingEvolutionPanel({
  coachingEvolution,
  learnerPattern,
}: CoachingEvolutionPanelProps) {
  const steps = coachingEvolution ?? [];

  return (
    <div className="space-y-5">
      {/* Strategy evolution timeline */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isPromoted = step.kind === 'promoted';
          const isCurrent = step.kind === 'current';
          const isLast = index === steps.length - 1;

          return (
            <div key={`${step.week}-${step.strategyName}`} className="space-y-3">
              <div
                className={`animate-coach-in rounded-xl border p-3.5 shadow-xs transition-colors ${
                  isPromoted
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : isCurrent
                      ? 'border-amber-300 bg-amber-50/60 ring-1 ring-amber-100'
                      : 'border-slate-100 bg-slate-50/30'
                }`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Week {step.week}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md border uppercase tracking-wide ${
                      isPromoted
                        ? 'bg-emerald-100/70 text-emerald-700 border-emerald-200/60'
                        : isCurrent
                          ? 'bg-amber-400 text-amber-950 border-amber-400'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {isPromoted ? 'Promoted' : isCurrent ? 'Active' : 'Past'}
                  </span>
                </div>

                <h5 className="text-xs font-semibold text-slate-800 tracking-tight flex items-center gap-1.5">
                  {isPromoted && <Sparkles size={12} className="text-emerald-500" />}
                  {isCurrent && <Sparkles size={12} className="text-amber-500" />}
                  {step.strategyName}
                </h5>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{step.strategyDetail}</p>

                <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-2">
                  <div>
                    <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider">Outcome</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">{step.outcome}</p>
                  </div>
                  {step.completion && (
                    <CompletionBar done={step.completion.done} total={step.completion.total} />
                  )}
                </div>
              </div>

              {!isLast && (
                <div className="flex justify-center">
                  <ArrowDown size={14} className="text-slate-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Learner pattern (learned coaching strategy) */}
      {learnerPattern && (
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50/60 to-white p-4 space-y-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-emerald-600" />
            <span className="text-xs font-semibold text-slate-800 tracking-tight">Learned Coaching Pattern</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed italic border-l-2 border-emerald-200 pl-2.5">
            {learnerPattern.summary}
          </p>

          <div className="space-y-2 pt-1">
            <div className="space-y-1">
              {learnerPattern.respondsTo.map((item) => (
                <div key={item} className="flex items-start gap-1.5">
                  <Check size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-600 leading-snug">{item}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1 pt-1 border-t border-slate-100">
              {learnerPattern.avoid.map((item) => (
                <div key={item} className="flex items-start gap-1.5">
                  <X size={12} className="text-rose-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-400 leading-snug line-through decoration-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

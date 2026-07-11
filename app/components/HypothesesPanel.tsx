"use client";

import { Hypothesis } from '../types';
import { HelpCircle, AlertTriangle, CheckCircle, Target } from 'lucide-react';

interface HypothesesPanelProps {
  hypotheses: Hypothesis[];
}

export default function HypothesesPanel({ hypotheses }: HypothesesPanelProps) {
  const getStatusStyle = (status: Hypothesis['status']) => {
    switch (status) {
      case 'Needs validation':
        return {
          bg: 'bg-amber-50/50 text-amber-700 border-amber-100/50',
          dot: 'bg-amber-500',
          icon: <HelpCircle size={14} className="text-amber-500 shrink-0" />
        };
      case 'Partially supported':
        return {
          bg: 'bg-blue-50/50 text-blue-700 border-blue-100/50',
          dot: 'bg-blue-500',
          icon: <Target size={14} className="text-blue-500 shrink-0" />
        };
      case 'Validated':
        return {
          bg: 'bg-emerald-50/50 text-emerald-700 border-emerald-100/50',
          dot: 'bg-emerald-500',
          icon: <CheckCircle size={14} className="text-emerald-500 shrink-0" />
        };
      case 'Challenged':
        return {
          bg: 'bg-rose-50/50 text-rose-700 border-rose-100/50',
          dot: 'bg-rose-500',
          icon: <AlertTriangle size={14} className="text-rose-500 shrink-0" />
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-100',
          dot: 'bg-slate-500',
          icon: <HelpCircle size={14} className="text-slate-500 shrink-0" />
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-mono tracking-wider text-slate-400 uppercase">Current Hypotheses</h4>
        <span className="text-[11px] text-slate-400 font-mono">{hypotheses.length} formulated</span>
      </div>

      {hypotheses.length === 0 ? (
        <div className="h-12 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 flex items-center px-3">
          <span className="text-xs text-slate-400 italic">AI will form hypotheses as you share your idea...</span>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {hypotheses.map((h, index) => {
          const style = getStatusStyle(h.status);
          return (
            <div
              key={h.id || index}
              className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs hover:border-slate-200 hover:shadow-sm transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex items-start gap-2.5">
                <span className="text-xs font-mono font-medium text-slate-400 mt-0.5">H{index + 1}</span>
                <p className="text-sm font-medium text-slate-800 leading-snug">
                  {h.text}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium ${style.bg}`}>
                   {style.icon}
                  <span>{h.status}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono uppercase">
                  {h.status === 'Needs validation' ? 'Requires signal' : 'Active tracking'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}

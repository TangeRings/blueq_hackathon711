"use client";

import { useState } from 'react';
import { Decision, LearningItem, DecisionPathNode, MemorySource, CoachingStep, CoachingSignal, LearnerPattern } from '../types';
import CoachingEvolutionPanel from './CoachingEvolutionPanel';
import CoachingSignalsPanel from './CoachingSignalsPanel';
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Compass,
  History,
  HelpCircle,
  User,
  Brain,
} from 'lucide-react';

interface RightSidebarProps {
  coachingEvolution: CoachingStep[];
  coachingSignals?: CoachingSignal[];
  learnerPattern?: LearnerPattern;
  previousDecisions: Decision[];
  learningMemory: LearningItem[];
  decisionPath: DecisionPathNode[];
  memoryReveal: MemorySource[];
  everosStatus?: 'idle' | 'syncing' | 'synced' | 'error';
}

export default function RightSidebar({
  coachingEvolution,
  coachingSignals,
  learnerPattern,
  previousDecisions,
  learningMemory,
  decisionPath,
  memoryReveal,
  everosStatus = 'idle',
}: RightSidebarProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(prev => (prev === section ? null : section));
  };

  const getDecisionStatusColor = (status: Decision['status']) => {
    switch (status) {
      case 'Active':
        return 'text-emerald-700 bg-emerald-50 border-emerald-100/50';
      case 'Under review':
        return 'text-amber-700 bg-amber-50/50 border-amber-100/50';
      case 'Challenged':
        return 'text-rose-700 bg-rose-50/50 border-rose-100/50';
      case 'Superseded':
        return 'text-slate-500 bg-slate-100 border-slate-200';
    }
  };

  const getSourceIcon = (type: MemorySource['type']) => {
    switch (type) {
      case 'hypothesis':
        return <HelpCircle size={14} className="text-slate-400" />;
      case 'feedback':
        return <User size={14} className="text-slate-400" />;
      case 'interview':
        return <BookOpen size={14} className="text-slate-400" />;
      case 'decision':
        return <Compass size={14} className="text-slate-400" />;
    }
  };

  const everosLabel =
    everosStatus === 'syncing'
      ? 'Syncing…'
      : everosStatus === 'synced'
        ? 'Synced to EverOS'
        : everosStatus === 'error'
          ? 'EverOS offline'
          : 'EverOS memory';

  const everosDot =
    everosStatus === 'syncing'
      ? 'bg-amber-400 animate-pulse'
      : everosStatus === 'synced'
        ? 'bg-emerald-500'
        : everosStatus === 'error'
          ? 'bg-rose-400'
          : 'bg-slate-300';

  return (
    <aside className="w-80 border-l border-slate-200 bg-white flex flex-col h-full shrink-0 overflow-y-auto select-none">
      {/* Sidebar Header */}
      <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between" style={{ background: '#09090b' }}>
        <div className="flex items-center gap-2">
          <Brain size={14} className="text-white/40" />
          <span className="font-display font-semibold tracking-tight text-white text-sm">Coaching Strategy</span>
        </div>
        <span className="flex items-center gap-1.5 text-[9px] font-mono text-white/35 px-1.5 py-0.5 bg-white/8 rounded border border-white/10">
          <span className={`w-1.5 h-1.5 rounded-full ${everosDot}`} />
          {everosLabel}
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Coaching Strategy Evolution — the headline panel */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <History size={13} className="text-slate-400" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Coaching Strategy Evolution
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            How the mentor learned to teach <span className="font-medium text-slate-700">this</span> student.
          </p>

          {coachingSignals && coachingSignals.length > 0 && (
            <div className="pb-1">
              <CoachingSignalsPanel signals={coachingSignals} />
            </div>
          )}

          <CoachingEvolutionPanel
            coachingEvolution={coachingEvolution}
            learnerPattern={learnerPattern}
          />
        </div>

        {/* Secondary: Project memory (collapsed by default) */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Project Memory</span>

          {/* Previous Decisions */}
          <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection('decisions')}
              className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
            >
              <span className="text-xs font-semibold text-slate-700 tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Previous Decisions
              </span>
              {expandedSection === 'decisions' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {expandedSection === 'decisions' && (
              <div className="p-4 bg-white border-t border-slate-100 space-y-3">
                {previousDecisions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No historical decisions documented yet.</p>
                ) : (
                  previousDecisions.map((d) => (
                    <div key={d.id} className="space-y-1.5 p-3 rounded-lg border border-slate-100 bg-slate-50/20 hover:bg-slate-50/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">DECISION</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-mono ${getDecisionStatusColor(d.status)}`}>
                          {d.status === 'Challenged' && '⚠ '} {d.status}
                        </span>
                      </div>
                      <h5 className="text-xs font-semibold text-slate-800 leading-snug">{d.decision}</h5>
                      <div>
                        <span className="block text-[9px] font-mono text-slate-400 uppercase">Reasoning</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{d.reason}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Learning Memory */}
          <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection('learning')}
              className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
            >
              <span className="text-xs font-semibold text-slate-700 tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Learning Memory
              </span>
              {expandedSection === 'learning' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {expandedSection === 'learning' && (
              <div className="p-4 bg-white border-t border-slate-100 space-y-3">
                {learningMemory.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No key learnings recorded yet.</p>
                ) : (
                  <div className="relative space-y-4 pl-3 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[1px] before:bg-slate-100">
                    {learningMemory.map((l) => (
                      <div key={l.id} className="relative space-y-1 text-left">
                        <div className="absolute -left-[15px] top-1 w-2.5 h-2.5 rounded-full bg-slate-200 border-2 border-white ring-1 ring-slate-100" />
                        <span className="text-[10px] font-mono text-slate-400 uppercase block">{l.week}</span>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{l.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Decision Path */}
          <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection('path')}
              className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
            >
              <span className="text-xs font-semibold text-slate-700 tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Decision Path
              </span>
              {expandedSection === 'path' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {expandedSection === 'path' && (
              <div className="p-4 bg-white border-t border-slate-100">
                <div className="relative space-y-3 pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-100">
                  {decisionPath.map((node) => {
                    const isAction = node.type === 'action';
                    const isEvidence = node.type === 'evidence';
                    return (
                      <div key={node.id} className="relative flex items-center gap-2">
                        <div className={`absolute -left-[14.5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ring-1 ${
                          isAction
                            ? 'bg-blue-600 ring-blue-100'
                            : isEvidence
                              ? 'bg-rose-500 ring-rose-100'
                              : 'bg-slate-800 ring-slate-100'
                        }`} />
                        <span className={`text-[11px] font-medium leading-relaxed ${
                          isAction
                            ? 'text-blue-700 font-semibold bg-blue-50/60 px-2 py-0.5 rounded-md border border-blue-100/50'
                            : isEvidence
                              ? 'text-rose-700 font-semibold bg-rose-50/60 px-2 py-0.5 rounded-md border border-rose-100/50'
                              : 'text-slate-600'
                        }`}>
                          {node.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Memory Reveal */}
          <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
            <button
              onClick={() => toggleSection('reveal')}
              className="w-full px-4 py-3 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
            >
              <span className="text-xs font-semibold text-slate-700 tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Why this guidance?
              </span>
              {expandedSection === 'reveal' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {expandedSection === 'reveal' && (
              <div className="p-4 bg-white border-t border-slate-100 space-y-1.5">
                {memoryReveal.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/40 border border-slate-100"
                  >
                    <div className="w-5 h-5 rounded-md bg-white flex items-center justify-center border border-slate-100 shrink-0">
                      {getSourceIcon(source.type)}
                    </div>
                    <span className="text-xs text-slate-600 font-medium truncate">{source.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

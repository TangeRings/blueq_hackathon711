"use client";

import { ProjectState } from '../types';
import StrategyShiftCard from './StrategyShiftCard';
import CoachingEvolutionPanel from './CoachingEvolutionPanel';
import CoachingSignalsPanel from './CoachingSignalsPanel';
import {
  CalendarDays,
  Users,
  Brain,
  AlertCircle,
  History,
  MessageSquareQuote,
  BookOpen,
  Compass,
} from 'lucide-react';

interface Week3DashboardProps {
  state: ProjectState;
}

function StatCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone: 'blue' | 'emerald' | 'amber' | 'rose';
}) {
  const tones = {
    blue: 'from-blue-50 to-white border-blue-100 text-blue-600',
    emerald: 'from-emerald-50 to-white border-emerald-100 text-emerald-600',
    amber: 'from-amber-50 to-white border-amber-100 text-amber-600',
    rose: 'from-rose-50 to-white border-rose-100 text-rose-500',
  }[tone];

  return (
    <div className={`animate-coach-in rounded-2xl border bg-gradient-to-b p-4 shadow-xs ${tones}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      <div className="mt-2 text-3xl font-bold font-display tracking-tight text-slate-900">{value}</div>
      <div className="mt-0.5 text-[11px] text-slate-500 leading-snug">{sub}</div>
    </div>
  );
}

export default function Week3Dashboard({ state }: Week3DashboardProps) {
  const interviews = state.strategyShift?.current.completion ?? { done: 5, total: 5 };
  const strategiesAdapted = state.coachingEvolution.length;
  const pitfallsCaught = (state.coachingSignals ?? []).filter(s => s.detected).length;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/40">
      <div className="max-w-6xl mx-auto w-full p-8 space-y-6">
        {/* Hero */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Capstone Review · Week 3
            </span>
            <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900 mt-1">
              {state.projectName || 'Project'} — Progress Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              How <span className="font-semibold text-slate-700">Alex</span> progressed, and how the mentor learned to coach them.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Milestone</span>
            <span className="text-xs font-semibold text-slate-800 text-right max-w-[16rem] leading-snug">
              {state.milestone}
            </span>
            <span className="mt-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              {state.milestoneStatus}
            </span>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<CalendarDays size={14} className="text-blue-500" />}
            label="Weeks Tracked"
            value="3"
            sub="Discovery → Follow-up → Review"
            tone="blue"
          />
          <StatCard
            icon={<Users size={14} className="text-emerald-500" />}
            label="User Interviews"
            value={`${interviews.done}/${interviews.total}`}
            sub="Real target users, after being pressed"
            tone="emerald"
          />
          <StatCard
            icon={<Brain size={14} className="text-amber-500" />}
            label="Strategies Adapted"
            value={String(strategiesAdapted)}
            sub="Coaching moves the mentor tried"
            tone="amber"
          />
          <StatCard
            icon={<AlertCircle size={14} className="text-rose-500" />}
            label="Pitfalls Caught"
            value={String(pitfallsCaught)}
            sub="Common mistakes diagnosed live"
            tone="rose"
          />
        </div>

        {/* Agent evolution WOW */}
        {state.strategyShift && <StrategyShiftCard strategyShift={state.strategyShift} />}

        {/* Two-column: strategy evolution + pitfalls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <History size={14} className="text-slate-400" />
              <h3 className="text-sm font-semibold font-display tracking-tight text-slate-900">
                Coaching Strategy Evolution
              </h3>
            </div>
            <CoachingEvolutionPanel
              coachingEvolution={state.coachingEvolution}
              learnerPattern={state.learnerPattern}
            />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-4">
            <CoachingSignalsPanel signals={state.coachingSignals} />
          </div>
        </div>

        {/* Learning journey + decisions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-slate-400" />
              <h3 className="text-sm font-semibold font-display tracking-tight text-slate-900">Learning Journey</h3>
            </div>
            {state.learningMemory.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No learnings recorded.</p>
            ) : (
              <div className="relative space-y-4 pl-3 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[1px] before:bg-slate-100">
                {state.learningMemory.map(l => (
                  <div key={l.id} className="relative space-y-1">
                    <div className="absolute -left-[15px] top-1 w-2.5 h-2.5 rounded-full bg-blue-400 border-2 border-white ring-1 ring-blue-100" />
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">{l.week}</span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{l.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Compass size={14} className="text-slate-400" />
              <h3 className="text-sm font-semibold font-display tracking-tight text-slate-900">Key Decisions</h3>
            </div>
            {state.previousDecisions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No decisions recorded.</p>
            ) : (
              <div className="space-y-2.5">
                {state.previousDecisions.map(d => (
                  <div key={d.id} className="rounded-xl border border-slate-100 bg-slate-50/40 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-400 uppercase">Decision</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md border bg-emerald-50 text-emerald-700 border-emerald-100">
                        {d.status}
                      </span>
                    </div>
                    <h5 className="text-xs font-semibold text-slate-800 leading-snug">{d.decision}</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{d.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Teacher comment */}
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/70 to-white p-6 shadow-xs flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center border border-violet-200 text-violet-700 font-semibold shrink-0 shadow-sm">
            SJ
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquareQuote size={14} className="text-violet-500" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-violet-500">Mentor Comment</span>
            </div>
            <blockquote className="text-sm md:text-base text-slate-700 font-medium italic leading-relaxed">
              &ldquo;{state.teacherFeedback.text}&rdquo;
            </blockquote>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-800">{state.teacherFeedback.author}</span>
              <span className="text-[10px] font-mono text-slate-400">•</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">{state.teacherFeedback.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

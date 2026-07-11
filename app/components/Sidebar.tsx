"use client";

import { User, CheckCircle2, Zap } from 'lucide-react';

interface SidebarProps {
  currentWeek: number;
  onSelectWeek: (week: number) => void;
  completedWeeks: number[];
}

export default function Sidebar({ currentWeek, onSelectWeek, completedWeeks }: SidebarProps) {
  const weeks = [
    {
      num: 1,
      label: 'Discovery',
      subtext: 'Idea stage & broad open discovery',
      accent: '#3b82f6',       // blue
      badge: null,
    },
    {
      num: 2,
      label: 'Follow-up',
      subtext: 'Evidence-first coaching kicks in',
      accent: '#f59e0b',       // amber
      badge: null,
    },
    {
      num: 3,
      label: 'Dashboard',
      subtext: 'Personalized intervention & evolution',
      accent: '#10b981',       // emerald
      badge: 'CURRENT',
    },
  ];

  const velocity = currentWeek === 1 ? 33 : currentWeek === 2 ? 66 : 100;
  const velocityColor = currentWeek === 1 ? '#3b82f6' : currentWeek === 2 ? '#f59e0b' : '#10b981';

  return (
    <aside
      className="w-72 flex flex-col h-full shrink-0 select-none border-r"
      style={{ background: '#0f172a', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      {/* ── Brand Header ── */}
      <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg"
            style={{ background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)' }}
          >
            M
          </div>
          <span className="font-bold tracking-tight text-white text-base">Project Mentor</span>
          <span
            className="text-[9px] font-mono px-1.5 py-0.5 rounded ml-auto"
            style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}
          >
            PBL v1.4
          </span>
        </div>
      </div>

      {/* ── Student Card ── */}
      <div
        className="mx-4 mt-4 rounded-xl p-3.5"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
      >
        <p className="text-[9px] font-mono tracking-widest uppercase mb-3" style={{ color: '#64748b' }}>
          Student Information
        </p>
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <User size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Alex Chen</p>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Stanford Garage · Cohort 12</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div
            className="rounded-lg px-2.5 py-2"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-[9px] font-mono uppercase" style={{ color: '#64748b' }}>Tracking</p>
            <p className="text-[11px] font-medium mt-0.5" style={{ color: '#cbd5e1' }}>EdTech / SaaS</p>
          </div>
          <div
            className="rounded-lg px-2.5 py-2"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <p className="text-[9px] font-mono uppercase" style={{ color: '#34d399' }}>Status</p>
            <p className="text-[11px] font-semibold mt-0.5" style={{ color: '#34d399' }}>Iterating</p>
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-2">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[9px] font-mono tracking-widest uppercase" style={{ color: '#64748b' }}>
            Project Timeline
          </p>
          <span className="text-[9px] font-mono" style={{ color: '#475569' }}>Weeks 1–3</span>
        </div>

        <div className="space-y-1.5">
          {weeks.map((w) => {
            const isSelected = currentWeek === w.num;
            const isCompleted = completedWeeks.includes(w.num) && !isSelected;

            return (
              <button
                key={w.num}
                id={`timeline-week-${w.num}`}
                onClick={() => onSelectWeek(w.num)}
                className="w-full text-left rounded-xl flex items-start gap-3 p-3 transition-all duration-200"
                style={
                  isSelected
                    ? {
                        background: 'rgba(255,255,255,0.07)',
                        border: `1px solid ${w.accent}55`,
                        boxShadow: `0 0 0 1px ${w.accent}22`,
                      }
                    : {
                        background: 'transparent',
                        border: '1px solid transparent',
                      }
                }
                onMouseEnter={e => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={e => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {/* Number badge */}
                <div
                  className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                  style={
                    isSelected
                      ? { background: w.accent, color: '#0f172a' }
                      : isCompleted
                        ? { background: 'rgba(255,255,255,0.1)', color: '#94a3b8' }
                        : { background: 'rgba(255,255,255,0.06)', color: '#64748b', border: '1px solid rgba(255,255,255,0.1)' }
                  }
                >
                  {isCompleted
                    ? <CheckCircle2 size={13} style={{ color: '#94a3b8' }} />
                    : w.num
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className="text-[9px] font-mono uppercase tracking-wider"
                      style={{ color: isSelected ? '#94a3b8' : '#475569' }}
                    >
                      Week {w.num}
                    </span>
                    {w.badge && (
                      <span
                        className="text-[8px] font-mono px-1.5 py-0.5 rounded-full"
                        style={{ background: `${w.accent}22`, color: w.accent, border: `1px solid ${w.accent}44` }}
                      >
                        {w.badge}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-sm font-semibold mt-0.5"
                    style={{ color: isSelected ? '#f1f5f9' : '#94a3b8' }}
                  >
                    {w.label}
                  </p>
                  <p
                    className="text-[11px] mt-0.5 leading-relaxed"
                    style={{ color: isSelected ? '#64748b' : '#334155' }}
                  >
                    {w.subtext}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Velocity Footer ── */}
      <div className="px-4 pb-5 pt-2">
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Zap size={10} style={{ color: '#64748b' }} />
              <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: '#64748b' }}>
                Project Velocity
              </p>
            </div>
            <p className="text-xs font-bold font-mono" style={{ color: velocityColor }}>
              {velocity}%
            </p>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${velocity}%`, background: velocityColor }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

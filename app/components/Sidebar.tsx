"use client";

import { User, CheckCircle2, Circle } from 'lucide-react';

interface SidebarProps {
  currentWeek: number;
  onSelectWeek: (week: number) => void;
  completedWeeks: number[];
}

export default function Sidebar({ currentWeek, onSelectWeek, completedWeeks }: SidebarProps) {
  const weeks = [
    { num: 1, label: 'Discovery', subtext: 'Idea stage & broad open discovery' },
    { num: 2, label: 'Prototype', subtext: 'Evidence-first coaching kicks in' },
    { num: 3, label: 'Interviews', subtext: 'Personalized intervention & evolution' },
  ];

  return (
    <aside className="w-80 border-r border-slate-100 bg-white flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-white font-mono text-xs font-bold shadow-xs">
            M
          </div>
          <span className="font-display font-semibold tracking-tight text-slate-900 text-lg">Project Mentor</span>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded ml-auto">PBL v1.4</span>
        </div>
      </div>

      {/* Student Profile Info */}
      <div className="p-6 border-b border-slate-50 bg-slate-50/30">
        <h3 className="text-xs font-mono tracking-wider text-slate-400 uppercase mb-3">Student Information</h3>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
            <User size={16} className="text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-slate-900 truncate">Alex Chen</h4>
            <p className="text-xs text-slate-500 truncate">Stanford Garage • Cohort 12</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="bg-white border border-slate-100 p-2 rounded-lg shadow-sm">
            <span className="block text-[10px] text-slate-400 font-mono">TRACKING</span>
            <span className="text-xs font-medium text-slate-700">EdTech / SaaS</span>
          </div>
          <div className="bg-white border border-slate-100 p-2 rounded-lg shadow-sm">
            <span className="block text-[10px] text-slate-400 font-mono">PROJECT STATUS</span>
            <span className="text-xs font-medium text-emerald-600">Iterating</span>
          </div>
        </div>
      </div>

      {/* Project Timeline Navigation */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-mono tracking-wider text-slate-400 uppercase">Project Timeline</h3>
          <span className="text-[11px] text-slate-400 font-mono">Weeks 1–3</span>
        </div>

        <div className="space-y-1 relative">
          {/* Vertical connecting line */}
          <div className="absolute left-4 top-2 bottom-2 w-[1px] bg-slate-100 -z-10" />

          {weeks.map((w) => {
            const isSelected = currentWeek === w.num;
            const isCompleted = completedWeeks.includes(w.num);

            return (
              <button
                key={w.num}
                id={`timeline-week-${w.num}`}
                onClick={() => onSelectWeek(w.num)}
                className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all duration-200 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/5 ring-1 ring-slate-950/5'
                    : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted && !isSelected ? (
                    <CheckCircle2 size={16} className="text-slate-400 fill-slate-50" />
                  ) : isSelected ? (
                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                    </div>
                  ) : (
                    <Circle size={16} className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      Week {w.num}
                    </span>
                    {w.num === 3 && (
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full font-mono ${
                        isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        Current
                      </span>
                    )}
                  </div>
                  <h4 className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {w.label}
                  </h4>
                  <p className={`text-xs mt-0.5 line-clamp-1 leading-relaxed ${
                    isSelected ? 'text-slate-300/80' : 'text-slate-500'
                  }`}>
                    {w.subtext}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Project Velocity Footer */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/10">
        <div className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[10px] text-slate-400 font-mono uppercase">Project Velocity</p>
            <p className="text-[10px] text-blue-600 font-bold font-mono">
              {currentWeek === 1 ? '33%' : currentWeek === 2 ? '66%' : '100%'}
            </p>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: currentWeek === 1 ? '33%' : currentWeek === 2 ? '66%' : '100%' }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

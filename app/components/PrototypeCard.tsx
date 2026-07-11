"use client";

import { useState } from 'react';
import { RefreshCw, Apple, TrendingDown, Clock, Leaf } from 'lucide-react';

export default function PrototypeCard() {
  const [activeDay, setActiveDay] = useState('Mon');
  const [isGenerating, setIsGenerating] = useState(false);
  const [groceryItems, setGroceryItems] = useState([
    { id: 'g1', name: 'Fresh Organic Spinach (300g)', checked: true, category: 'Produce' },
    { id: 'g2', name: 'Wild Caught Salmon Fillets (2x)', checked: false, category: 'Protein' },
    { id: 'g3', name: 'Chickpeas (2 cans, 400g)', checked: false, category: 'Pantry' },
    { id: 'g4', name: 'Fresh Asparagus (1 bunch)', checked: true, category: 'Produce' }
  ]);

  const days = [
    { key: 'Mon', meal: 'Spiced Chickpea & Avocado Bowl', cal: '520 kcal', prep: '15m' },
    { key: 'Tue', meal: 'Sheet-Pan Garlic Salmon & Asparagus', cal: '610 kcal', prep: '25m' },
    { key: 'Wed', meal: 'Quinoa Veggie Harvest Bowl', cal: '480 kcal', prep: '20m' },
    { key: 'Thu', meal: 'Lemon Asparagus Pasta', cal: '550 kcal', prep: '15m' },
    { key: 'Fri', meal: 'Leftover Fusion Stir-Fry', cal: '430 kcal', prep: '10m' }
  ];

  const activeMealInfo = days.find(d => d.key === activeDay) || days[0];

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1200);
  };

  const toggleGrocery = (id: string) => {
    setGroceryItems(prev =>
      prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300">
      {/* Prototype Window Header (Notion/Vercel browser style) */}
      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          <span className="text-[11px] font-mono text-slate-400 ml-2">app.aimealplanner.io/dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded">v0.2-proto</span>
        </div>
      </div>

      <div className="p-5 flex flex-col md:flex-row gap-5">
        {/* Planner Left Panel */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">AI RECOMMENDATION</span>
              <h4 className="text-base font-semibold text-slate-900 tracking-tight">Weekly Meal Schedule</h4>
            </div>
            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="p-1.5 hover:bg-slate-50 rounded-lg border border-slate-100 text-slate-500 hover:text-slate-950 transition-colors flex items-center gap-1 text-xs"
              title="Regenerate dynamic meal plan"
            >
              <RefreshCw size={12} className={isGenerating ? 'animate-spin' : ''} />
              <span className="font-mono text-[10px]">Re-plan</span>
            </button>
          </div>

          {/* Weekday Selector */}
          <div className="grid grid-cols-5 gap-1 bg-slate-50 p-1 rounded-xl">
            {days.map((day) => (
              <button
                key={day.key}
                onClick={() => setActiveDay(day.key)}
                className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeDay === day.key
                    ? 'bg-white text-slate-950 shadow-xs border border-slate-100/50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {day.key}
              </button>
            ))}
          </div>

          {/* Active Meal Details */}
          <div className={`p-4 rounded-xl border border-slate-100 bg-slate-50/30 transition-all duration-300 relative overflow-hidden ${
            isGenerating ? 'opacity-40 scale-98' : 'opacity-100 scale-100'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full mb-1.5">
                  <Leaf size={10} /> Eco-friendly option
                </span>
                <h5 className="text-sm font-semibold text-slate-800 line-clamp-1">
                  {activeMealInfo.meal}
                </h5>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Apple size={12} className="text-slate-400" />
                {activeMealInfo.cal}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-slate-400" />
                {activeMealInfo.prep}
              </span>
            </div>

            {/* Simulated background wave */}
            <div className="absolute right-0 bottom-0 top-0 w-24 bg-gradient-to-l from-slate-50/50 to-transparent pointer-events-none" />
          </div>

          {/* Impact Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-50/40 border border-emerald-100/50 p-2.5 rounded-xl flex items-center gap-2">
              <TrendingDown className="text-emerald-600" size={16} />
              <div>
                <span className="block text-[9px] font-mono text-emerald-700/80 uppercase">WASTE REDUCTION</span>
                <span className="text-xs font-semibold text-emerald-800">-42% Est. Waste</span>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center gap-2">
              <Clock className="text-slate-600" size={16} />
              <div>
                <span className="block text-[9px] font-mono text-slate-500 uppercase">TIME SAVED</span>
                <span className="text-xs font-semibold text-slate-700">~2.5 hrs / week</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-[1px] bg-slate-100 self-stretch hidden md:block" />

        {/* Planner Right Panel - Auto Grocery List */}
        <div className="w-full md:w-56 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">AUTO-GROCERY LIST</span>
              <span className="text-[10px] font-mono text-slate-500">
                {groceryItems.filter(i => i.checked).length}/{groceryItems.length} checked
              </span>
            </div>

            <div className="space-y-1.5">
              {groceryItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleGrocery(item.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                    item.checked
                      ? 'bg-slate-50 border-slate-100 text-slate-400 line-through'
                      : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-all ${
                    item.checked
                      ? 'bg-slate-900 border-slate-900'
                      : 'border-slate-300 bg-white'
                  }`}>
                    {item.checked && (
                      <div className="w-1.5 h-1.5 bg-white rounded-2xs" />
                    )}
                  </div>
                  <span className="truncate flex-1">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="bg-slate-50/50 p-2 rounded-lg text-[10px] text-slate-500 leading-relaxed font-mono flex items-start gap-1">
              <span className="text-slate-400">•</span>
              <span>Based on ingredients shared across recipes to prevent half-used boxes going bad.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

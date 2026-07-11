"use client";

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HypothesesPanel from './components/HypothesesPanel';
import RightSidebar from './components/RightSidebar';
import FloatingMentorChat from './components/FloatingMentorChat';
import Week3Dashboard from './components/Week3Dashboard';
import { initialTimelineData } from './data';
import { ProjectState, ChatMessage, CoachingStep, CoachingSignal } from './types';
import { RefreshCw, AlertCircle, FileText, Lightbulb, CheckSquare, Square, Sparkles } from 'lucide-react';

const STUDENT_USER_ID = 'student_alex_demo';

type EverosStatus = 'idle' | 'syncing' | 'synced' | 'error';

// Keyword detectors for each common PBL pitfall (keyed by CoachingSignal.id).
// A signal only flips to "detected" when the student's message matches — the
// mentor never presupposes which mistake the student will make.
const SIGNAL_DETECTORS: Record<string, RegExp> = {
  'incomplete-research':
    /\b(0|1|2|3|4|zero|one|two|three|four|a couple|a few|only|just|didn'?t|couldn'?t|haven'?t|not yet|none|nobody|barely|ran out of time)\b/i,
  'only-friends':
    /\b(friends?|family|families|grandparents?|grandma|grandpa|grandmother|grandfather|grand(dad|ad)|my (mom|dad|parents?|sister|brother|roommate|girlfriend|boyfriend|wife|husband|son|daughter|kids?|cousins?|uncle|aunt|neighbou?r)|classmates?|co-?workers?|colleagues?)\b/i,
  'ui-first':
    /\b(looks? (cool|good|nice|great|pretty|clean|amazing)|love[ds]? the (design|ui|interface|look)|the (design|ui|interface)\b|nice design|cool app|clean (ui|design))\b/i,
  'opinions-not-behavior':
    /\b(would use|they'?d use|i think (they|people)|sounds (good|cool|great|useful|helpful)|they (said|think|agreed) (it'?s|they) (cool|good|great|useful|nice|need|want)|agreed they (need|want)|seems useful)\b/i,
  'built-too-early':
    /\b(built|coded|i (have |already )?(made|designed|built|created)|already (made|built|designed)|started building|wrote the code|finished the (app|prototype)|(the )?prototype is|design(ed)? the app|made (an|the) app|want to see (it|the app|my app|my design)|show you the (app|design))\b/i,
};

// Priority order: when several pitfalls match at once, the highest-priority one
// drives which coaching strategy the mentor adopts this turn.
const SIGNAL_PRIORITY = [
  'incomplete-research',
  'only-friends',
  'ui-first',
  'opinions-not-behavior',
  'built-too-early',
];

function excludesAll(text: string): boolean {
  return !/\ball (5|five|of them|done)\b/i.test(text);
}

// Best-effort parse of how many people the student actually reached (0-5),
// so the completion bar reflects what they said rather than a hardcoded number.
function parseReachedCount(text: string): number {
  const lower = text.toLowerCase();
  const words: Array<[RegExp, number]> = [
    [/\b(zero|none|nobody|didn'?t|couldn'?t|haven'?t|not yet)\b/, 0],
    [/\bone\b/, 1],
    [/\b(two|a couple)\b/, 2],
    [/\b(three|a few)\b/, 3],
    [/\bfour\b/, 4],
  ];
  for (const [re, n] of words) if (re.test(lower)) return n;
  const digit = lower.match(/\b([0-5])\b/);
  if (digit) return parseInt(digit[1], 10);
  return 2;
}

// Which pitfalls does this student message reveal? Returns matched signal ids.
function detectSignals(text: string): string[] {
  if (!excludesAll(text)) return [];
  return Object.entries(SIGNAL_DETECTORS)
    .filter(([, re]) => re.test(text))
    .map(([id]) => id);
}

// Diagnose the student's message against the pitfall checklist, flag any newly
// matched pitfalls, and advance the coaching strategy to match the highest
// priority new one. Returns updated signals + evolution, or null if nothing new.
function applyCoachingSignals(
  state: ProjectState,
  text: string
): { coachingSignals: CoachingSignal[]; coachingEvolution: CoachingStep[] } | null {
  const signals = state.coachingSignals ?? [];
  if (signals.length === 0) return null;

  const matched = detectSignals(text);
  const newly = matched.filter(id => !signals.find(s => s.id === id)?.detected);
  if (newly.length === 0) return null;

  const updatedSignals = signals.map(s =>
    newly.includes(s.id) ? { ...s, detected: true } : s
  );

  const topId = SIGNAL_PRIORITY.find(id => newly.includes(id)) ?? newly[0];
  const topSig = signals.find(s => s.id === topId)!;
  const reached = parseReachedCount(text);

  // Retire the initial Trusting Delegation default once any pitfall surfaces,
  // stamping it with the diagnosed outcome (and a completion bar for the
  // research pitfall). Previously-adopted strategies stay active so several can
  // run at once — one active strategy per flagged pitfall.
  const evolution: CoachingStep[] = state.coachingEvolution.map(s =>
    s.kind === 'current' && s.strategyName === 'Trusting Delegation'
      ? {
          ...s,
          kind: 'past' as const,
          outcome: topSig.priorOutcome.replace('{n}', String(reached)),
          completion: topSig.hasCompletion ? { done: reached, total: 5 } : s.completion,
        }
      : s
  );

  // Append an active strategy card for every newly detected pitfall (priority order).
  for (const id of SIGNAL_PRIORITY.filter(sid => newly.includes(sid))) {
    const sig = signals.find(s => s.id === id)!;
    if (evolution.some(st => st.strategyName === sig.strategyName)) continue;
    evolution.push({
      week: state.week,
      strategyName: sig.strategyName,
      strategyDetail: sig.strategyDetail,
      outcome: 'Active strategy — adopted in response to what the student just revealed.',
      kind: 'current',
    });
  }

  return { coachingSignals: updatedSignals, coachingEvolution: evolution };
}

// Offline simulator replies keyed by the diagnosed pitfall, so the demo works
// (and stays on-message) even when DeepSeek is unreachable.
const SIGNAL_SIM_REPLIES: Record<string, string> = {
  'incomplete-research':
    "Hold on — you set out to talk to 5 people. Who exactly did you reach, and were they real target users or just friends? What stopped you from getting to the rest, and when will you finish them this week?",
  'only-friends':
    "Friends will almost always say they like it. Who can you find that actually has this problem and isn't in your circle? Name one person and when you'll talk to them.",
  'ui-first':
    "Careful — \"it looks cool\" is about the design, not whether the problem is real. What did they say about the problem itself — do they actually struggle with this today?",
  'opinions-not-behavior':
    "\"Would use it\" is a guess. Ask them instead: the last time they hit this problem, what did they actually do? Real behavior beats opinions.",
  'built-too-early':
    "Let's slow the build down. Before more code — what evidence do you have that this problem is real for someone besides you?",
};

export default function Home() {
  const [timelineData, setTimelineData] = useState<Record<number, ProjectState>>(() => 
    JSON.parse(JSON.stringify(initialTimelineData))
  );
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [everosStatus, setEverosStatus] = useState<EverosStatus>('idle');

  // Completed weeks for sidebar indicators
  const completedWeeks = [1, 2];

  const activeState = timelineData[currentWeek];

  // Best-effort: write each week's coaching "case" to EverOS agent memory as
  // the demo advances, and retrieve prior cases. This proves real integration
  // but the narrative never blocks on it — authored data is the source of truth.
  useEffect(() => {
    const state = timelineData[currentWeek];
    if (!state) return;

    let cancelled = false;
    setEverosStatus('syncing');

    const currentStep = state.coachingEvolution.find(s => s.kind === 'current' || s.kind === 'promoted');
    const situation = `Week ${state.week} (${state.weekName}). Student said: "${
      state.chatHistory.find(m => m.sender === 'student')?.text ?? state.summary
    }"`;
    const intervention = currentStep
      ? `Coaching strategy "${currentStep.strategyName}": ${currentStep.strategyDetail}`
      : state.summary;
    const outcome = currentStep?.outcome ?? state.summary;

    const messages = [
      { role: 'user' as const, content: situation },
      { role: 'assistant' as const, content: intervention },
      { role: 'user' as const, content: `Outcome observed: ${outcome}` },
    ];

    const sync = async () => {
      try {
        const writeResp = await fetch('/api/agent-memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: STUDENT_USER_ID,
            sessionId: `week_${state.week}`,
            messages,
          }),
        });
        const writeJson = await writeResp.json();
        if (cancelled) return;

        if (!writeJson.ok) {
          setEverosStatus('error');
          return;
        }

        // Retrieve prior coaching cases to demonstrate real recall.
        await fetch(
          `/api/agent-memory?userId=${encodeURIComponent(STUDENT_USER_ID)}&query=${encodeURIComponent(
            'how should I coach this student'
          )}`
        ).catch(() => null);

        if (!cancelled) setEverosStatus('synced');
      } catch {
        if (!cancelled) setEverosStatus('error');
      }
    };

    sync();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek]);

  const handleSelectWeek = (week: number) => {
    // Carry the live project state forward. When entering a later week that has
    // no project of its own yet, seed its title + to-do list (and hypotheses /
    // decisions / learning) from the nearest earlier week that has them. This is
    // what makes the demo feel continuous: whatever Week 1 produced live shows up
    // in Weeks 2/3 instead of hardcoded placeholder data. Guarded on an empty
    // projectName so it only seeds once and never clobbers live edits.
    setTimelineData(prev => {
      const target = prev[week];
      if (!target || target.projectName) return prev;

      let src: ProjectState | undefined;
      for (let w = week - 1; w >= 1; w--) {
        if (prev[w]?.projectName) {
          src = prev[w];
          break;
        }
      }
      if (!src) return prev;

      return {
        ...prev,
        [week]: {
          ...target,
          projectName: src.projectName,
          actionItems: src.actionItems,
          hypotheses: target.hypotheses.length ? target.hypotheses : src.hypotheses,
          previousDecisions: target.previousDecisions.length
            ? target.previousDecisions
            : src.previousDecisions,
          learningMemory: target.learningMemory.length
            ? target.learningMemory
            : src.learningMemory,
        },
      };
    });
    setCurrentWeek(week);
    setErrorMessage(null);
  };

  const handleResetData = () => {
    setTimelineData(JSON.parse(JSON.stringify(initialTimelineData)));
    setErrorMessage(null);
  };

  const handleSendMessage = async (text: string) => {
    setIsSending(true);
    setErrorMessage(null);

    // Create a student message object
    const studentMsg: ChatMessage = {
      id: `student_${Date.now()}`,
      sender: 'student',
      text,
      timestamp: `Week ${currentWeek}`
    };

    // Update local chat history immediately
    const updatedHistory = [...activeState.chatHistory, studentMsg];

    // Coaching strategy is driven by the conversation, not pre-baked: in an
    // ongoing week (title already set) we diagnose which common pitfall the
    // student's message reveals, flag it in the checklist, and adopt the
    // matching strategy. Computed deterministically so it fires reliably in the
    // demo regardless of whether DeepSeek is reachable.
    const coachingDiagnosis = activeState.projectName
      ? applyCoachingSignals(activeState, text)
      : null;
    
    // Update state with student's message
    setTimelineData(prev => ({
      ...prev,
      [currentWeek]: {
        ...prev[currentWeek],
        chatHistory: updatedHistory
      }
    }));

    try {
      // Make real call to server
      const response = await fetch('/api/mentor-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          projectState: activeState,
          history: activeState.chatHistory
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get mentor advice.');
      }

      const data = await response.json();

      if (!data.reply) {
        throw new Error(`Unexpected AI response — missing reply field. Raw: ${JSON.stringify(data).slice(0, 200)}`);
      }

      // Create mentor response message
      const mentorMsg: ChatMessage = {
        id: `mentor_${Date.now()}`,
        sender: 'mentor',
        text: data.reply,
        timestamp: `Week ${currentWeek}`
      };

      setTimelineData(prev => {
        const currentData = prev[currentWeek];
        const newHistory = [...currentData.chatHistory, mentorMsg];
        
        let newProjectName = currentData.projectName;
        let newProblemStatement = currentData.problemStatement;
        let newActionItems = currentData.actionItems;
        let newHypotheses = currentData.hypotheses;
        let newDecisions = currentData.previousDecisions;
        let newLearning = currentData.learningMemory;

        // Apply dynamic AI state updates if present
        if (data.shouldUpdateState && data.stateUpdates) {
          if (data.stateUpdates.projectName) newProjectName = data.stateUpdates.projectName;
          if (data.stateUpdates.problemStatement) newProblemStatement = data.stateUpdates.problemStatement;
          if (data.stateUpdates.actionItems) newActionItems = data.stateUpdates.actionItems;
          if (data.stateUpdates.hypotheses) newHypotheses = data.stateUpdates.hypotheses;
          if (data.stateUpdates.decisions) newDecisions = data.stateUpdates.decisions;
          if (data.stateUpdates.learningItem) {
            const newItem = {
              id: `l_ai_${Date.now()}`,
              week: `Week ${currentWeek}`,
              description: data.stateUpdates.learningItem.description
            };
            newLearning = [...currentData.learningMemory, newItem];
          }
        }

        return {
          ...prev,
          [currentWeek]: {
            ...currentData,
            chatHistory: newHistory,
            projectName: newProjectName,
            problemStatement: newProblemStatement,
            actionItems: newActionItems,
            hypotheses: newHypotheses,
            previousDecisions: newDecisions,
            learningMemory: newLearning,
            coachingEvolution: coachingDiagnosis?.coachingEvolution ?? currentData.coachingEvolution,
            coachingSignals: coachingDiagnosis?.coachingSignals ?? currentData.coachingSignals
          }
        };
      });

    } catch (err: any) {
      console.warn("DeepSeek API unavailable, running discovery simulator:", err);

      const isKeyError = err.message?.includes("DEEPSEEK_API_KEY");
      if (isKeyError) {
        setErrorMessage("No DEEPSEEK_API_KEY found in .env.local — running in demo mode.");
      } else {
        setErrorMessage(`AI unavailable (${err.message?.slice(0, 80) ?? 'unknown error'}) — running in demo mode.`);
      }

      // Use `updatedHistory` (the history we built before the API call, which includes
      // the student's current message) rather than the stale closure snapshot of
      // activeState.chatHistory. This avoids repeated questions.
      setTimeout(() => {
        const studentMessages = updatedHistory.filter(m => m.sender === 'student');
        const studentTurnsSoFar = studentMessages.length;

        // Build a plain text summary of what the student has already said, so the
        // simulator never repeats a question that's clearly been answered.
        const studentContext = studentMessages.map(m => m.text).join(' ');

        const hasTitle = !!activeState.projectName;

        let reply = "";
        let stateUpdates: any = null;
        const lowerText = text.toLowerCase();

        // Diagnose which common pitfall the student's message reveals. The
        // highest-priority match drives the mentor's on-message reply below.
        const detectedIds = detectSignals(text);
        const topDetected = SIGNAL_PRIORITY.find(id => detectedIds.includes(id));

        if (!hasTitle) {
          if (studentTurnsSoFar === 1) {
            reply = "Got it. To help you shape this, who specifically has this problem? Think of a real person you know — what is going on in their life that makes this painful for them?";
          } else if (studentTurnsSoFar === 2) {
            reply = "That helps. One more thing to nail down: when they run into this problem today, what do they currently do to work around it? And why does that fall short?";
          } else {
            // Enough context — commit to the project using everything said so far.
            const allWords = studentContext.split(/\s+/);
            const meaningful = allWords.filter(w => w.length > 4 && !/^(that|this|they|their|with|from|have|been|just|already|about|people|want|build|like|does|more|also)$/i.test(w));
            const nounHint = meaningful[0] ?? 'Project';
            const titleGuess = nounHint.charAt(0).toUpperCase() + nounHint.slice(1).toLowerCase() + ' App';

            reply = `Got it — let me set up your workspace. First real step: go talk to people who actually have this problem.`;
            stateUpdates = {
              projectName: titleGuess,
              problemStatement: studentContext.slice(0, 150).trim() + '.',
              actionItems: [
                { id: `a_s1_${Date.now()}`, text: 'Talk to 5 people who have this problem (not friends)', completed: false, source: 'ai' },
                { id: `a_s2_${Date.now()}`, text: 'Write down the #1 pain in one sentence', completed: false, source: 'ai' },
                { id: `a_s3_${Date.now()}`, text: 'Sketch the simplest possible solution (paper is fine)', completed: false, source: 'ai' },
              ]
            };
          }
        } else if (topDetected) {
          // Respond with the coaching move that matches the diagnosed mistake —
          // never just congratulate and move on.
          reply = SIGNAL_SIM_REPLIES[topDetected];
          stateUpdates = {
            learningItem: { description: `Diagnosed "${topDetected}" from: "${text.slice(0, 80)}" — coached against it.` }
          };
        } else {
          // Already in ongoing mentoring — check for common keywords
          if (lowerText.includes("interview") || lowerText.includes("user said") || lowerText.includes("talked to")) {
            reply = `That's real signal. How does what they told you compare to your current hypothesis — does it support it, challenge it, or point somewhere new entirely?`;
            stateUpdates = {
              learningItem: { description: `User research insight: "${text.slice(0, 80)}"` }
            };
          } else if (lowerText.includes("pivot") || lowerText.includes("change") || lowerText.includes("different direction")) {
            reply = `A pivot grounded in evidence is a strength, not a failure. What specific data or feedback is driving this — and what stays the same about the core problem you're solving?`;
          } else if (lowerText.includes("prototype") || lowerText.includes("built") || lowerText.includes("mockup")) {
            reply = `Nice progress on the build side. Have you put it in front of anyone yet? Even one reaction from a real user will tell you more than a week of internal iteration.`;
            stateUpdates = {
              actionItems: [
                ...(activeState.actionItems || []),
                { id: `a_proto_${Date.now()}`, text: 'Test the prototype with at least 2 users this week', completed: false, source: 'ai' }
              ]
            };
          } else {
            reply = `Keep going. In PBL, every decision needs to trace back to either a validated assumption or explicit user feedback — which of those is anchoring this move?`;
          }
        }

        const mentorMsg: ChatMessage = {
          id: `mentor_sim_${Date.now()}`,
          sender: 'mentor',
          text: reply,
          timestamp: `Week ${currentWeek}`
        };

        setTimelineData(prev => {
          const currentData = prev[currentWeek];
          const newHistory = [...currentData.chatHistory, mentorMsg];
          
          let newProjectName = currentData.projectName;
          let newProblemStatement = currentData.problemStatement;
          let newActionItems = currentData.actionItems;
          let newHypotheses = currentData.hypotheses;
          let newDecisions = currentData.previousDecisions;
          let newLearning = currentData.learningMemory;

          if (stateUpdates) {
            if (stateUpdates.projectName) newProjectName = stateUpdates.projectName;
            if (stateUpdates.problemStatement) newProblemStatement = stateUpdates.problemStatement;
            if (stateUpdates.actionItems) newActionItems = stateUpdates.actionItems;
            if (stateUpdates.hypotheses) newHypotheses = stateUpdates.hypotheses;
            if (stateUpdates.decisions) newDecisions = stateUpdates.decisions;
            if (stateUpdates.learningItem) {
              newLearning = [...currentData.learningMemory, {
                id: `l_sim_${Date.now()}`,
                week: `Week ${currentWeek}`,
                description: stateUpdates.learningItem.description
              }];
            }
          }

          return {
            ...prev,
            [currentWeek]: {
              ...currentData,
              chatHistory: newHistory,
              projectName: newProjectName,
              problemStatement: newProblemStatement,
              actionItems: newActionItems,
              hypotheses: newHypotheses,
              previousDecisions: newDecisions,
              learningMemory: newLearning,
              coachingEvolution: coachingDiagnosis?.coachingEvolution ?? currentData.coachingEvolution,
              coachingSignals: coachingDiagnosis?.coachingSignals ?? currentData.coachingSignals
            }
          };
        });

        setIsSending(false);
      }, 1200);

      return;
    }

    setIsSending(false);
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: '#f0f0f8' }}>
      {/* LEFT SIDEBAR: Timeline Navigation */}
      <Sidebar 
        currentWeek={currentWeek} 
        onSelectWeek={handleSelectWeek} 
        completedWeeks={completedWeeks}
      />

      {/* CENTER PANEL: Interactive Workspace */}
      <main className="flex-1 flex flex-col h-full border-r border-slate-200/60 overflow-hidden" style={{ background: 'linear-gradient(180deg, #ececf6 0%, #f3f3f9 50%, #f8f8fc 100%)' }}>
        
        {/* Error Banner */}
        {errorMessage && (
          <div className="bg-amber-500/10 border-b border-amber-400/20 px-6 py-2.5 flex items-center justify-between text-xs text-amber-800 font-medium select-none">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-amber-600 hover:text-amber-900 font-bold px-2">×</button>
          </div>
        )}

        {/* Workspace Top Bar */}
        <div className="px-7 border-b border-slate-200 select-none shrink-0 bg-white sticky top-0 z-10 shadow-sm">
          {/* Row 1: week badge + title + reset */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`px-2 py-1 rounded-md text-[10px] font-mono font-semibold uppercase tracking-widest ${
                currentWeek === 1 ? 'bg-blue-100 text-blue-700' :
                currentWeek === 2 ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                Week {currentWeek}
              </div>
              <span className="text-slate-300">/</span>
              <h1 className="text-base font-bold font-display tracking-tight text-slate-900">
                {currentWeek === 3 ? 'Capstone Dashboard' : 'Project Overview'}
              </h1>
            </div>
            <button
              onClick={handleResetData}
              className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <RefreshCw size={11} />
              <span>Reset</span>
            </button>
          </div>
          {/* Row 2: milestone banner — sits flush below the title row */}
          {currentWeek !== 3 && (
            <div
              className="mb-3 rounded-lg px-4 py-2.5 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider shrink-0">Milestone</span>
                <span className="text-xs font-semibold text-white leading-snug">
                  {activeState.milestone}
                </span>
              </div>
              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ml-4 ${
                activeState.milestoneStatus === 'Completed'
                  ? 'bg-emerald-400 text-emerald-900'
                  : 'bg-white/12 text-white/70 border border-white/15'
              }`}>
                {activeState.milestoneStatus}
              </span>
            </div>
          )}
        </div>

        {/* Week 3 is a full-width dashboard finale; earlier weeks show the working view. */}
        {currentWeek === 3 ? (
          <Week3Dashboard state={activeState} />
        ) : (
        <>
        {/* Main Workspace Scroll Area */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5 max-w-3xl mx-auto w-full">

          {/* ── Week 1: empty state nudge ── show only when nothing is committed yet */}
          {currentWeek === 1 && !activeState.projectName && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 select-none">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                <Sparkles size={22} className="text-indigo-400" />
              </div>
              <div className="text-center space-y-1.5">
                <p className="text-sm font-semibold text-slate-500">Your workspace is empty</p>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Chat with your AI Mentor below — tiles will appear here as your project takes shape.
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {['Project Title', 'Problem', 'Action Items'].map((label, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-1 rounded-full bg-white border border-slate-200 text-slate-400">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Project Title — hidden until AI commits */}
          {activeState.projectName && (
            <div key={`title-${activeState.projectName}`} className="animate-tile-in tile-delay-0 bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={12} className="text-indigo-500" />
                <span className="text-[10px] font-mono text-indigo-600 uppercase tracking-widest font-semibold">Project Title</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <h2 className="text-xl font-bold font-display tracking-tight text-slate-900">
                  {activeState.projectName}
                </h2>
              </div>
            </div>
          )}

          {/* Problem to be Solved — Week 1 only, hidden until AI commits */}
          {currentWeek === 1 && activeState.problemStatement && (
            <div key={`problem-${activeState.problemStatement.slice(0,20)}`} className="animate-tile-in tile-delay-1 bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={12} className="text-violet-500" />
                <span className="text-[10px] font-mono text-violet-600 uppercase tracking-widest font-semibold">Problem to be Solved</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed border-l-2 border-violet-300 pl-3">
                {activeState.problemStatement}
              </p>
            </div>
          )}

          {/* Action Items — hidden until AI commits */}
          {activeState.actionItems.length > 0 && (
            <div key={`actions-${activeState.actionItems.length}`} className="animate-tile-in tile-delay-2 bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare size={12} className="text-emerald-500" />
                  <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-widest font-semibold">Action Items</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {activeState.actionItems.filter(a => a.completed).length}/{activeState.actionItems.length} done
                </span>
              </div>
              <div className="space-y-1.5 mt-1">
                {activeState.actionItems.map((item, i) => (
                  <div
                    key={item.id}
                    className={`animate-tile-in flex items-start gap-2.5 px-3 py-2.5 rounded-lg border transition-colors ${
                      item.completed
                        ? 'bg-emerald-50 border-emerald-100 text-slate-400'
                        : 'bg-slate-50 border-slate-150 text-slate-700 hover:border-slate-200'
                    }`}
                    style={{ animationDelay: `${(i + 3) * 60}ms` }}
                  >
                    {item.completed
                      ? <CheckSquare size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                      : <Square size={13} className="text-slate-300 shrink-0 mt-0.5" />
                    }
                    <span className={`text-xs leading-relaxed ${item.completed ? 'line-through text-slate-400' : ''}`}>
                      {item.text}
                    </span>
                    {item.source === 'ai' && (
                      <span className="ml-auto text-[9px] font-mono text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded shrink-0">AI</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Hypotheses */}
          {activeState.hypotheses.length > 0 ? (
            <div key={activeState.hypotheses.length} className="animate-tile-in tile-delay-3 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <HypothesesPanel hypotheses={activeState.hypotheses} />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <HypothesesPanel hypotheses={activeState.hypotheses} />
            </div>
          )}

          {/* Teacher Feedback */}
          <div className="rounded-xl border border-violet-100 p-4 flex gap-3.5 items-start shadow-xs" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #fff 100%)' }}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-semibold shrink-0 text-xs shadow-md shadow-violet-200">
              SJ
            </div>
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-violet-500 uppercase tracking-widest">Teacher Feedback</span>
              <blockquote className="text-xs md:text-sm text-slate-700 font-medium italic leading-relaxed">
                &ldquo;{activeState.teacherFeedback.text}&rdquo;
              </blockquote>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-800">{activeState.teacherFeedback.author}</span>
                <span className="text-[10px] font-mono text-slate-300">·</span>
                <span className="text-[10px] font-mono text-slate-500 uppercase">{activeState.teacherFeedback.role}</span>
              </div>
            </div>
          </div>

          <div className="h-4" />
        </div>

        {/* Floating AI Mentor Chat — docked at bottom like an IDE terminal */}
        <FloatingMentorChat
          chatHistory={activeState.chatHistory}
          projectState={activeState}
          onSendMessage={handleSendMessage}
          isSending={isSending}
        />
        </>
        )}
      </main>

      {/* RIGHT SIDEBAR: Coaching Strategy Evolution (hidden on the Week 3 dashboard) */}
      {currentWeek !== 3 && (
        <RightSidebar 
          coachingEvolution={activeState.coachingEvolution}
          coachingSignals={activeState.coachingSignals}
          learnerPattern={activeState.learnerPattern}
          previousDecisions={activeState.previousDecisions}
          learningMemory={activeState.learningMemory}
          decisionPath={activeState.decisionPath}
          memoryReveal={activeState.memoryReveal}
          everosStatus={everosStatus}
        />
      )}
    </div>
  );
}

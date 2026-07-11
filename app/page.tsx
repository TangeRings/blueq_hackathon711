"use client";

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HypothesesPanel from './components/HypothesesPanel';
import RightSidebar from './components/RightSidebar';
import FloatingMentorChat from './components/FloatingMentorChat';
import StrategyShiftCard from './components/StrategyShiftCard';
import { initialTimelineData } from './data';
import { ProjectState, ChatMessage } from './types';
import { RefreshCw, AlertCircle, FileText, Lightbulb, CheckSquare, Square } from 'lucide-react';

const STUDENT_USER_ID = 'student_alex_demo';

type EverosStatus = 'idle' | 'syncing' | 'synced' | 'error';

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
      : state.reasoning;
    const outcome = currentStep?.outcome ?? state.summary;

    const messages = [
      { role: 'user' as const, content: situation },
      { role: 'assistant' as const, content: intervention },
      { role: 'tool' as const, content: `Outcome: ${outcome}` },
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
        let newReasoning = currentData.reasoning;
        let newActionItems = currentData.actionItems;
        let newHypotheses = currentData.hypotheses;
        let newDecisions = currentData.previousDecisions;
        let newLearning = currentData.learningMemory;

        // Apply dynamic AI state updates if present
        if (data.shouldUpdateState && data.stateUpdates) {
          if (data.stateUpdates.projectName) newProjectName = data.stateUpdates.projectName;
          if (data.stateUpdates.problemStatement) newProblemStatement = data.stateUpdates.problemStatement;
          if (data.stateUpdates.reasoning) newReasoning = data.stateUpdates.reasoning;
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
            reasoning: newReasoning,
            actionItems: newActionItems,
            hypotheses: newHypotheses,
            previousDecisions: newDecisions,
            learningMemory: newLearning
          }
        };
      });

    } catch (err: any) {
      console.warn("DeepSeek API unavailable, running discovery simulator:", err);

      const isKeyError = err.message?.includes("DEEPSEEK_API_KEY");
      if (isKeyError) {
        setErrorMessage("No DEEPSEEK_API_KEY found in .env.local — running in demo mode.");
      } else {
        setErrorMessage("Cannot reach DeepSeek AI — running in demo mode.");
      }

      // Read the current conversation to decide which discovery turn we're on
      setTimeout(() => {
        const currentHistory = activeState.chatHistory;
        // Count only student turns so far (the one we just added is already in history)
        const studentTurnsSoFar = currentHistory.filter(m => m.sender === 'student').length;
        const hasTitle = !!activeState.projectName;
        const hasProblem = !!activeState.problemStatement;

        let reply = "";
        let stateUpdates: any = null;
        const lowerText = text.toLowerCase();

        if (!hasTitle && !hasProblem) {
          // Discovery phase — ask probing questions turn by turn
          if (studentTurnsSoFar === 1) {
            // First message from student — ask about the problem
            reply = "Interesting start. Before we name anything, help me understand the pain point — what specific frustration or gap does this address, and who runs into it most often?";
          } else if (studentTurnsSoFar === 2) {
            // Second message — dig into the user and context
            reply = "Good. Now push a little deeper: in a typical week, how does that person currently deal with this problem today, and what makes the existing solutions fall short for them?";
          } else {
            // Third message — enough signal, commit to the project details
            // Extract a project name from what we've heard
            const words = text.split(' ');
            const nounHint = words.find(w => w.length > 4) || 'Project';
            const titleGuess = nounHint.charAt(0).toUpperCase() + nounHint.slice(1) + ' Assistant';

            reply = `Got it — let me capture that. Based on what you've shared across our conversation, I can now frame the core direction for your workspace.`;
            stateUpdates = {
              projectName: titleGuess,
              problemStatement: `${text.charAt(0).toUpperCase() + text.slice(1, 80)}...`,
              reasoning: `Student described the problem across 3 turns. The core insight is: ${text.slice(0, 60)}.`,
              actionItems: [
                { id: `a_s1_${Date.now()}`, text: 'Validate the problem with at least 3 real users', completed: false, source: 'ai' },
                { id: `a_s2_${Date.now()}`, text: 'Define who your primary target user is', completed: false, source: 'ai' },
                { id: `a_s3_${Date.now()}`, text: 'Sketch a simple prototype or storyboard', completed: false, source: 'ai' },
              ]
            };
          }
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
          let newReasoning = currentData.reasoning;
          let newActionItems = currentData.actionItems;
          let newHypotheses = currentData.hypotheses;
          let newDecisions = currentData.previousDecisions;
          let newLearning = currentData.learningMemory;

          if (stateUpdates) {
            if (stateUpdates.projectName) newProjectName = stateUpdates.projectName;
            if (stateUpdates.problemStatement) newProblemStatement = stateUpdates.problemStatement;
            if (stateUpdates.reasoning) newReasoning = stateUpdates.reasoning;
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
              reasoning: newReasoning,
              actionItems: newActionItems,
              hypotheses: newHypotheses,
              previousDecisions: newDecisions,
              learningMemory: newLearning
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
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* LEFT SIDEBAR: Timeline Navigation */}
      <Sidebar 
        currentWeek={currentWeek} 
        onSelectWeek={handleSelectWeek} 
        completedWeeks={completedWeeks}
      />

      {/* CENTER PANEL: Interactive Workspace */}
      <main className="flex-1 bg-white flex flex-col h-full border-r border-slate-100 overflow-hidden">
        
        {/* Error / Secret Guidance Alert Banner */}
        {errorMessage && (
          <div className="bg-amber-50 border-b border-amber-100 px-6 py-2.5 flex items-center justify-between text-xs text-amber-800 font-medium select-none">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="text-amber-500 hover:text-amber-800 font-bold px-2"
            >
              ×
            </button>
          </div>
        )}

        {/* Workspace Top Bar Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between select-none shrink-0 bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-widest">Workspace</span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Week {currentWeek}
              </span>
            </div>
            <h1 className="text-xl font-bold font-display tracking-tight text-slate-900 mt-1">
              Project Overview
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetData}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm"
              title="Reset timeline data"
            >
              <RefreshCw size={12} />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        {/* Main Workspace Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-4xl mx-auto w-full">

          {/* Agent Evolution WOW moment (Week 3) */}
          {activeState.strategyShift && (
            <StrategyShiftCard strategyShift={activeState.strategyShift} />
          )}

          {/* Project Title */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <FileText size={13} className="text-slate-400" />
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Project Title</span>
            </div>
            {activeState.projectName ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-900 shrink-0" />
                <h2 className="text-xl font-bold font-display tracking-tight text-slate-900">
                  {activeState.projectName}
                </h2>
              </div>
            ) : (
              <div className="h-8 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 flex items-center px-3">
                <span className="text-xs text-slate-400 italic">AI will identify this as you share your idea...</span>
              </div>
            )}
          </div>

          {/* Problem to be Solved */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Lightbulb size={13} className="text-slate-400" />
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Problem to be Solved</span>
            </div>
            {activeState.problemStatement ? (
              <p className="text-sm text-slate-700 leading-relaxed border-l-2 border-slate-200 pl-3">
                {activeState.problemStatement}
              </p>
            ) : (
              <div className="h-12 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 flex items-center px-3">
                <span className="text-xs text-slate-400 italic">AI will surface this from your conversation...</span>
              </div>
            )}
          </div>

          {/* Reasoning */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Reasoning</span>
            </div>
            {activeState.reasoning ? (
              <p className="text-xs text-slate-500 leading-relaxed bg-slate-50/60 border border-slate-100 rounded-lg px-3 py-2.5">
                {activeState.reasoning}
              </p>
            ) : (
              <div className="h-10 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 flex items-center px-3">
                <span className="text-xs text-slate-400 italic">AI will document its reasoning here...</span>
              </div>
            )}
          </div>

          {/* Action Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare size={13} className="text-slate-400" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Action Items</span>
              </div>
              {activeState.actionItems.length > 0 && (
                <span className="text-[10px] font-mono text-slate-400">
                  {activeState.actionItems.filter(a => a.completed).length}/{activeState.actionItems.length} done
                </span>
              )}
            </div>
            {activeState.actionItems.length === 0 ? (
              <div className="h-14 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-1">
                <span className="text-xs text-slate-400 italic">AI will identify action items from your chat...</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {activeState.actionItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border transition-colors ${
                      item.completed
                        ? 'bg-emerald-50/50 border-emerald-100/60 text-slate-400'
                        : 'bg-white border-slate-100 text-slate-700'
                    }`}
                  >
                    {item.completed
                      ? <CheckSquare size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                      : <Square size={13} className="text-slate-300 shrink-0 mt-0.5" />
                    }
                    <span className={`text-xs leading-relaxed ${item.completed ? 'line-through' : ''}`}>
                      {item.text}
                    </span>
                    {item.source === 'ai' && (
                      <span className="ml-auto text-[9px] font-mono text-slate-400 shrink-0">AI</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Milestone Panel */}
          <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:border-slate-200 transition-colors">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">CURRENT MILESTONE</span>
              <h4 className="text-sm font-semibold text-slate-800 leading-snug">
                {activeState.milestone}
              </h4>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <span className="text-[10px] font-mono text-slate-400">STATUS</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                activeState.milestoneStatus === 'Completed'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {activeState.milestoneStatus}
              </span>
            </div>
          </div>

          {/* Current Hypotheses */}
          <HypothesesPanel hypotheses={activeState.hypotheses} />

          {/* Teacher Feedback Callout */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono tracking-wider text-slate-400 uppercase">Teacher Feedback</h4>
            <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-5 relative overflow-hidden flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600 font-semibold shrink-0 text-sm shadow-sm">
                SJ
              </div>
              <div className="space-y-2">
                <blockquote className="text-xs md:text-sm text-slate-700 font-medium italic leading-relaxed">
                  "{activeState.teacherFeedback.text}"
                </blockquote>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800">{activeState.teacherFeedback.author}</span>
                  <span className="text-[10px] font-mono text-slate-400">•</span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{activeState.teacherFeedback.role}</span>
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50/10 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* bottom padding so content isn't obscured by floating chat */}
          <div className="h-4" />
        </div>

        {/* Floating AI Mentor Chat — docked at bottom like an IDE terminal */}
        <FloatingMentorChat
          chatHistory={activeState.chatHistory}
          projectState={activeState}
          onSendMessage={handleSendMessage}
          isSending={isSending}
        />
      </main>

      {/* RIGHT SIDEBAR: Coaching Strategy Evolution */}
      <RightSidebar 
        coachingEvolution={activeState.coachingEvolution}
        learnerPattern={activeState.learnerPattern}
        previousDecisions={activeState.previousDecisions}
        learningMemory={activeState.learningMemory}
        decisionPath={activeState.decisionPath}
        memoryReveal={activeState.memoryReveal}
        everosStatus={everosStatus}
      />
    </div>
  );
}

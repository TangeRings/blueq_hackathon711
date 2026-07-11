import { ProjectState, CoachingSignal } from './types';

// The common PBL pitfalls the mentor watches for. Each maps to a distinct
// coaching strategy, so different student mistakes lead to different guidance —
// nothing is presupposed. `detectedIds` marks which ones a given week has
// already surfaced (used for Week 3's history); everything else starts unflagged
// and only turns red when the live conversation matches it (see page.tsx).
function pitfalls(detectedIds: string[] = []): CoachingSignal[] {
  const base: Omit<CoachingSignal, 'detected'>[] = [
    {
      id: 'incomplete-research',
      label: "Didn't finish the assigned research",
      strategyName: 'Accountable Follow-up',
      strategyDetail: "Don't accept \"I did some.\" Press on who they actually reached, what blocked the rest, and a hard deadline to finish.",
      priorOutcome: 'Follow-through fell short — only reached {n} of 5 people.',
      hasCompletion: true,
    },
    {
      id: 'only-friends',
      label: 'Only talked to friends or family',
      strategyName: 'Redirect to Real Users',
      strategyDetail: 'Friends give biased encouragement. Send the student to actual target users who feel the pain.',
      priorOutcome: 'Student did reach out — but only to friends, so the feedback is biased.',
    },
    {
      id: 'ui-first',
      label: 'Judged the design, not the problem',
      strategyName: 'Refocus on the Problem',
      strategyDetail: "\"It looks cool\" isn't validation. Steer the conversation back to whether the underlying problem is real.",
      priorOutcome: 'Feedback was about how the app looks, not whether the problem is real.',
    },
    {
      id: 'opinions-not-behavior',
      label: 'Collected opinions, not real behavior',
      strategyName: 'Ask About Past Behavior',
      strategyDetail: "\"Would you use it?\" is hypothetical. Ask what the person actually did the last time they hit this problem.",
      priorOutcome: 'Student gathered hypothetical opinions instead of real past behavior.',
    },
    {
      id: 'built-too-early',
      label: 'Started building before validating',
      strategyName: 'Validate Before Building',
      strategyDetail: 'Pump the brakes on the build. Confirm the problem is real and worth solving before writing more code.',
      priorOutcome: 'Student jumped into building before confirming the problem is real.',
    },
  ];
  return base.map(b => ({ ...b, detected: detectedIds.includes(b.id) }));
}

// NOTE ON STATE CARRY-FORWARD:
// Weeks 2 and 3 intentionally start with an empty projectName / actionItems /
// hypotheses. When the presenter navigates to a later week, handleSelectWeek in
// page.tsx seeds those from the live Week 1 session, so whatever the AI produced
// (title + to-do list) flows forward. The per-week narrative below (chat opener,
// coachingEvolution, learnerPattern, strategyShift) is authored on purpose — it
// is the meta-story about HOW the mentor learns to coach this student, and it is
// kept title-agnostic so it fits any idea the student pitches in Week 1.

export const initialTimelineData: Record<number, ProjectState> = {
  1: {
    week: 1,
    weekName: 'Discovery',
    projectName: '',
    actionItems: [],
    summary: '',
    milestone: 'Define the problem and identify who it is for.',
    milestoneStatus: 'In Progress',
    hypotheses: [],
    teacherFeedback: {
      text: 'Before you build anything, use these early conversations to figure out what real people actually struggle with.',
      author: 'Prof. Sarah Jenkins',
      role: 'Venture Mentor'
    },
    chatHistory: [
      { id: 'm1_1', sender: 'mentor', text: 'Tell me about your project idea.', timestamp: 'Week 1' }
    ],
    previousDecisions: [],
    learningMemory: [],
    decisionPath: [
      { id: 'dp1', label: 'Idea Formulation', active: true, type: 'stage' }
    ],
    memoryReveal: [],
    coachingEvolution: [
      {
        week: 1,
        strategyName: 'Trusting Delegation',
        strategyDetail: 'Assign a broad research goal ("go talk to 5 people") and trust the student to follow through — the way a standard assistant would.',
        outcome: 'Waiting to see whether the student actually completes the research.',
        kind: 'current'
      }
    ]
  },
  2: {
    week: 2,
    weekName: 'Follow-up',
    // projectName + actionItems + hypotheses are carried forward from Week 1 live.
    projectName: '',
    actionItems: [],
    summary: 'Checking in on the user research assigned last week — the student has been vague about what actually got done.',
    milestone: 'Hold the line: get real conversations with target users done.',
    milestoneStatus: 'In Progress',
    hypotheses: [],
    teacherFeedback: {
      text: 'When a student says "I did some," that is your cue to dig in — not to move on. Find out who they really talked to.',
      author: 'Prof. Sarah Jenkins',
      role: 'Venture Mentor'
    },
    chatHistory: [
      { id: 'm2_0', sender: 'mentor', text: 'Welcome back. Before anything else — your first step last week was to talk to a few real people about this. How did that go? Who did you actually get to?', timestamp: 'Week 2' }
    ],
    previousDecisions: [],
    learningMemory: [],
    decisionPath: [
      { id: 'dp1', label: 'Idea', active: true, type: 'stage' },
      { id: 'dp2', label: 'Research assigned (talk to 5)', active: true, type: 'stage' },
      { id: 'dp3', label: 'Student vague on completion', active: true, type: 'evidence' },
      { id: 'dp4', label: 'Press on the gap', active: true, type: 'action' }
    ],
    memoryReveal: [
      { id: 'ms1', text: 'Week 1: assigned "talk to 5 people"', type: 'hypothesis', verified: true },
      { id: 'ms2', text: 'Week 2: vague progress report', type: 'feedback', verified: true }
    ],
    // Starts in the same state Week 1 ended: strategy still "current" and its
    // outcome unresolved. It only evolves (verdict + completion bar + the new
    // Accountable Follow-up step) once the student actually reveals in chat that
    // they fell short — see evolveCoaching in page.tsx.
    coachingEvolution: [
      {
        week: 1,
        strategyName: 'Trusting Delegation',
        strategyDetail: 'Assigned a broad goal ("talk to 5 people") and assumed it would get done.',
        outcome: 'Waiting to hear how the research actually went.',
        kind: 'current'
      }
    ],
    coachingSignals: pitfalls()
  },
  3: {
    week: 3,
    weekName: 'Accountability',
    // projectName + actionItems carried forward from the live session.
    projectName: '',
    actionItems: [],
    summary: 'Pressing on the commitment worked — the student came back having finished the conversations they had been avoiding.',
    milestone: 'Turn honest, completed research into a validated problem.',
    milestoneStatus: 'In Progress',
    hypotheses: [],
    teacherFeedback: {
      text: 'You did not let this one slide, and it paid off. Keep coaching them this way — specific commitments, followed up every single time.',
      author: 'Prof. Sarah Jenkins',
      role: 'Venture Mentor'
    },
    chatHistory: [
      { id: 'm3_0', sender: 'mentor', text: 'Welcome back. Last week you committed to finishing the other 3 conversations — with real users this time, not friends. Did you get them done?', timestamp: 'Week 3' }
    ],
    previousDecisions: [
      { id: 'd_coach', decision: 'Coach this student by pinning down commitments and following up.', reason: 'Trusting delegation produced 2/5; pressing on the gap produced full completion.', status: 'Active' }
    ],
    learningMemory: [
      { id: 'l2', week: 'Week 2', description: 'Student gave a vague, partial progress report and had to be pressed for specifics and a deadline.' },
      { id: 'l3', week: 'Week 3', description: 'This learner follows through when given a specific count, named people to reach, and a hard deadline — not open-ended goals.' }
    ],
    decisionPath: [
      { id: 'dp1', label: 'Idea', active: true, type: 'stage' },
      { id: 'dp2', label: 'Research assigned', active: true, type: 'stage' },
      { id: 'dp3', label: 'Accountable follow-up', active: true, type: 'stage' },
      { id: 'dp4', label: 'Pressed → finished the missing 3', active: true, type: 'evidence' },
      { id: 'dp5', label: 'Promote accountability strategy', active: true, type: 'action' }
    ],
    memoryReveal: [
      { id: 'ms1', text: 'Week 1: broad goal → only 2/5 done', type: 'hypothesis', verified: true },
      { id: 'ms2', text: 'Week 2: pressed on the missing 3', type: 'feedback', verified: true },
      { id: 'ms3', text: 'Week 3: remaining interviews completed', type: 'interview', verified: true },
      { id: 'ms4', text: 'Accountability strategy promoted', type: 'decision', verified: true }
    ],
    coachingEvolution: [
      {
        week: 1,
        strategyName: 'Trusting Delegation',
        strategyDetail: 'Assigned a broad goal ("talk to 5 people") and assumed it would get done.',
        outcome: 'Follow-through fell short — only 2/5, and vague about the rest.',
        completion: { done: 2, total: 5 },
        kind: 'past'
      },
      {
        week: 2,
        strategyName: 'Accountable Follow-up',
        strategyDetail: 'Refused to accept "I did some." Pressed on who exactly they reached and set a hard deadline for the missing 3.',
        outcome: 'Student came back having completed all 5 conversations.',
        completion: { done: 5, total: 5 },
        kind: 'past'
      },
      {
        week: 3,
        strategyName: 'Pin-Down Accountability',
        strategyDetail: 'For this learner, always convert goals into a specific count, named people to reach, and a deadline — then follow up on every one.',
        outcome: 'Promoted to a durable coaching strategy for this student.',
        kind: 'promoted'
      }
    ],
    coachingSignals: pitfalls(['incomplete-research', 'only-friends']),
    learnerPattern: {
      summary: 'This learner defers open-ended work and reports progress vaguely — but reliably follows through when held to specifics.',
      respondsTo: [
        'A specific number ("finish the other 3")',
        'Named people to reach, not "some users"',
        'A hard deadline for the week',
        'Direct follow-up on last week\'s commitment'
      ],
      avoid: [
        'Open-ended goals with no count',
        'Accepting "I did some" and moving on',
        'Letting a vague answer slide',
        'Assuming assigned work got done'
      ]
    },
    strategyShift: {
      previous: { strategy: 'Assign research and trust it gets done', completion: { done: 2, total: 5 } },
      current: { strategy: 'Press on the gap with a count + deadline', completion: { done: 5, total: 5 } },
      message: 'I\'ve adjusted my mentoring strategy based on how you responded to previous guidance.'
    }
  }
};

import { ProjectState } from './types';

export const initialTimelineData: Record<number, ProjectState> = {
  1: {
    week: 1,
    weekName: 'Discovery',
    projectName: 'AI Meal Planning Assistant',
    problemStatement: 'Busy people struggle to plan healthy weekly meals.',
    reasoning: 'Early idea stage — the mentor is still learning who this student is and how they work.',
    actionItems: [
      { id: 'a1_1', text: 'Interview 5 target users about meal planning', completed: false, source: 'ai' },
      { id: 'a1_2', text: 'Write down who your target user actually is', completed: false, source: 'ai' }
    ],
    summary: 'A student idea for an app that auto-generates weekly meal plans.',
    milestone: 'Define the problem and identify who it is for.',
    milestoneStatus: 'Completed',
    hypotheses: [
      { id: 'h1', text: 'Users want automatic weekly meal planning.', status: 'Needs validation' },
      { id: 'h2', text: 'Users care most about saving time.', status: 'Needs validation' }
    ],
    teacherFeedback: {
      text: 'Interesting concept. Meal planning is crowded — you will need to talk to real people early to find out what they actually struggle with.',
      author: 'Prof. Sarah Jenkins',
      role: 'Venture Mentor'
    },
    chatHistory: [
      { id: 'm1_1', sender: 'mentor', text: 'Tell me about your project idea.', timestamp: 'Week 1' },
      { id: 'm1_2', sender: 'student', text: 'I want to build an AI meal planning app.', timestamp: 'Week 1' },
      { id: 'm1_3', sender: 'mentor', text: 'Nice. A few things to figure out first:\n\n• Who are your target users?\n• What problem are you actually solving for them?\n• How do you know that problem is real?\n\nGo talk to five target users this week and come back with what you hear.', timestamp: 'Week 1' }
    ],
    previousDecisions: [
      { id: 'd1', decision: 'Focus on automatic weekly meal planning.', reason: 'Assumed users value convenience.', status: 'Active' }
    ],
    learningMemory: [
      { id: 'l1', week: 'Week 1', description: 'Project idea: an app that auto-plans weekly meals.' }
    ],
    decisionPath: [
      { id: 'dp1', label: 'Idea Formulation', active: true, type: 'stage' }
    ],
    memoryReveal: [
      { id: 'ms1', text: 'Week 1 hypothesis', type: 'hypothesis', verified: true },
      { id: 'ms4', text: 'Previous project decision', type: 'decision', verified: true }
    ],
    coachingEvolution: [
      {
        week: 1,
        strategyName: 'Open Discovery',
        strategyDetail: 'Ask broad open-ended questions and assign a general research goal ("interview 5 users").',
        outcome: 'Baseline set. Waiting to see how the student responds to broad instructions.',
        kind: 'current'
      }
    ]
  },
  2: {
    week: 2,
    weekName: 'Prototype',
    projectName: 'AI Meal Planning Assistant',
    problemStatement: 'Busy people struggle to plan healthy weekly meals and often waste ingredients.',
    reasoning: 'The student built a prototype but has only validated the interface, not the problem. The mentor is switching to evidence-first coaching.',
    actionItems: [
      { id: 'a2_1', text: 'Interview 5 target users about meal planning', completed: false, source: 'ai' },
      { id: 'a2_2', text: 'Ask ONE user: "Walk me through how you decide what to cook."', completed: false, source: 'ai' }
    ],
    summary: 'A clean meal-planning prototype, but validation so far is only about the UI.',
    milestone: 'Validate the problem, not the interface.',
    milestoneStatus: 'In Progress',
    hypotheses: [
      { id: 'h1', text: 'Users want automatic weekly meal planning.', status: 'Needs validation' },
      { id: 'h2', text: 'Users care most about saving time.', status: 'Needs validation' }
    ],
    teacherFeedback: {
      text: 'The prototype looks good, but "my friends like it" is not validation. Watch how you are running these conversations.',
      author: 'Prof. Sarah Jenkins',
      role: 'Venture Mentor'
    },
    chatHistory: [
      { id: 'm2_1', sender: 'student', text: 'Here is my prototype! I talked to two friends and they said the interface looks good.', timestamp: 'Week 2' },
      { id: 'm2_2', sender: 'mentor', text: 'Good to see a prototype. Two things I noticed from last week:\n\n• You planned to interview five users, but only completed two.\n• Both interviewees were your friends.\n\nFriends tend to tell you they like your app. That validates the UI, not the problem.', timestamp: 'Week 2' },
      { id: 'm2_3', sender: 'mentor', text: 'Try this instead. Don\'t show the prototype first. Ask one person:\n\n• "Walk me through how you currently decide what to cook."\n• "When did you last waste food, and why?"\n• "What did you do the last time you had no plan for dinner?"\n\nListen for behavior, not opinions.', timestamp: 'Week 2' }
    ],
    previousDecisions: [
      { id: 'd1', decision: 'Focus on automatic weekly meal planning.', reason: 'Assumed users value convenience.', status: 'Under review' }
    ],
    learningMemory: [
      { id: 'l1', week: 'Week 1', description: 'Project idea: an app that auto-plans weekly meals.' },
      { id: 'l2', week: 'Week 2', description: 'Student tends to validate the UI instead of validating the problem.' }
    ],
    decisionPath: [
      { id: 'dp1', label: 'Idea', active: true, type: 'stage' },
      { id: 'dp2', label: 'Prototype', active: true, type: 'stage' },
      { id: 'dp3', label: 'Only 2/5 interviews, both friends', active: true, type: 'evidence' },
      { id: 'dp4', label: 'Switch to evidence-first coaching', active: true, type: 'action' }
    ],
    memoryReveal: [
      { id: 'ms1', text: 'Week 1 action: interview 5 users', type: 'hypothesis', verified: true },
      { id: 'ms2', text: 'Teacher feedback on validation', type: 'feedback', verified: true },
      { id: 'ms4', text: 'Previous project decision', type: 'decision', verified: true }
    ],
    coachingEvolution: [
      {
        week: 1,
        strategyName: 'Open Discovery',
        strategyDetail: 'Broad open-ended questions and a general goal ("interview 5 users").',
        outcome: 'Low engagement — only 2/5 interviews completed, and both were friends.',
        completion: { done: 2, total: 5 },
        kind: 'past'
      },
      {
        week: 2,
        strategyName: 'Evidence-first Coaching',
        strategyDetail: 'Stop the student from validating the UI. Give concrete, behavior-focused interview questions and tell them not to show the prototype first.',
        outcome: 'Waiting on results from the concrete interview questions.',
        kind: 'current'
      }
    ]
  },
  3: {
    week: 3,
    weekName: 'Interviews',
    projectName: 'AI Meal Planning Assistant',
    problemStatement: 'Users may not want full automation — the real pain could be ingredient waste, not scheduling.',
    reasoning: 'The concrete interview task worked: the student completed 3 more interviews. The mentor has learned that this specific learner responds to small, concrete tasks — not broad exploration.',
    actionItems: [
      { id: 'a3_1', text: 'Interview ONE target user with the 3 given questions', completed: true, source: 'ai' },
      { id: 'a3_2', text: 'Interview 2 more users (not friends)', completed: true, source: 'ai' },
      { id: 'a3_3', text: 'Bring back one exact quote per interview', completed: true, source: 'ai' },
      { id: 'a3_4', text: 'Decide: is food waste the stronger pain?', completed: true, source: 'ai' }
    ],
    summary: 'The student ran real behavior-based interviews and now has evidence to reason about a pivot.',
    milestone: 'Use real interview evidence to decide the direction.',
    milestoneStatus: 'Completed',
    hypotheses: [
      { id: 'h1', text: 'Users want automatic weekly meal planning.', status: 'Challenged' },
      { id: 'h2', text: 'Reducing food waste is a stronger motivator than saving time.', status: 'Partially supported' }
    ],
    teacherFeedback: {
      text: 'This is real progress. You went from opinions to actual behavior. Now let the evidence decide whether to pivot.',
      author: 'Prof. Sarah Jenkins',
      role: 'Venture Mentor'
    },
    chatHistory: [
      { id: 'm3_1', sender: 'student', text: 'I interviewed three more people. I still don\'t know whether I should pivot.', timestamp: 'Week 3' },
      { id: 'm3_2', sender: 'mentor', text: 'Before we talk about the pivot — I noticed something about how you work.\n\nWhen I gave you general advice, you only interviewed two friends. When I suggested three concrete interview questions, you completed three more interviews with real users.\n\nFor you, specific interview tasks work better than broad exploration. Let\'s keep coaching you that way.', timestamp: 'Week 3' },
      { id: 'm3_3', sender: 'mentor', text: 'Now, on the pivot: your interviews point at food waste, not scheduling. Next concrete step:\n\n• Pick the ONE user who talked most about wasted food.\n• Ask them: "What would you pay to never throw out groceries again?"\n\nThen we decide.', timestamp: 'Week 3' }
    ],
    previousDecisions: [
      { id: 'd1', decision: 'Focus on automatic weekly meal planning.', reason: 'Assumed users value convenience.', status: 'Challenged' },
      { id: 'd2', decision: 'Coach this student with small, concrete tasks.', reason: 'Concrete tasks produced 3 completed interviews; broad instructions produced only 2.', status: 'Active' }
    ],
    learningMemory: [
      { id: 'l1', week: 'Week 1', description: 'Project idea: an app that auto-plans weekly meals.' },
      { id: 'l2', week: 'Week 2', description: 'Student tends to validate the UI instead of validating the problem.' },
      { id: 'l3', week: 'Week 3', description: 'For this learner, small concrete tasks lead to higher completion than broad instructions.' }
    ],
    decisionPath: [
      { id: 'dp1', label: 'Idea', active: true, type: 'stage' },
      { id: 'dp2', label: 'Prototype', active: true, type: 'stage' },
      { id: 'dp3', label: 'Evidence-first coaching', active: true, type: 'stage' },
      { id: 'dp4', label: 'Concrete tasks → 3 more interviews', active: true, type: 'evidence' },
      { id: 'dp5', label: 'Promote learner-specific coaching strategy', active: true, type: 'action' }
    ],
    memoryReveal: [
      { id: 'ms1', text: 'Week 1: broad advice → 2/5 done', type: 'hypothesis', verified: true },
      { id: 'ms2', text: 'Week 2: concrete questions given', type: 'feedback', verified: true },
      { id: 'ms3', text: 'Week 3: 3 more interviews completed', type: 'interview', verified: true },
      { id: 'ms4', text: 'Learned coaching pattern', type: 'decision', verified: true }
    ],
    coachingEvolution: [
      {
        week: 1,
        strategyName: 'Open Discovery',
        strategyDetail: 'Broad open-ended questions and a general goal ("interview 5 users").',
        outcome: 'Low engagement — only 2/5 interviews completed, both friends.',
        completion: { done: 2, total: 5 },
        kind: 'past'
      },
      {
        week: 2,
        strategyName: 'Evidence-first Coaching',
        strategyDetail: 'Concrete, behavior-focused interview questions; do not show the prototype first.',
        outcome: 'Student completed 3 more interviews with real (non-friend) users.',
        completion: { done: 3, total: 3 },
        kind: 'past'
      },
      {
        week: 3,
        strategyName: 'Personalized Intervention',
        strategyDetail: 'Give this learner small, exact, measurable tasks. One user, one question, one quote at a time.',
        outcome: 'Promoted to a durable coaching strategy for this student.',
        kind: 'promoted'
      }
    ],
    learnerPattern: {
      summary: 'For this learner, small concrete tasks lead to higher completion than broad instructions.',
      respondsTo: [
        'Exact interview targets ("interview ONE user")',
        'Specific questions to ask',
        'Requests for real quotes',
        'Small, measurable tasks'
      ],
      avoid: [
        'Broad prompts like "What do you think?"',
        'Abstract reflection',
        'Discussing the prototype first',
        'Open-ended goals with no number'
      ]
    },
    strategyShift: {
      previous: { strategy: 'Interview 5 users (broad instruction)', completion: { done: 2, total: 5 } },
      current: { strategy: 'Interview ONE user, use these 3 questions', completion: { done: 4, total: 4 } },
      message: 'I\'ve adjusted my mentoring strategy based on how you responded to previous guidance.'
    }
  }
};

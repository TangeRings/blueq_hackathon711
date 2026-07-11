export interface Hypothesis {
  id: string;
  text: string;
  status: 'Needs validation' | 'Partially supported' | 'Validated' | 'Challenged' | 'Active';
}

export interface Decision {
  id: string;
  decision: string;
  reason: string;
  status: 'Active' | 'Under review' | 'Challenged' | 'Superseded';
}

export interface LearningItem {
  id: string;
  week: string;
  description: string;
}

export interface DecisionPathNode {
  id: string;
  label: string;
  active: boolean;
  type?: 'stage' | 'evidence' | 'action';
}

export interface MemorySource {
  id: string;
  text: string;
  type: 'hypothesis' | 'feedback' | 'interview' | 'decision';
  verified: boolean;
}

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  source: 'ai' | 'student';
}

export interface ChatMessage {
  id: string;
  sender: 'student' | 'mentor';
  text: string;
  timestamp: string;
}

export interface CoachingStep {
  week: number;
  strategyName: string;
  strategyDetail: string;
  outcome: string;
  completion?: { done: number; total: number };
  kind: 'past' | 'current' | 'promoted';
}

export interface LearnerPattern {
  summary: string;
  respondsTo: string[];
  avoid: string[];
}

// A common PBL mistake the mentor watches for. Each signal maps to the coaching
// strategy the mentor adopts when the student's message reveals that mistake.
// `detected` flips to true (and the item is flagged red in the UI) only when the
// conversation actually matches it — nothing is presupposed about the student.
export interface CoachingSignal {
  id: string;
  label: string;
  strategyName: string;
  strategyDetail: string;
  priorOutcome: string;
  detected: boolean;
  hasCompletion?: boolean;
}

export interface StrategyShift {
  previous: { strategy: string; completion: { done: number; total: number } };
  current: { strategy: string; completion: { done: number; total: number } };
  message: string;
}

export interface ProjectState {
  week: number;
  weekName: string;
  projectName: string;
  problemStatement?: string;
  reasoning?: string;
  actionItems: ActionItem[];
  summary: string;
  milestone: string;
  milestoneStatus: 'In Progress' | 'Completed' | 'Pending';
  hypotheses: Hypothesis[];
  teacherFeedback: {
    text: string;
    author: string;
    role: string;
  };
  chatHistory: ChatMessage[];
  previousDecisions: Decision[];
  learningMemory: LearningItem[];
  decisionPath: DecisionPathNode[];
  memoryReveal: MemorySource[];
  coachingEvolution: CoachingStep[];
  coachingSignals?: CoachingSignal[];
  learnerPattern?: LearnerPattern;
  strategyShift?: StrategyShift;
}

import type {
  Classification,
  DiagnosisReport,
  DraftQuestion,
  Explanation,
  PlanNarrative,
} from "./validators";

export type ExplanationInput = {
  stem?: string;
  passage?: string | null;
  choices?: Array<{ label: "A" | "B" | "C" | "D"; text: string }>;
  correct_label?: "A" | "B" | "C" | "D";
  her_answer?: string;
  topic_context?: string;
  confidence?: number;
};

export type QuestionGenInput = {
  topicName?: string;
  subtopic?: string;
  difficulty?: number;
  reasoningSkills?: string[];
  count?: number;
};

export type ClassifyInput = {
  stem?: string;
  choices?: Array<{ label: "A" | "B" | "C" | "D"; text: string }>;
  taxonomyTree?: unknown;
};

export type DiagnoseInput = {
  mistakes?: unknown[];
  masteryState?: unknown;
};

export type PlanInput = {
  blocks?: unknown[];
  weeklyHours?: number;
  examDate?: string;
};

export type RecommendationInput = {
  recommendations?: unknown[];
};

export type LLMProvider = {
  generateExplanation(input?: ExplanationInput): Promise<Explanation>;
  generateQuestion(input?: QuestionGenInput): Promise<DraftQuestion[]>;
  classifyQuestion(input?: ClassifyInput): Promise<Classification>;
  diagnoseMistakes(input?: DiagnoseInput): Promise<DiagnosisReport>;
  generatePlanNarrative(input?: PlanInput): Promise<PlanNarrative>;
};

export type {
  Classification,
  DiagnosisReport,
  DraftQuestion,
  Explanation,
  PlanNarrative,
};

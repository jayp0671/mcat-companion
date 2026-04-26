export type Choice = { label: "A" | "B" | "C" | "D"; text: string };
export type ExplanationInput = { stem: string; choices: Choice[]; correctLabel: string; selectedLabel?: string; topicContext?: string; confidence?: number };
export type Explanation = { correct_explanation: string; distractor_explanations: Record<string, string>; key_concept: string; common_misconception?: string };
export type QuestionGenInput = { topic: string; subtopic?: string; difficulty: number; reasoningSkills: string[]; count: number };
export type DraftQuestion = { stem: string; choices: Choice[]; correct_label: string; brief_rationale: string; suggested_tags: string[] };
export type ClassifyInput = { stem: string; choices?: Choice[]; taxonomy: unknown };
export type Classification = { section: string | null; content_category_id: string | null; topic_id: string | null; subtopic_id?: string | null; reasoning_skills: string[]; difficulty: number | null; format: "discrete" | "passage" | null };
export type DiagnoseInput = { mistakes: unknown[]; masteryState: unknown };
export type DiagnosisReport = { patterns: Array<{ name: string; description: string; evidence_question_ids: string[]; recommendation: string }>; summary: string };
export type PlanInput = { blocks: unknown[]; tone?: string };
export type PlanNarrative = { blocks: unknown[] };

export interface LLMProvider {
  generateExplanation(input: ExplanationInput): Promise<Explanation>;
  generateQuestion(input: QuestionGenInput): Promise<DraftQuestion[]>;
  classifyQuestion(input: ClassifyInput): Promise<Classification>;
  diagnoseMistakes(input: DiagnoseInput): Promise<DiagnosisReport>;
  generatePlanNarrative(input: PlanInput): Promise<PlanNarrative>;
}

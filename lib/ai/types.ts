export type ChoiceLabel = "A" | "B" | "C" | "D";

export type Choice = {
  label: ChoiceLabel;
  text: string;
  is_correct?: boolean;
};

export type ExplanationInput = {
  stem: string;
  choices?: Choice[];
  correctLabel?: string;
  selectedLabel?: string;
  topicContext?: string;
  confidence?: number;
  [key: string]: unknown;
};

export type Explanation = {
  correct_explanation: string;
  distractor_explanations: Record<string, string>;
  key_concept: string;
  common_misconception?: string | null;
};

export type QuestionGenInput = {
  topic?: string;
  topicName?: string;
  subtopic?: string;
  difficulty?: number;
  reasoningSkills?: string[];
  count?: number;
  section?: "chem_phys" | "cars" | "bio_biochem" | "psych_soc";
  [key: string]: unknown;
};

export type DraftQuestion = {
  stem: string;
  passage?: string | null;
  section?: "chem_phys" | "cars" | "bio_biochem" | "psych_soc";
  format?: "discrete" | "passage";
  difficulty?: number;
  choices: Choice[];
  correct_label: ChoiceLabel;
  brief_rationale: string;
  suggested_tags: string[];
};


export type ImportedMistakeDraft = {
  stem: string;
  passage?: string | null;
  source_material?: string | null;
  section?: "chem_phys" | "cars" | "bio_biochem" | "psych_soc" | null;
  format?: "discrete" | "passage" | null;
  difficulty?: number | null;
  content_category_id?: string | null;
  topic_id?: string | null;
  subtopic_id?: string | null;
  reasoning_skill_ids: string[];
  choices: Choice[];
  her_selected_answer?: string | null;
  correct_answer?: string | null;
  her_confidence?: number | null;
  time_spent_seconds?: number | null;
  notes?: string | null;
  parser_confidence?: number | null;
  needs_review?: boolean;
  warnings?: string[];
};

export type ParseImportInput = {
  rawText: string;
  sourceMaterial?: string | null;
  taxonomyNodes?: Array<{
    id: string;
    parent_id: string | null;
    level: string;
    code: string | null;
    name: string;
    section: string | null;
  }>;
  reasoningSkills?: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  defaultSection?: "chem_phys" | "cars" | "bio_biochem" | "psych_soc";
};

export type ClassifyInput = {
  stem: string;
  choices?: Choice[];
  taxonomy?: unknown;
  [key: string]: unknown;
};

export type Classification = {
  section: "chem_phys" | "cars" | "bio_biochem" | "psych_soc" | null;
  content_category_id: string | null;
  topic_id: string | null;
  subtopic_id?: string | null;
  reasoning_skills: string[];
  difficulty: number | null;
  format: "discrete" | "passage" | null;
};

export type DiagnoseInput = {
  mistakes?: unknown[];
  masteryState?: unknown;
  [key: string]: unknown;
};

export type DiagnosisReport = {
  patterns: Array<{
    name: string;
    description: string;
    evidence_question_ids: string[];
    recommendation: string;
  }>;
  summary: string;
};

export type PlanInput = {
  blocks: unknown[];
  tone?: string;
  weeklyHours?: number;
  examDate?: string;
  [key: string]: unknown;
};

export type PlanNarrative = {
  narrative: string;
  blocks?: unknown[];
};

export interface LLMProvider {
  generateExplanation(input: ExplanationInput): Promise<Explanation>;
  generateQuestion(input: QuestionGenInput): Promise<DraftQuestion[]>;
  parseImportedMistake(input: ParseImportInput): Promise<ImportedMistakeDraft>;
  classifyQuestion(input: ClassifyInput): Promise<Classification>;
  diagnoseMistakes(input: DiagnoseInput): Promise<DiagnosisReport>;
  generatePlanNarrative(input: PlanInput): Promise<PlanNarrative>;
}

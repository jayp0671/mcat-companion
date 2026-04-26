export type TaxonomyNode = {
  id: string;
  parent_id: string | null;
  level: "section" | "foundation" | "category" | "topic" | "subtopic";
  code: string | null;
  name: string;
  description?: string | null;
  section: string | null;
  sort_order: number | null;
};

export type ReasoningSkill = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
};

export type MistakeListItem = {
  id: string;
  her_selected_answer: string;
  correct_answer: string;
  her_confidence: number | null;
  time_spent_seconds: number | null;
  notes: string | null;
  logged_at: string;
  question: {
    id: string;
    stem: string;
    passage: string | null;
    format: "discrete" | "passage";
    section: string;
    source_material: string | null;
    difficulty: number | null;
    content_category_id: string | null;
    topic_id: string | null;
    subtopic_id: string | null;
    content_category?: { id: string; name: string; code: string | null } | null;
    topic?: { id: string; name: string; code: string | null } | null;
    subtopic?: { id: string; name: string; code: string | null } | null;
  } | null;
};

import { z } from "zod";

export const choiceLabelSchema = z.enum(["A", "B", "C", "D"]);

export const explanationSchema = z.object({
  correct_explanation: z.string().min(1),
  distractor_explanations: z.record(choiceLabelSchema, z.string().min(1)).default({}),
  key_concept: z.string().min(1),
  common_misconception: z.string().optional().nullable(),
});

export const classificationSchema = z.object({
  section: z
    .enum(["chem_phys", "cars", "bio_biochem", "psych_soc"])
    .nullable(),
  content_category_id: z.string().nullable(),
  topic_id: z.string().nullable(),
  subtopic_id: z.string().nullable(),
  reasoning_skills: z.array(z.string()).default([]),
  difficulty: z.number().min(1).max(5).nullable(),
  format: z.enum(["discrete", "passage"]).nullable(),
});

export const draftQuestionSchema = z.object({
  stem: z.string().min(1),
  passage: z.string().optional().nullable(),
  section: z.enum(["chem_phys", "cars", "bio_biochem", "psych_soc"]).optional(),
  format: z.enum(["discrete", "passage"]).optional(),
  difficulty: z.number().min(1).max(5).optional(),
  choices: z.array(
    z.object({
      label: choiceLabelSchema,
      text: z.string().min(1),
      is_correct: z.boolean().optional(),
    }),
  ).length(4),
  correct_label: choiceLabelSchema,
  brief_rationale: z.string().min(1),
  suggested_tags: z.array(z.string()).default([]),
});

export const draftQuestionsSchema = z.array(draftQuestionSchema);

export const diagnosisReportSchema = z.object({
  patterns: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      evidence_question_ids: z.array(z.string()),
      recommendation: z.string(),
    }),
  ),
  summary: z.string(),
});

export const planBlockSchema = z.object({
  id: z.string().optional(),
  date: z.string(),
  duration_min: z.number().int().min(5),
  activity: z.string(),
  topic_id: z.string().nullable().optional(),
  topic_name: z.string().nullable().optional(),
  description: z.string(),
  completed: z.boolean().default(false).optional(),
});

export const planNarrativeSchema = z.object({
  narrative: z.string(),
  blocks: z.array(planBlockSchema).optional(),
});

export type Explanation = z.infer<typeof explanationSchema>;
export type Classification = z.infer<typeof classificationSchema>;
export type DraftQuestion = z.infer<typeof draftQuestionSchema>;
export type DiagnosisReport = z.infer<typeof diagnosisReportSchema>;
export type PlanNarrative = z.infer<typeof planNarrativeSchema>;
export type PlanBlock = z.infer<typeof planBlockSchema>;

import { z } from "zod";

export const choiceLabelSchema = z.enum(["A", "B", "C", "D"]);

export const explanationSchema = z.object({
  correct_explanation: z.string().min(1),
  distractor_explanations: z.record(choiceLabelSchema, z.string().min(1)).default({}),
  key_concept: z.string().min(1),
  common_misconception: z.string().optional(),
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

export const planNarrativeSchema = z.object({
  narrative: z.string(),
});

export type Explanation = z.infer<typeof explanationSchema>;
export type Classification = z.infer<typeof classificationSchema>;
export type DraftQuestion = z.infer<typeof draftQuestionSchema>;
export type DiagnosisReport = z.infer<typeof diagnosisReportSchema>;
export type PlanNarrative = z.infer<typeof planNarrativeSchema>;

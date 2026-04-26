import { z } from "zod";
export const explanationSchema = z.object({
  correct_explanation: z.string(),
  distractor_explanations: z.record(z.string()),
  key_concept: z.string(),
  common_misconception: z.string().optional()
});
export const classificationSchema = z.object({
  section: z.string().nullable(),
  content_category_id: z.string().nullable(),
  topic_id: z.string().nullable(),
  subtopic_id: z.string().nullable().optional(),
  reasoning_skills: z.array(z.string()),
  difficulty: z.number().min(1).max(5).nullable(),
  format: z.enum(["discrete", "passage"]).nullable()
});

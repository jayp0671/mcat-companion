import { z } from "zod";

export const answerLabelSchema = z
  .string()
  .trim()
  .min(1)
  .max(20);

export const sectionSchema = z.enum([
  "chem_phys",
  "cars",
  "bio_biochem",
  "psych_soc",
]);

export const questionFormatSchema = z.enum(["discrete", "passage"]);

export const mistakeChoiceSchema = z.object({
  label: z.enum(["A", "B", "C", "D"]),
  text: z.string().trim().max(2000).optional().default(""),
});

export const createMistakeSchema = z.object({
  stem: z.string().trim().min(10, "Question stem is required."),
  passage: z.string().trim().max(10000).optional().nullable(),
  source_material: z.string().trim().max(255).optional().nullable(),
  section: sectionSchema,
  content_category_id: z.string().uuid().optional().nullable(),
  topic_id: z.string().uuid().optional().nullable(),
  subtopic_id: z.string().uuid().optional().nullable(),
  reasoning_skill_ids: z.array(z.string().uuid()).optional().default([]),
  format: questionFormatSchema.default("discrete"),
  difficulty: z.coerce.number().int().min(1).max(5).default(3),
  her_selected_answer: answerLabelSchema,
  correct_answer: answerLabelSchema,
  her_confidence: z.coerce.number().int().min(1).max(5).optional().nullable(),
  time_spent_seconds: z.coerce.number().int().min(0).optional().nullable(),
  notes: z.string().trim().max(5000).optional().nullable(),
  choices: z.array(mistakeChoiceSchema).optional().default([]),
});

export const updateMistakeSchema = z.object({
  notes: z.string().trim().max(5000).optional().nullable(),
  her_confidence: z.coerce.number().int().min(1).max(5).optional().nullable(),
  time_spent_seconds: z.coerce.number().int().min(0).optional().nullable(),
});

export const bulkMistakePreviewSchema = z.object({
  raw_text: z.string().trim().min(1),
});

export type CreateMistakeInput = z.infer<typeof createMistakeSchema>;
export type UpdateMistakeInput = z.infer<typeof updateMistakeSchema>;

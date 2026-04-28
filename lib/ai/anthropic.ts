import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/config";
import type {
  ClassifyInput,
  DiagnoseInput,
  ExplanationInput,
  LLMProvider,
  ParseImportInput,
  PlanInput,
  QuestionGenInput,
} from "./types";
import {
  classificationSchema,
  diagnosisReportSchema,
  draftQuestionsSchema,
  explanationSchema,
  importedMistakeDraftSchema,
  planNarrativeSchema,
} from "./validators";

function requireValue(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function extractJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const objectStart = cleaned.indexOf("{");
    const objectEnd = cleaned.lastIndexOf("}");
    const arrayStart = cleaned.indexOf("[");
    const arrayEnd = cleaned.lastIndexOf("]");

    if (arrayStart !== -1 && arrayEnd > arrayStart) {
      return JSON.parse(cleaned.slice(arrayStart, arrayEnd + 1));
    }

    if (objectStart !== -1 && objectEnd > objectStart) {
      return JSON.parse(cleaned.slice(objectStart, objectEnd + 1));
    }

    throw new Error("AI provider returned non-JSON output.");
  }
}

function questionsArray(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    data &&
    typeof data === "object" &&
    "questions" in data &&
    Array.isArray((data as { questions?: unknown }).questions)
  ) {
    return (data as { questions: unknown[] }).questions;
  }

  throw new Error("AI provider did not return a questions array.");
}

export class AnthropicProvider implements LLMProvider {
  private readonly client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: requireValue("ANTHROPIC_API_KEY", env.ANTHROPIC_API_KEY),
    });
  }

  private async jsonCall(instruction: string, input: unknown) {
    const message = await this.client.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 2200,
      temperature: 0.25,
      messages: [
        {
          role: "user",
          content: `${instruction}\n\nReturn only valid JSON. No markdown.\n\nInput:\n${JSON.stringify(input)}`,
        },
      ],
    });

    const text = message.content[0]?.type === "text" ? message.content[0].text : "";
    if (!text) {
      throw new Error("Anthropic returned an empty response.");
    }

    return extractJson(text);
  }

  async generateExplanation(input: ExplanationInput) {
    const data = await this.jsonCall(
      "Generate an MCAT explanation as {correct_explanation,distractor_explanations,key_concept,common_misconception}. Include A-D distractor rationales when choices are available.",
      input,
    );

    return explanationSchema.parse(data);
  }

  async generateQuestion(input: QuestionGenInput) {
    const data = await this.jsonCall(
      "Generate original, supplementary MCAT-style practice questions. Return {questions:[...]} with exactly four choices per question and one correct_label. Never copy commercial prep material.",
      input,
    );

    return draftQuestionsSchema.parse(questionsArray(data));
  }


  async parseImportedMistake(input: ParseImportInput) {
    const data = await this.jsonCall(
      [
        "Parse copied MCAT practice-question text into a mistake-log draft.",
        "Return JSON with stem, passage, source_material, section, format, difficulty, content_category_id, topic_id, subtopic_id, reasoning_skill_ids, choices, her_selected_answer, correct_answer, her_confidence, time_spent_seconds, notes, parser_confidence, needs_review, and warnings.",
        "Use only supplied taxonomy/reasoning-skill IDs when clearly supported. Otherwise return null or an empty array.",
        "Do not invent missing answer choice text. The student will review before saving.",
      ].join("\n"),
      input,
    );

    return importedMistakeDraftSchema.parse(data);
  }

  async classifyQuestion(input: ClassifyInput) {
    const data = await this.jsonCall(
      "Classify the question using only supplied taxonomy IDs. Return null for uncertain IDs.",
      input,
    );

    return classificationSchema.parse(data);
  }

  async diagnoseMistakes(input: DiagnoseInput) {
    const data = await this.jsonCall(
      "Diagnose evidence-backed MCAT mistake patterns. Return {patterns,summary}. Do not fabricate patterns.",
      input,
    );

    return diagnosisReportSchema.parse(data);
  }

  async generatePlanNarrative(input: PlanInput) {
    const data = await this.jsonCall(
      "Write a concise narrative for the supplied deterministic MCAT study plan. Return {narrative,blocks?}. Do not change dates or durations.",
      input,
    );

    return planNarrativeSchema.parse(data);
  }
}

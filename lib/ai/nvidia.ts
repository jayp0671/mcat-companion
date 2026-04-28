import OpenAI from "openai";
import { env } from "@/lib/config";
import { AiProviderError } from "./errors";
import type {
  ClassifyInput,
  DiagnoseInput,
  ExplanationInput,
  LLMProvider,
  PlanInput,
  QuestionGenInput,
} from "./types";
import {
  classificationSchema,
  diagnosisReportSchema,
  draftQuestionsSchema,
  explanationSchema,
  planNarrativeSchema,
} from "./validators";

function requireValue(name: string, value: string | undefined): string {
  if (!value) {
    throw new AiProviderError("nvidia", `Missing required environment variable: ${name}`);
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

    throw new AiProviderError("nvidia", "AI provider returned non-JSON output.");
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

  throw new AiProviderError("nvidia", "AI provider did not return a questions array.");
}

export class NvidiaProvider implements LLMProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor() {
    this.model = requireValue("NVIDIA_MODEL", env.NVIDIA_MODEL);
    this.client = new OpenAI({
      baseURL: requireValue("NVIDIA_BASE_URL", env.NVIDIA_BASE_URL),
      apiKey: requireValue("NVIDIA_API_KEY", env.NVIDIA_API_KEY),
    });
  }

  private async jsonCall(system: string, input: unknown) {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.25,
        max_tokens: env.MAX_TOKENS_PER_CALL,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: JSON.stringify(input) },
        ],
      });

      const text = response.choices[0]?.message?.content;
      if (!text) {
        throw new AiProviderError("nvidia", "NVIDIA returned an empty response.");
      }

      return extractJson(text);
    } catch (error) {
      if (error instanceof AiProviderError) {
        throw error;
      }

      throw new AiProviderError("nvidia", error instanceof Error ? error.message : "NVIDIA request failed", error);
    }
  }

  async generateExplanation(input: ExplanationInput) {
    const data = await this.jsonCall(
      [
        "You are a careful MCAT tutor.",
        "Return only valid JSON. No markdown. No prose outside JSON.",
        "Use this exact shape:",
        "{\"correct_explanation\": string, \"distractor_explanations\": {\"A\": string, \"B\": string, \"C\": string, \"D\": string}, \"key_concept\": string, \"common_misconception\": string | null}",
        "Explain why the correct answer is right from first principles.",
        "For each distractor A-D, explain the misconception or why it is wrong.",
        "Do not invent facts beyond the provided question context.",
        "Remind the student to cross-check official explanations when relevant.",
      ].join("\n"),
      input,
    );

    try {
      return explanationSchema.parse(data);
    } catch (error) {
      throw new AiProviderError("nvidia", "NVIDIA explanation output failed schema validation.", error);
    }
  }

  async generateQuestion(input: QuestionGenInput) {
    const data = await this.jsonCall(
      [
        "Generate original MCAT-style multiple-choice practice questions.",
        "Do not copy, paraphrase, or reference commercial prep questions.",
        "Return only valid JSON in the shape {\"questions\": [...] }.",
        "Each question must include stem, optional passage, section, format, difficulty, choices with labels A-D, correct_label, brief_rationale, and suggested_tags.",
        "Exactly four choices. Exactly one correct answer. Keep it clearly labeled as supplementary AI-generated practice.",
      ].join("\n"),
      input,
    );

    try {
      return draftQuestionsSchema.parse(questionsArray(data));
    } catch (error) {
      throw new AiProviderError("nvidia", "NVIDIA question output failed schema validation.", error);
    }
  }

  async classifyQuestion(input: ClassifyInput) {
    const data = await this.jsonCall(
      [
        "Classify an MCAT question against the supplied taxonomy.",
        "Return only valid JSON with section, content_category_id, topic_id, subtopic_id, reasoning_skills, difficulty, and format.",
        "Use null when uncertain. Do not make up taxonomy IDs.",
      ].join("\n"),
      input,
    );

    return classificationSchema.parse(data);
  }

  async diagnoseMistakes(input: DiagnoseInput) {
    const data = await this.jsonCall(
      [
        "Analyze MCAT mistake patterns from the supplied recent mistakes.",
        "Return only valid JSON with {patterns:[{name,description,evidence_question_ids,recommendation}], summary}.",
        "Only cite patterns supported by the provided evidence. Do not fabricate trends.",
      ].join("\n"),
      input,
    );

    return diagnosisReportSchema.parse(data);
  }

  async generatePlanNarrative(input: PlanInput) {
    const data = await this.jsonCall(
      [
        "Turn the deterministic MCAT study plan into concise student-facing JSON.",
        "Return only valid JSON with {narrative:string, blocks?:array}.",
        "Do not change total hours, dates, topic IDs, or block durations. You may improve descriptions and motivation notes.",
      ].join("\n"),
      input,
    );

    return planNarrativeSchema.parse(data);
  }
}

import OpenAI from "openai";
import { env } from "@/lib/config";
import { MockProvider } from "./mock";
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

function safeJson(text: string) {
  try { return JSON.parse(text); } catch { return {}; }
}

export class NvidiaProvider implements LLMProvider {
  private readonly client = env.NVIDIA_API_KEY
    ? new OpenAI({ baseURL: env.NVIDIA_BASE_URL, apiKey: env.NVIDIA_API_KEY })
    : null;

  private readonly mock = new MockProvider();

  private async jsonCall(system: string, input: unknown) {
    if (!this.client) return null;
    const response = await this.client.chat.completions.create({
      model: env.NVIDIA_MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(input) },
      ],
    });
    return safeJson(response.choices[0]?.message?.content ?? "{}");
  }

  async generateExplanation(input?: ExplanationInput) {
    const data = await this.jsonCall(
      "You are an MCAT tutor. Return only JSON with correct_explanation, distractor_explanations, key_concept, and common_misconception. Keep explanations concise and cross-checkable.",
      input,
    );
    if (!data) return this.mock.generateExplanation(input);
    return explanationSchema.parse(data);
  }

  async generateQuestion(input?: QuestionGenInput) {
    const data = await this.jsonCall(
      "Generate original, AI-labeled MCAT-style multiple choice practice. Return JSON array of draft questions or {questions:[...]}. Do not copy commercial prep material.",
      input,
    );
    if (!data) return this.mock.generateQuestion(input);
    const asArray = Array.isArray(data) ? data : (Array.isArray((data as any).questions) ? (data as any).questions : []);
    return draftQuestionsSchema.parse(asArray);
  }

  async classifyQuestion(input?: ClassifyInput) {
    const data = await this.jsonCall(
      "Classify an MCAT question. Return JSON with section, content_category_id, topic_id, subtopic_id, reasoning_skills, difficulty, and format. Use null when unsure.",
      input,
    );
    if (!data) return this.mock.classifyQuestion(input);
    return classificationSchema.parse(data);
  }

  async diagnoseMistakes(input?: DiagnoseInput) {
    const data = await this.jsonCall(
      "Analyze MCAT mistake patterns. Only cite patterns supported by evidence. Return JSON with patterns and summary.",
      input,
    );
    if (!data) return this.mock.diagnoseMistakes(input);
    return diagnosisReportSchema.parse(data);
  }

  async generatePlanNarrative(input?: PlanInput) {
    const data = await this.jsonCall(
      "Turn a deterministic MCAT study plan into a concise student-facing JSON narrative. Do not change block durations or topic IDs.",
      input,
    );
    if (!data) return this.mock.generatePlanNarrative(input);
    return planNarrativeSchema.parse(data);
  }
}

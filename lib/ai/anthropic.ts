import Anthropic from "@anthropic-ai/sdk";
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

export class AnthropicProvider implements LLMProvider {
  private readonly client = env.ANTHROPIC_API_KEY
    ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
    : null;

  private readonly mock = new MockProvider();

  private async jsonCall(instruction: string, input: unknown) {
    if (!this.client) return null;
    const message = await this.client.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 1800,
      temperature: 0.3,
      messages: [{ role: "user", content: `${instruction}\nReturn only valid JSON.\nInput: ${JSON.stringify(input)}` }],
    });
    const text = message.content[0]?.type === "text" ? message.content[0].text : "{}";
    return safeJson(text);
  }

  async generateExplanation(input?: ExplanationInput) {
    const data = await this.jsonCall("Generate a concise MCAT explanation with correct and distractor rationales.", input);
    if (!data) return this.mock.generateExplanation(input);
    return explanationSchema.parse(data);
  }

  async generateQuestion(input?: QuestionGenInput) {
    const data = await this.jsonCall("Generate original MCAT-style practice questions as a JSON array or {questions:[...]}.", input);
    if (!data) return this.mock.generateQuestion(input);
    const asArray = Array.isArray(data) ? data : (Array.isArray((data as any).questions) ? (data as any).questions : []);
    return draftQuestionsSchema.parse(asArray);
  }

  async classifyQuestion(input?: ClassifyInput) {
    const data = await this.jsonCall("Classify the question against supplied MCAT taxonomy IDs.", input);
    if (!data) return this.mock.classifyQuestion(input);
    return classificationSchema.parse(data);
  }

  async diagnoseMistakes(input?: DiagnoseInput) {
    const data = await this.jsonCall("Diagnose evidence-backed MCAT mistake patterns.", input);
    if (!data) return this.mock.diagnoseMistakes(input);
    return diagnosisReportSchema.parse(data);
  }

  async generatePlanNarrative(input?: PlanInput) {
    const data = await this.jsonCall("Create a concise narrative for the supplied MCAT study plan.", input);
    if (!data) return this.mock.generatePlanNarrative(input);
    return planNarrativeSchema.parse(data);
  }
}

import OpenAI from "openai";
import { env } from "@/lib/config";
import type { ExplanationInput, LLMProvider, QuestionGenInput, ClassifyInput, DiagnoseInput, PlanInput } from "./types";
import { MockProvider } from "./mock";

export class NvidiaProvider implements LLMProvider {
  private client = new OpenAI({ apiKey: env.NVIDIA_API_KEY, baseURL: env.NVIDIA_BASE_URL });
  private mock = new MockProvider();

  async generateExplanation(input: ExplanationInput) {
    if (!env.NVIDIA_API_KEY) return this.mock.generateExplanation(input);
    const completion = await this.client.chat.completions.create({
      model: env.NVIDIA_MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a careful MCAT explanation assistant. Return valid JSON only." },
        { role: "user", content: JSON.stringify(input) }
      ]
    });
    return JSON.parse(completion.choices[0]?.message?.content ?? "{}");
  }
  async generateQuestion(input: QuestionGenInput) { return this.mock.generateQuestion(input); }
  async classifyQuestion(input: ClassifyInput) { return this.mock.classifyQuestion(input); }
  async diagnoseMistakes(input: DiagnoseInput) { return this.mock.diagnoseMistakes(input); }
  async generatePlanNarrative(input: PlanInput) { return this.mock.generatePlanNarrative(input); }
}

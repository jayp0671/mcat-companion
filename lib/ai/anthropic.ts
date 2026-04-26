import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/config";
import type { LLMProvider, ExplanationInput, QuestionGenInput, ClassifyInput, DiagnoseInput, PlanInput } from "./types";
import { MockProvider } from "./mock";

export class AnthropicProvider implements LLMProvider {
  private client = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null;
  private mock = new MockProvider();
  async generateExplanation(input: ExplanationInput) {
    if (!this.client) return this.mock.generateExplanation(input);
    const message = await this.client.messages.create({ model: env.ANTHROPIC_MODEL, max_tokens: 1200, temperature: 0.3, messages: [{ role: "user", content: `Return JSON explanation for: ${JSON.stringify(input)}` }] });
    const text = message.content[0]?.type === "text" ? message.content[0].text : "{}";
    return JSON.parse(text);
  }
  async generateQuestion(input: QuestionGenInput) { return this.mock.generateQuestion(input); }
  async classifyQuestion(input: ClassifyInput) { return this.mock.classifyQuestion(input); }
  async diagnoseMistakes(input: DiagnoseInput) { return this.mock.diagnoseMistakes(input); }
  async generatePlanNarrative(input: PlanInput) { return this.mock.generatePlanNarrative(input); }
}

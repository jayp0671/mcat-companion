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
import { explanationSchema } from "./validators";

export class AnthropicProvider implements LLMProvider {
  private readonly client = env.ANTHROPIC_API_KEY
    ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
    : null;

  private readonly mock = new MockProvider();

  async generateExplanation(input?: ExplanationInput) {
    if (!this.client) return this.mock.generateExplanation(input);

    const message = await this.client.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 1200,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: `Return only valid JSON for an MCAT explanation: ${JSON.stringify(input)}`,
        },
      ],
    });

    const text = message.content[0]?.type === "text" ? message.content[0].text : "{}";
    return explanationSchema.parse(JSON.parse(text));
  }

  async generateQuestion(input?: QuestionGenInput) {
    return this.mock.generateQuestion(input);
  }

  async classifyQuestion(input?: ClassifyInput) {
    return this.mock.classifyQuestion(input);
  }

  async diagnoseMistakes(input?: DiagnoseInput) {
    return this.mock.diagnoseMistakes(input);
  }

  async generatePlanNarrative(input?: PlanInput) {
    return this.mock.generatePlanNarrative(input);
  }
}

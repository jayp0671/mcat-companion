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
import { explanationSchema } from "./validators";

export class NvidiaProvider implements LLMProvider {
  private readonly client = env.NVIDIA_API_KEY
    ? new OpenAI({ baseURL: env.NVIDIA_BASE_URL, apiKey: env.NVIDIA_API_KEY })
    : null;

  private readonly mock = new MockProvider();

  async generateExplanation(input?: ExplanationInput) {
    if (!this.client) return this.mock.generateExplanation(input);

    const response = await this.client.chat.completions.create({
      model: env.NVIDIA_MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an MCAT explanation assistant. Return only valid JSON matching the requested schema.",
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "{}";
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

import { env } from "@/lib/config";
import { AnthropicProvider } from "./anthropic";
import { getProvider } from "./index";
import { AiFallbackError } from "./errors";
import type {
  ClassifyInput,
  DiagnoseInput,
  ExplanationInput,
  PlanInput,
  QuestionGenInput,
} from "./types";

async function withOptionalAnthropicFallback<T>(operation: () => Promise<T>, fallbackOperation: () => Promise<T>) {
  try {
    return await operation();
  } catch (primaryError) {
    if (!env.ANTHROPIC_API_KEY) {
      throw new AiFallbackError(primaryError);
    }

    try {
      return await fallbackOperation();
    } catch (fallbackError) {
      throw new AiFallbackError(primaryError, fallbackError);
    }
  }
}

export async function generateExplanationWithFallback(input: ExplanationInput) {
  return withOptionalAnthropicFallback(
    () => getProvider().generateExplanation(input),
    () => new AnthropicProvider().generateExplanation(input),
  );
}

export async function generateQuestionsWithFallback(input: QuestionGenInput) {
  return withOptionalAnthropicFallback(
    () => getProvider().generateQuestion(input),
    () => new AnthropicProvider().generateQuestion(input),
  );
}

export async function classifyQuestionWithFallback(input: ClassifyInput) {
  return withOptionalAnthropicFallback(
    () => getProvider().classifyQuestion(input),
    () => new AnthropicProvider().classifyQuestion(input),
  );
}

export async function diagnoseMistakesWithFallback(input: DiagnoseInput) {
  return withOptionalAnthropicFallback(
    () => getProvider().diagnoseMistakes(input),
    () => new AnthropicProvider().diagnoseMistakes(input),
  );
}

export async function generatePlanNarrativeWithFallback(input: PlanInput) {
  return withOptionalAnthropicFallback(
    () => getProvider().generatePlanNarrative(input),
    () => new AnthropicProvider().generatePlanNarrative(input),
  );
}

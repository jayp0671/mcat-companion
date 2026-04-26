import { AnthropicProvider } from "./anthropic";
import { getProvider } from "./index";
import type {
  ClassifyInput,
  DiagnoseInput,
  ExplanationInput,
  PlanInput,
  QuestionGenInput,
} from "./types";

export async function generateExplanationWithFallback(input: ExplanationInput) {
  try { return await getProvider().generateExplanation(input); }
  catch { return new AnthropicProvider().generateExplanation(input); }
}

export async function generateQuestionsWithFallback(input: QuestionGenInput) {
  try { return await getProvider().generateQuestion(input); }
  catch { return new AnthropicProvider().generateQuestion(input); }
}

export async function classifyQuestionWithFallback(input: ClassifyInput) {
  try { return await getProvider().classifyQuestion(input); }
  catch { return new AnthropicProvider().classifyQuestion(input); }
}

export async function diagnoseMistakesWithFallback(input: DiagnoseInput) {
  try { return await getProvider().diagnoseMistakes(input); }
  catch { return new AnthropicProvider().diagnoseMistakes(input); }
}

export async function generatePlanNarrativeWithFallback(input: PlanInput) {
  try { return await getProvider().generatePlanNarrative(input); }
  catch { return new AnthropicProvider().generatePlanNarrative(input); }
}

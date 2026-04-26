import { AnthropicProvider } from "./anthropic";
import type { ExplanationInput } from "./types";
import { getProvider } from "./index";
export async function generateExplanationWithFallback(input: ExplanationInput) {
  try { return await getProvider().generateExplanation(input); }
  catch { return new AnthropicProvider().generateExplanation(input); }
}

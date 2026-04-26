import { generateExplanationWithFallback } from "@/lib/ai/retry";
import type { ExplanationInput } from "@/lib/ai/types";
export async function explainMistake(input: ExplanationInput) { return generateExplanationWithFallback(input); }

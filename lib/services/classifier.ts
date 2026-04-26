import { getProvider } from "@/lib/ai";
import type { ClassifyInput } from "@/lib/ai/types";
export async function classifyQuestion(input: ClassifyInput) { return getProvider().classifyQuestion(input); }

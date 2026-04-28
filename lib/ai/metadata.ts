import { env } from "@/lib/config";

export type AiGenerationKind =
  | "explanation"
  | "question"
  | "classification"
  | "diagnosis"
  | "plan"
  | "recommendation";

export function getAiProviderMetadata() {
  const provider = env.LLM_PROVIDER ?? "nvidia";

  if (provider === "nvidia") {
    return {
      provider: "nvidia",
      model: env.NVIDIA_MODEL ?? "meta/llama-3.3-70b-instruct",
    };
  }

  if (provider === "anthropic") {
    return {
      provider: "anthropic",
      model: env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001",
    };
  }

  if (provider === "mock") {
    return {
      provider: "mock-test-only",
      model: "mock-test-only",
    };
  }

  return {
    provider,
    model: "unknown",
  };
}

export function getRulesEngineMetadata() {
  return {
    provider: "rules",
    model: "rules-v1",
  };
}

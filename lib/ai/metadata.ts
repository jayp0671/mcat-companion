import { env } from "@/lib/config";

export type AiGenerationKind =
  | "explanation"
  | "question"
  | "classification"
  | "diagnosis"
  | "plan"
  | "recommendation";

export function getAiProviderMetadata() {
  const provider = env.LLM_PROVIDER ?? "mock";

  if (provider === "mock") {
    return {
      provider: "mock",
      model: "mock",
    };
  }

  if (provider === "nvidia") {
    return {
      provider: "nvidia",
      model: env.NVIDIA_MODEL ?? "unknown-nvidia-model",
    };
  }

  if (provider === "anthropic") {
    return {
      provider: "anthropic",
      model: env.ANTHROPIC_MODEL ?? "unknown-anthropic-model",
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

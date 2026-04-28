import { env } from "@/lib/config";
import { NvidiaProvider } from "./nvidia";
import { AnthropicProvider } from "./anthropic";
import { MockProvider } from "./mock";
import type { LLMProvider } from "./types";

export function getProvider(): LLMProvider {
  const provider = env.LLM_PROVIDER ?? "nvidia";

  if (provider === "mock" && process.env.NODE_ENV !== "test") {
    throw new Error(
      "LLM_PROVIDER=mock is test-only. Set LLM_PROVIDER=nvidia or LLM_PROVIDER=anthropic for live app usage.",
    );
  }

  switch (provider) {
    case "nvidia":
      return new NvidiaProvider();
    case "anthropic":
      return new AnthropicProvider();
    case "mock":
      return new MockProvider();
    default:
      throw new Error(`Unsupported LLM_PROVIDER: ${provider}`);
  }
}

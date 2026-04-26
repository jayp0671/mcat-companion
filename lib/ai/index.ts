import { env } from "@/lib/config";
import { NvidiaProvider } from "./nvidia";
import { AnthropicProvider } from "./anthropic";
import { MockProvider } from "./mock";
import type { LLMProvider } from "./types";

export function getProvider(): LLMProvider {
  switch (env.LLM_PROVIDER) {
    case "nvidia": return new NvidiaProvider();
    case "anthropic": return new AnthropicProvider();
    case "mock": return new MockProvider();
    default: return new MockProvider();
  }
}

import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  LLM_PROVIDER: z.enum(["nvidia", "anthropic", "mock"]).default("nvidia"),
  NVIDIA_API_KEY: z.string().optional(),
  NVIDIA_BASE_URL: z.string().url().default("https://integrate.api.nvidia.com/v1"),
  NVIDIA_MODEL: z.string().default("meta/llama-3.3-70b-instruct"),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default("claude-haiku-4-5-20251001"),

  ADMIN_PASSWORD: z.string().optional(),

  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),

  PRACTICE_ENABLED: z.string().default("true"),
  AI_GENERATION_ENABLED: z.string().default("true"),
  MAX_AI_CALLS_PER_DAY: z.coerce.number().default(100),
  MAX_TOKENS_PER_CALL: z.coerce.number().default(4000),
});

export const env = envSchema.parse(process.env);

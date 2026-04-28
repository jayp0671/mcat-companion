export class AiProviderError extends Error {
  provider: string;
  causeMessage?: string;

  constructor(provider: string, message: string, cause?: unknown) {
    super(`[${provider}] ${message}`);
    this.name = "AiProviderError";
    this.provider = provider;
    this.causeMessage = cause instanceof Error ? cause.message : typeof cause === "string" ? cause : undefined;
  }
}

export class AiFallbackError extends Error {
  primaryError: string;
  fallbackError?: string;

  constructor(primaryError: unknown, fallbackError?: unknown) {
    const primary = primaryError instanceof Error ? primaryError.message : String(primaryError);
    const fallback = fallbackError instanceof Error ? fallbackError.message : fallbackError ? String(fallbackError) : undefined;
    super(fallback ? `AI provider failed. Primary: ${primary}. Fallback: ${fallback}` : `AI provider failed. Primary: ${primary}`);
    this.name = "AiFallbackError";
    this.primaryError = primary;
    this.fallbackError = fallback;
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

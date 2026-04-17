export type { LLMProvider, CompletionOptions, CompletionResult } from "./types";
export { AnthropicProvider } from "./anthropic";
export { OpenAIProvider } from "./openai";
export { GeminiProvider } from "./gemini";
export { OllamaProvider } from "./ollama";

import type { LLMProvider } from "./types";
import { AnthropicProvider } from "./anthropic";
import { OpenAIProvider } from "./openai";
import { GeminiProvider } from "./gemini";
import { OllamaProvider } from "./ollama";

export type ProviderName = "anthropic" | "openai" | "gemini" | "ollama";

/**
 * Create an LLM provider from config.
 * Defaults to Anthropic if GIGOPS_PROVIDER is not set.
 */
export function createProvider(name?: ProviderName): LLMProvider {
  const provider = name ?? (process.env.GIGOPS_PROVIDER as ProviderName | undefined) ?? "anthropic";

  switch (provider) {
    case "anthropic":
      return new AnthropicProvider();
    case "openai":
      return new OpenAIProvider();
    case "gemini":
      return new GeminiProvider();
    case "ollama":
      return new OllamaProvider();
    default:
      throw new Error(
        `Unknown provider "${provider}". Valid options: anthropic, openai, gemini, ollama`
      );
  }
}

/** Singleton instance — lazily created on first use */
let _defaultProvider: LLMProvider | null = null;

export function getProvider(): LLMProvider {
  if (!_defaultProvider) {
    _defaultProvider = createProvider();
  }
  return _defaultProvider;
}

/** Reset the singleton (useful for tests) */
export function resetProvider(): void {
  _defaultProvider = null;
}

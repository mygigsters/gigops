/**
 * LLM Provider abstraction for GigOps.
 *
 * All providers implement this interface so the rest of the codebase
 * never touches vendor SDKs directly.
 */

export interface CompletionOptions {
  /** System prompt / instructions */
  system?: string;
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Temperature (0-1) */
  temperature?: number;
  /** Model override (uses provider default if omitted) */
  model?: string;
}

export interface CompletionResult {
  /** The generated text */
  text: string;
  /** Model that was used */
  model: string;
  /** Token usage when available */
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
}

export interface LLMProvider {
  readonly name: string;
  complete(prompt: string, options?: CompletionOptions): Promise<CompletionResult>;
}

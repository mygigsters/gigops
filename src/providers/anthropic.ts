import Anthropic from "@anthropic-ai/sdk";
import type { LLMProvider, CompletionOptions, CompletionResult } from "./types.js";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic";
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({ apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY });
  }

  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    const model = options.model ?? process.env.GIGOPS_ANTHROPIC_MODEL ?? DEFAULT_MODEL;
    const response = await this.client.messages.create({
      model,
      max_tokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0,
      ...(options.system ? { system: options.system } : {}),
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    return {
      text,
      model: response.model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }
}

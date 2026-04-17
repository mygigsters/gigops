import OpenAI from "openai";
import type { LLMProvider, CompletionOptions, CompletionResult } from "./types.js";

const DEFAULT_MODEL = "gpt-4o";

export class OpenAIProvider implements LLMProvider {
  readonly name = "openai";
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({ apiKey: apiKey ?? process.env.OPENAI_API_KEY });
  }

  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    const model = options.model ?? process.env.GIGOPS_OPENAI_MODEL ?? DEFAULT_MODEL;
    const messages: OpenAI.ChatCompletionMessageParam[] = [];

    if (options.system) {
      messages.push({ role: "system", content: options.system });
    }
    messages.push({ role: "user", content: prompt });

    const response = await this.client.chat.completions.create({
      model,
      max_tokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0,
      messages,
    });

    const text = response.choices[0]?.message?.content ?? "";

    return {
      text,
      model: response.model,
      usage: {
        inputTokens: response.usage?.prompt_tokens,
        outputTokens: response.usage?.completion_tokens,
      },
    };
  }
}

import { Ollama } from "ollama";
import type { LLMProvider, CompletionOptions, CompletionResult } from "./types.js";

const DEFAULT_MODEL = "llama3";

export class OllamaProvider implements LLMProvider {
  readonly name = "ollama";
  private client: Ollama;

  constructor(host?: string) {
    this.client = new Ollama({ host: host ?? process.env.OLLAMA_HOST ?? "http://localhost:11434" });
  }

  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    const model = options.model ?? process.env.GIGOPS_OLLAMA_MODEL ?? DEFAULT_MODEL;
    const messages: Array<{ role: "system" | "user"; content: string }> = [];

    if (options.system) {
      messages.push({ role: "system", content: options.system });
    }
    messages.push({ role: "user", content: prompt });

    const response = await this.client.chat({
      model,
      messages,
      options: {
        temperature: options.temperature ?? 0,
        num_predict: options.maxTokens ?? 4096,
      },
    });

    return {
      text: response.message.content,
      model,
      usage: {
        inputTokens: response.prompt_eval_count,
        outputTokens: response.eval_count,
      },
    };
  }
}

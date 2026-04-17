import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LLMProvider, CompletionOptions, CompletionResult } from "./types.js";

const DEFAULT_MODEL = "gemini-2.0-flash";

export class GeminiProvider implements LLMProvider {
  readonly name = "gemini";
  private genAI: GoogleGenerativeAI;

  constructor(apiKey?: string) {
    const key = apiKey ?? process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
    if (!key) throw new Error("Gemini API key required (GEMINI_API_KEY or GOOGLE_API_KEY)");
    this.genAI = new GoogleGenerativeAI(key);
  }

  async complete(prompt: string, options: CompletionOptions = {}): Promise<CompletionResult> {
    const modelName = options.model ?? process.env.GIGOPS_GEMINI_MODEL ?? DEFAULT_MODEL;
    const model = this.genAI.getGenerativeModel({
      model: modelName,
      ...(options.system ? { systemInstruction: options.system } : {}),
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: options.maxTokens ?? 4096,
        temperature: options.temperature ?? 0,
      },
    });

    const response = result.response;
    const text = response.text();
    const usage = response.usageMetadata;

    return {
      text,
      model: modelName,
      usage: {
        inputTokens: usage?.promptTokenCount,
        outputTokens: usage?.candidatesTokenCount,
      },
    };
  }
}

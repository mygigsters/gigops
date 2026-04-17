import "dotenv/config";

export const config = {
  provider: process.env.GIGOPS_PROVIDER ?? "anthropic",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY,
  ollamaHost: process.env.OLLAMA_HOST ?? "http://localhost:11434",
  ollamaModel: process.env.GIGOPS_OLLAMA_MODEL ?? "llama3",
} as const;

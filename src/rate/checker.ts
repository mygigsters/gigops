import { getProvider } from "../providers/index.js";
import type { CompletionOptions } from "../providers/types.js";

export interface RateAnalysis {
  suggestedRate: number;
  currency: string;
  confidence: number;
  marketRange: { low: number; high: number };
  reasoning: string;
}

/**
 * Analyse market rates for a given skill set and gig type.
 */
export async function checkRate(
  skillSet: string[],
  gigType: string,
  region: string = "global",
  options?: CompletionOptions
): Promise<RateAnalysis> {
  const provider = getProvider();

  const response = await provider.complete(
    `Analyse freelance market rates.\n\nSkills: ${skillSet.join(", ")}\nGig type: ${gigType}\nRegion: ${region}\n\nRespond with JSON: { "suggestedRate": number, "currency": "USD", "confidence": 0-100, "marketRange": { "low": number, "high": number }, "reasoning": "..." }`,
    {
      system:
        "You are a freelance market rate analyst. Provide data-driven rate recommendations. Always respond with valid JSON only.",
      maxTokens: 1024,
      temperature: 0,
      ...options,
    }
  );

  return JSON.parse(response.text) as RateAnalysis;
}

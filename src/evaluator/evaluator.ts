import { getProvider } from "../providers/index.js";
import type { CompletionOptions } from "../providers/types.js";

export interface EvaluationResult {
  score: number;
  reasoning: string;
  recommendation: "accept" | "reject" | "negotiate";
}

/**
 * Evaluate a gig opportunity against the user's profile and preferences.
 */
export async function evaluateGig(
  gigDescription: string,
  userProfile: string,
  options?: CompletionOptions
): Promise<EvaluationResult> {
  const provider = getProvider();

  const response = await provider.complete(
    `Evaluate this gig opportunity for the following freelancer profile.\n\nGig:\n${gigDescription}\n\nProfile:\n${userProfile}\n\nRespond with JSON: { "score": 0-100, "reasoning": "...", "recommendation": "accept"|"reject"|"negotiate" }`,
    {
      system:
        "You are a freelance career advisor. Evaluate gig opportunities and return structured JSON assessments. Always respond with valid JSON only.",
      maxTokens: 1024,
      temperature: 0,
      ...options,
    }
  );

  return JSON.parse(response.text) as EvaluationResult;
}

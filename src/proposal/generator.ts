import { getProvider } from "../providers/index.js";
import type { CompletionOptions } from "../providers/types.js";

export interface ProposalResult {
  subject: string;
  body: string;
  estimatedHours: number;
}

/**
 * Generate a proposal/cover letter for a gig.
 */
export async function generateProposal(
  gigDescription: string,
  userProfile: string,
  tone: "professional" | "friendly" | "concise" = "professional",
  options?: CompletionOptions
): Promise<ProposalResult> {
  const provider = getProvider();

  const response = await provider.complete(
    `Write a proposal for this gig.\n\nGig:\n${gigDescription}\n\nFreelancer Profile:\n${userProfile}\n\nTone: ${tone}\n\nRespond with JSON: { "subject": "...", "body": "...", "estimatedHours": number }`,
    {
      system:
        "You are an expert freelance proposal writer. Generate compelling, tailored proposals. Always respond with valid JSON only.",
      maxTokens: 2048,
      temperature: 0.3,
      ...options,
    }
  );

  return JSON.parse(response.text) as ProposalResult;
}

import { getProvider } from "../providers/index.js";
import type { CompletionOptions } from "../providers/types.js";

export interface ClientIntel {
  summary: string;
  redFlags: string[];
  greenFlags: string[];
  riskLevel: "low" | "medium" | "high";
}

/**
 * Gather intelligence about a potential client based on available info.
 */
export async function analyseClient(
  clientInfo: string,
  options?: CompletionOptions
): Promise<ClientIntel> {
  const provider = getProvider();

  const response = await provider.complete(
    `Analyse this potential client for a freelancer.\n\nClient info:\n${clientInfo}\n\nRespond with JSON: { "summary": "...", "redFlags": [...], "greenFlags": [...], "riskLevel": "low"|"medium"|"high" }`,
    {
      system:
        "You are a freelancer's client vetting assistant. Identify red and green flags. Always respond with valid JSON only.",
      maxTokens: 1024,
      temperature: 0,
      ...options,
    }
  );

  return JSON.parse(response.text) as ClientIntel;
}

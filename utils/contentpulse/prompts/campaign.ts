import type { ContentBrief } from "../types";
export function campaignPrompt(brief: ContentBrief): string {
  return `Create one strategic campaign concept as JSON for Hoichoi. Brief: ${JSON.stringify(brief)}. Return name, description, and strategicIntent. Keep it culturally specific and avoid generic marketing language.`;
}

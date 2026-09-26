import type { ContentBrief, Language } from "../types";
export function facebookPrompt(
  brief: ContentBrief,
  language: Language,
  concept: string,
): string {
  return `Generate a Facebook post as JSON directly in ${language === "bn" ? "native Bengali" : "native English"}. Use conversational copy, a share-friendly 1:1 creative, and a question that invites discussion. Brief: ${JSON.stringify(brief)}. Concept: ${concept}. Return caption, title, cta, hashtags, creativePrompt, aspectRatio, rationale.`;
}

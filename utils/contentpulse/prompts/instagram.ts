import type { ContentBrief, Language } from "../types";
export function instagramPrompt(
  brief: ContentBrief,
  language: Language,
  concept: string,
): string {
  return `Generate an Instagram post as JSON from this brief, directly in ${language === "bn" ? "native Bengali" : "native English"}; do not translate from another draft. Use 9:16, energetic intimate tone, 5-10 hashtags, and a character-led visual hook. Brief: ${JSON.stringify(brief)}. Concept: ${concept}. Return caption, title, cta, hashtags, creativePrompt, aspectRatio, rationale.`;
}

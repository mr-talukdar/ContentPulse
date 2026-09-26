import type { ContentBrief, Language } from "../types";
export function youtubePrompt(
  brief: ContentBrief,
  language: Language,
  concept: string,
): string {
  return `Generate a YouTube post as JSON directly in ${language === "bn" ? "native Bengali" : "native English"}, from the brief rather than translating. Use a cinematic 16:9 composition, explanatory copy, 3-5 hashtags. Brief: ${JSON.stringify(brief)}. Concept: ${concept}. Return caption, title, cta, hashtags, creativePrompt, aspectRatio, rationale.`;
}

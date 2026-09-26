import type { GeneratedPost } from "../types";
export function retryPrompt(post: GeneratedPost, feedback: string): string {
  return `Regenerate this ${post.language === "bn" ? "native Bengali" : "native English"} post directly from its original brief context. Do not translate. Preserve platform ${post.platform} constraints. Previous post: ${JSON.stringify(post)}. Human feedback: ${feedback}. Return the same structured JSON fields.`;
}

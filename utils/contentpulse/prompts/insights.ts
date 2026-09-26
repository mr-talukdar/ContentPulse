import type { PostMetrics, GeneratedPost } from "../types";
export function insightsPrompt(
  posts: GeneratedPost[],
  metrics: PostMetrics[],
): string {
  return `Analyze these like-for-like content results for Hoichoi. Return a JSON array of insights with type, claim, recommendation, and sourcePostIds. The "type" field MUST be EXACTLY one of: "strong", "weak", "platform", "language", "creative", or "recommendation". Do not invent evidence. Posts: ${JSON.stringify(posts)} Metrics: ${JSON.stringify(metrics)}`;
}

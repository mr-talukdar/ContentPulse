import type { PostMetrics, GeneratedPost } from "../types";
export function insightsPrompt(
  posts: GeneratedPost[],
  metrics: PostMetrics[],
): string {
  return `Analyze these like-for-like content results for Hoichoi. Return a JSON array of insights with type, claim, recommendation, and sourcePostIds. Do not invent evidence. Posts: ${JSON.stringify(posts)} Metrics: ${JSON.stringify(metrics)}`;
}

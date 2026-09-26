import type { Insight, PostMetrics } from "../types";
export function reportPrompt(
  insights: Insight[],
  metrics: PostMetrics[],
): string {
  return `Synthesize a concise weekly content report as JSON with executiveSummary, whatWorked, whatUnderperformed, platformLearnings, languageLearnings, creativeLearnings, and recommendedNextActions. Cite only supplied evidence. Insights: ${JSON.stringify(insights)} Metrics: ${JSON.stringify(metrics)}`;
}

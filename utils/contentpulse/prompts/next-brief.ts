import type { Insight } from "../types";
export function nextBriefPrompt(insight: Insight): string {
  return `Turn this performance insight into an editable ContentBrief JSON. Keep the recommendation actionable and generate Bengali natively when Bengali is the primary language. Insight: ${JSON.stringify(insight)}`;
}

import {
  demoCampaigns,
  demoConcept,
  demoInsights,
  demoMetrics,
  demoPosts,
  demoReport,
} from "./demo-data";
import type {
  CampaignConcept,
  GeneratedPost,
  PostStatus,
  WeeklyReport,
} from "./types";

const campaigns = new Map(demoCampaigns.map((item) => [item.id, item]));
const concepts = new Map<string, CampaignConcept>([
  [demoConcept.id, demoConcept],
]);
const posts = new Map(demoPosts.map((item) => [item.id, item]));
const metrics = new Map(demoMetrics.map((item) => [item.postId, item]));
const insights = new Map(demoInsights.map((item) => [item.id, item]));
const reports = new Map<string, WeeklyReport>([[demoReport.id, demoReport]]);
posts.set("IG_004", {
  ...demoPosts[0],
  id: "IG_004",
  aspectRatio: "16:9",
  status: "scheduled",
  externalPostId: undefined,
  publishedAt: undefined,
  scheduledAt: "2026-09-26T18:30:00.000Z",
});

export const contentStore = {
  campaigns,
  concepts,
  posts,
  metrics,
  insights,
  reports,
  nextId(prefix: string, collection: Map<string, unknown>) {
    return `${prefix}_${String(collection.size + 1).padStart(3, "0")}`;
  },
  updatePostStatus(
    id: string,
    status: PostStatus,
    fields: Partial<GeneratedPost> = {},
  ) {
    const post = posts.get(id);
    if (!post) return undefined;
    const updated = { ...post, ...fields, status };
    posts.set(id, updated);
    return updated;
  },
};

export function getPost(id: string): GeneratedPost | undefined {
  return posts.get(id);
}
export function getCampaignPosts(campaignId: string): GeneratedPost[] {
  return [...posts.values()].filter((post) => post.campaignId === campaignId);
}

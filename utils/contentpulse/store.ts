import type {
  Campaign,
  CampaignConcept,
  GeneratedPost,
  Insight,
  PostMetrics,
  PostStatus,
  WeeklyReport,
} from "./types";

const campaigns = new Map<string, Campaign>();
const concepts = new Map<string, CampaignConcept>();
const posts = new Map<string, GeneratedPost>();
const metrics = new Map<string, PostMetrics>();
const insights = new Map<string, Insight>();
const reports = new Map<string, WeeklyReport>();

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

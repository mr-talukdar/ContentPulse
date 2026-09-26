import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type {
  Campaign,
  CampaignConcept,
  GeneratedPost,
  Insight,
  PostMetrics,
  WeeklyReport,
} from "./types";
import { normalizeHashtags } from "./normalize";

type Row = Record<string, unknown>;

type ContentRepository = {
  ownerId: string;
  listCampaigns(): Promise<Campaign[]>;
  saveCampaign(campaign: Campaign): Promise<void>;
  saveConcept(concept: CampaignConcept): Promise<void>;
  savePost(post: GeneratedPost): Promise<void>;
  getPost(id: string): Promise<GeneratedPost | undefined>;
  saveMetrics(metrics: PostMetrics): Promise<void>;
  listMetrics(postId?: string | null): Promise<PostMetrics[]>;
  saveInsight(insight: Insight): Promise<void>;
  saveReport(report: WeeklyReport): Promise<void>;
  listPosts(filters?: {
    platform?: string | null;
    status?: string | null;
    campaignId?: string | null;
  }): Promise<GeneratedPost[]>;
  listInsights(campaignId?: string | null): Promise<Insight[]>;
  listReports(): Promise<WeeklyReport[]>;
};

const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

function campaignFromRow(row: Row): Campaign {
  return {
    id: String(row.id),
    name: String(row.name),
    brief: row.brief as Campaign["brief"],
    status: row.status as Campaign["status"],
    createdAt: String(row.created_at),
  };
}
function postFromRow(row: Row): GeneratedPost {
  return {
    id: String(row.id),
    campaignId: String(row.campaign_id),
    conceptId: String(row.concept_id),
    platform: row.platform as GeneratedPost["platform"],
    language: row.language as GeneratedPost["language"],
    caption: String(row.caption),
    title: row.title ? String(row.title) : undefined,
    cta: String(row.cta),
    hashtags: (row.hashtags as string[]) ?? [],
    creativeUrl: row.creative_url ? String(row.creative_url) : undefined,
    creativePrompt: String(row.creative_prompt ?? ""),
    aspectRatio: String(row.aspect_ratio),
    model: row.model ? String(row.model) : undefined,
    rationale: String(row.rationale ?? ""),
    status: row.status as GeneratedPost["status"],
    rejectionReason: row.rejection_reason
      ? String(row.rejection_reason)
      : undefined,
    scheduledAt: row.scheduled_at ? String(row.scheduled_at) : undefined,
    publishedAt: row.published_at ? String(row.published_at) : undefined,
    externalPostId: row.external_post_id
      ? String(row.external_post_id)
      : undefined,
  };
}
function metricsFromRow(row: Row): PostMetrics {
  return {
    id: String(row.id),
    postId: String(row.post_id),
    impressions: Number(row.impressions),
    reach: row.reach == null ? undefined : Number(row.reach),
    views: row.views == null ? undefined : Number(row.views),
    likes: Number(row.likes),
    comments: Number(row.comments),
    shares: Number(row.shares),
    saves: row.saves == null ? undefined : Number(row.saves),
    engagementRate: Number(row.engagement_rate),
    createdAt: String(row.created_at),
  };
}
function insightFromRow(row: Row): Insight {
  return {
    id: String(row.id),
    campaignId: String(row.campaign_id),
    type: row.type as Insight["type"],
    claim: String(row.claim),
    recommendation: String(row.recommendation),
    sourcePostIds: (row.source_post_ids as string[]) ?? [],
    createdAt: String(row.created_at),
  };
}
function reportFromRow(row: Row): WeeklyReport {
  return {
    id: String(row.id),
    periodStart: String(row.period_start),
    periodEnd: String(row.period_end),
    content: row.content as WeeklyReport["content"],
    sourcePostIds: (row.source_post_ids as string[]) ?? [],
    createdAt: String(row.created_at),
  };
}

export async function getContentRepository(): Promise<ContentRepository | null> {
  if (!configured) return null;
  const supabase = createClient(await cookies());
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  const run = async (
    query: PromiseLike<{ error: { message: string } | null }>,
  ) => {
    const result = await query;
    if (result.error) throw new Error(result.error.message);
  };
  return {
    ownerId: user.id,
    async listCampaigns() {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []).map(campaignFromRow);
    },
    async saveCampaign(campaign) {
      await run(
        supabase.from("campaigns").upsert({
          id: campaign.id,
          name: campaign.name,
          brief: campaign.brief,
          status: campaign.status,
          owner_id: user.id,
          created_at: campaign.createdAt,
        }),
      );
    },
    async saveConcept(concept) {
      await run(
        supabase.from("campaign_concepts").upsert({
          id: concept.id,
          campaign_id: concept.campaignId,
          concept_name: concept.name,
          concept_description: concept.description,
          strategic_intent: concept.strategicIntent,
        }),
      );
    },
    async savePost(post) {
      await run(
        supabase.from("posts").upsert({
          id: post.id,
          campaign_id: post.campaignId,
          concept_id: post.conceptId,
          platform: post.platform,
          language: post.language,
          caption: post.caption,
          title: post.title,
          cta: post.cta,
          hashtags: normalizeHashtags(post.hashtags),
          creative_url: post.creativeUrl,
          creative_prompt: post.creativePrompt,
          aspect_ratio: post.aspectRatio,
          model: post.model,
          rationale: post.rationale,
          rejection_reason: post.rejectionReason,
          status: post.status,
          external_post_id: post.externalPostId,
          scheduled_at: post.scheduledAt,
          published_at: post.publishedAt,
        }),
      );
    },
    async getPost(id) {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data ? postFromRow(data) : undefined;
    },
    async saveMetrics(metrics) {
      await run(
        supabase.from("post_metrics").upsert({
          id: metrics.id,
          post_id: metrics.postId,
          impressions: metrics.impressions,
          reach: metrics.reach,
          views: metrics.views,
          likes: metrics.likes,
          comments: metrics.comments,
          shares: metrics.shares,
          saves: metrics.saves,
          engagement_rate: metrics.engagementRate,
          created_at: metrics.createdAt,
        }),
      );
    },
    async listMetrics(postId) {
      let query = supabase
        .from("post_metrics")
        .select("*")
        .order("created_at", { ascending: false });
      if (postId) query = query.eq("post_id", postId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data ?? []).map(metricsFromRow);
    },
    async saveInsight(insight) {
      await run(
        supabase.from("insights").upsert({
          id: insight.id,
          campaign_id: insight.campaignId,
          type: insight.type,
          claim: insight.claim,
          recommendation: insight.recommendation,
          source_post_ids: insight.sourcePostIds,
          created_at: insight.createdAt,
        }),
      );
    },
    async saveReport(report) {
      await run(
        supabase.from("reports").upsert({
          id: report.id,
          owner_id: user.id,
          period_start: report.periodStart,
          period_end: report.periodEnd,
          content: report.content,
          source_post_ids: report.sourcePostIds,
          created_at: report.createdAt,
        }),
      );
    },
    async listPosts(filters = {}) {
      let query = supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (filters.platform) query = query.eq("platform", filters.platform);
      if (filters.status) query = query.eq("status", filters.status);
      if (filters.campaignId)
        query = query.eq("campaign_id", filters.campaignId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data ?? []).map(postFromRow);
    },
    async listInsights(campaignId) {
      let query = supabase
        .from("insights")
        .select("*")
        .order("created_at", { ascending: false });
      if (campaignId) query = query.eq("campaign_id", campaignId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data ?? []).map(insightFromRow);
    },
    async listReports() {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []).map(reportFromRow);
    },
  };
}

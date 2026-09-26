export type ReviewTone = "amber" | "slate" | "red";

export type Platform = "instagram" | "youtube" | "facebook";
export type Language = "bn" | "en";
export type PostStatus =
  | "draft"
  | "generating"
  | "review"
  | "rejected"
  | "approved"
  | "scheduled"
  | "published";

export type ContentBrief = {
  id: string;
  campaignName: string;
  objective: string;
  topic: string;
  audience: string;
  primaryLanguage: Language;
  secondaryLanguage?: Language;
  tone: string;
  cta: string;
  platforms: Platform[];
  context?: string;
};

export type Campaign = {
  id: string;
  name: string;
  brief: ContentBrief;
  status: "draft" | "active" | "completed";
  createdAt: string;
};

export type CampaignConcept = {
  id: string;
  campaignId: string;
  name: string;
  description: string;
  strategicIntent: string;
};

export type GeneratedPost = {
  id: string;
  campaignId: string;
  conceptId: string;
  platform: Platform;
  language: Language;
  caption: string;
  title?: string;
  cta: string;
  hashtags: string[];
  creativePrompt: string;
  creativeUrl?: string;
  aspectRatio: string;
  rationale: string;
  model?: string;
  status: PostStatus;
  rejectionReason?: string;
  scheduledAt?: string;
  publishedAt?: string;
  externalPostId?: string;
};

export type PostMetrics = {
  id: string;
  postId: string;
  impressions: number;
  reach?: number;
  views?: number;
  likes: number;
  comments: number;
  shares: number;
  saves?: number;
  engagementRate: number;
  createdAt: string;
};

export type Insight = {
  id: string;
  campaignId: string;
  type:
    | "strong"
    | "weak"
    | "platform"
    | "language"
    | "creative"
    | "recommendation";
  claim: string;
  recommendation: string;
  sourcePostIds: string[];
  createdAt: string;
};

export type WeeklyReport = {
  id: string;
  periodStart: string;
  periodEnd: string;
  content: {
    executiveSummary: string;
    whatWorked: string[];
    whatUnderperformed: string[];
    platformLearnings: string[];
    languageLearnings: string[];
    creativeLearnings: string[];
    recommendedNextActions: string[];
  };
  sourcePostIds: string[];
  createdAt: string;
};

export type Scene = {
  time: string;
  title: string;
  detail: string;
};

export type ReviewFlag = {
  time: string;
  category: string;
  severity: "Low" | "Medium" | "High";
  tone: ReviewTone;
  detail: string;
};

export type EpisodeAnalysis = {
  episode: {
    title: string;
    seasonEpisode: string;
    language: string;
    duration: string;
    analyzedAt: string;
  };
  stats: {
    value: string;
    label: string;
    note: string;
    icon: string;
  }[];
  summary: {
    title: string;
    body: string;
    confidence: string;
    tags: string[];
    suggestedTitle: string;
    viewerHook: string;
  };
  scenes: Scene[];
  reviewFlags: ReviewFlag[];
  promotion: {
    range: string;
    type: string;
    description: string;
  };
};

import type { EpisodeAnalysis } from "@/utils/contentpulse/types";
import type {
  Campaign,
  CampaignConcept,
  ContentBrief,
  GeneratedPost,
  Insight,
  PostMetrics,
  WeeklyReport,
} from "@/utils/contentpulse/types";

export const demoEpisode: EpisodeAnalysis = {
  episode: {
    title: "Raat Baaki",
    seasonEpisode: "S01 E03",
    language: "Bengali",
    duration: "46 min",
    analyzedAt: "Last analyzed today at 11:42",
  },
  stats: [
    { value: "46:12", label: "Episode duration", note: "Verified", icon: "◷" },
    {
      value: "18",
      label: "Scenes detected",
      note: "+ 4 key scenes",
      icon: "◫",
    },
    { value: "07", label: "Key moments", note: "3 promo-ready", icon: "✦" },
    { value: "03", label: "Review flags", note: "1 high severity", icon: "!" },
  ],
  summary: {
    title: "A secret returns to the surface",
    body: "Riya follows a recurring signal through a familiar neighborhood, uncovering a connection her family tried to bury. The episode moves from quiet investigation to a tense reveal, ending just as the consequences become unavoidable.",
    confidence: "92% grounded",
    tags: ["Drama", "Mystery", "Slow-burn", "Family secrets"],
    suggestedTitle: "The Signal",
    viewerHook: "What was hidden in plain sight?",
  },
  scenes: [
    {
      time: "00:00:00",
      title: "A quiet warning",
      detail: "The episode opens on an empty platform.",
    },
    {
      time: "00:08:14",
      title: "The pattern breaks",
      detail: "Riya notices the signal has returned.",
    },
    {
      time: "00:21:37",
      title: "An unexpected ally",
      detail: "A private conversation changes the plan.",
    },
    {
      time: "00:41:52",
      title: "The reveal",
      detail: "The missing connection finally surfaces.",
    },
  ],
  reviewFlags: [
    {
      time: "00:18:09",
      category: "Sensitive themes",
      severity: "Medium",
      tone: "amber",
      detail: "Discussion of loss may need contextual review.",
    },
    {
      time: "00:34:26",
      category: "Language",
      severity: "Low",
      tone: "slate",
      detail: "One phrase may require a regional language check.",
    },
    {
      time: "00:42:03",
      category: "Violence",
      severity: "High",
      tone: "red",
      detail: "Brief implied violence during the reveal.",
    },
  ],
  promotion: {
    range: "00:41:52–00:42:18",
    type: "Reveal",
    description: "High curiosity potential",
  },
};

const now = "2026-09-26T12:00:00.000Z";

export const demoBrief: ContentBrief = {
  id: "BRF_001",
  campaignName: "Raat Baaki: The Signal",
  objective: "Drive anticipation for the next episode reveal.",
  topic: "Riya discovers that the recurring signal connects to her family.",
  audience: "Bengali thriller and mystery drama viewers aged 18-34",
  primaryLanguage: "bn" as const,
  secondaryLanguage: "en" as const,
  tone: "bold, cinematic, emotionally curious",
  cta: "এখনই দেখুন",
  platforms: ["instagram", "youtube", "facebook"],
  context:
    "Hoichoi original series; keep the reveal intriguing without spoilers.",
};

export const demoCampaign: Campaign = {
  id: "CMP_001",
  name: demoBrief.campaignName,
  brief: demoBrief,
  status: "active",
  createdAt: now,
};

export const demoCampaigns: Campaign[] = [
  demoCampaign,
  {
    ...demoCampaign,
    id: "CMP_002",
    name: "Paatal Lok: New Worlds",
    status: "completed",
  },
  {
    ...demoCampaign,
    id: "CMP_003",
    name: "Hoichoi Weekend Watchlist",
    status: "draft",
  },
];

export const demoConcept: CampaignConcept = {
  id: "CON_001",
  campaignId: "CMP_001",
  name: "The Signal Returns",
  description: "Turn the recurring signal into a character-led curiosity hook.",
  strategicIntent:
    "Use emotional tension and an unanswered question to drive episode starts.",
};

export const demoPosts: GeneratedPost[] = [
  {
    id: "IG_001",
    campaignId: "CMP_001",
    conceptId: "CON_001",
    platform: "instagram",
    language: "bn",
    caption:
      "যে সংকেত ফিরে আসার কথা ছিল না, সেটাই আবার এসেছে। রিয়ার কাছে সত্যিটা কতটা কাছাকাছি?",
    title: "সংকেতটা ফিরেছে",
    cta: "এখনই দেখুন",
    hashtags: ["#Hoichoi", "#RaatBaaki", "#BengaliThriller"],
    creativePrompt:
      "Vertical cinematic portrait of Riya following a red signal in a rain-soaked Kolkata lane.",
    aspectRatio: "9:16",
    rationale: "Character-first emotional hook for vertical feed.",
    model: "gemini-3.5-flash-lite",
    status: "review",
  },
  {
    id: "YT_001",
    campaignId: "CMP_001",
    conceptId: "CON_001",
    platform: "youtube",
    language: "en",
    caption:
      "The signal is back, and Riya is closer to the truth than ever. Watch the mystery unfold.",
    title: "The Signal Returns | Raat Baaki",
    cta: "Watch now",
    hashtags: ["#Hoichoi", "#RaatBaaki", "#Mystery"],
    creativePrompt:
      "Wide cinematic frame of a lone investigator and a glowing signal across a rain-filled city.",
    aspectRatio: "16:9",
    rationale:
      "Cinematic context gives the trailer room to breathe on YouTube.",
    model: "gemini-3.5-flash-lite",
    status: "approved",
  },
  {
    id: "FB_001",
    campaignId: "CMP_001",
    conceptId: "CON_001",
    platform: "facebook",
    language: "bn",
    caption:
      "কিছু সত্যি চাপা থাকে না। রিয়ার পরিবারের পুরনো রহস্য আবার সামনে আসছে। আপনার কী মনে হয়, সংকেতটা কে পাঠাচ্ছে?",
    title: "পুরনো রহস্য, নতুন সংকেত",
    cta: "শেয়ার করুন",
    hashtags: ["#Hoichoi", "#RaatBaaki", "#বাংলাSeries"],
    creativePrompt:
      "Square social-friendly key art showing Riya, her family home, and a mysterious red signal.",
    aspectRatio: "1:1",
    rationale: "A shareable question invites conversation around the mystery.",
    model: "gemini-3.5-flash-lite",
    status: "scheduled",
    scheduledAt: now,
  },
];

export const demoMetrics: PostMetrics[] = [
  {
    id: "MET_001",
    postId: "IG_001",
    impressions: 42000,
    reach: 31800,
    views: 17600,
    likes: 4800,
    comments: 312,
    shares: 640,
    saves: 920,
    engagementRate: 0.146,
    createdAt: now,
  },
  {
    id: "MET_002",
    postId: "YT_001",
    impressions: 28600,
    reach: 24400,
    views: 19200,
    likes: 2600,
    comments: 184,
    shares: 310,
    engagementRate: 0.108,
    createdAt: now,
  },
  {
    id: "MET_003",
    postId: "FB_001",
    impressions: 17300,
    reach: 12100,
    likes: 1400,
    comments: 220,
    shares: 410,
    saves: 180,
    engagementRate: 0.128,
    createdAt: now,
  },
];

export const demoInsights: Insight[] = [
  {
    id: "INS_001",
    campaignId: "CMP_001",
    type: "strong",
    claim:
      "The Bengali character-led Instagram creative has the strongest engagement rate.",
    recommendation:
      "Lead the next short-form campaign with a native Bengali emotional hook and a visible character.",
    sourcePostIds: ["IG_001", "FB_001"],
    createdAt: now,
  },
  {
    id: "INS_002",
    campaignId: "CMP_001",
    type: "platform",
    claim:
      "Instagram drives discovery while YouTube captures deeper viewing intent.",
    recommendation:
      "Use Instagram for curiosity and YouTube for the full cinematic payoff.",
    sourcePostIds: ["IG_001", "YT_001"],
    createdAt: now,
  },
];

export const demoReport: WeeklyReport = {
  id: "RPT_001",
  periodStart: "2026-09-20",
  periodEnd: "2026-09-26",
  sourcePostIds: ["IG_001", "YT_001", "FB_001"],
  createdAt: now,
  content: {
    executiveSummary:
      "Native Bengali curiosity-led creative is the clearest growth signal this week.",
    whatWorked: [
      "Character-first vertical creative",
      "A concrete unanswered question",
    ],
    whatUnderperformed: ["Broad cinematic copy without a localized hook"],
    platformLearnings: [
      "Instagram led engagement; YouTube led completed viewing intent.",
    ],
    languageLearnings: [
      "Native Bengali outperformed generic translated phrasing.",
    ],
    creativeLearnings: [
      "A single visual mystery is easier to share than a multi-point synopsis.",
    ],
    recommendedNextActions: [
      "Create a Bengali-first vertical teaser",
      "Pair the teaser with a YouTube payoff trailer",
    ],
  },
};

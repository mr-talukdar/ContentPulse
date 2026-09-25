import type { EpisodeAnalysis } from "@/utils/contentpulse/types";

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

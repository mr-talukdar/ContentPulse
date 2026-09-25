export type ReviewTone = "amber" | "slate" | "red";

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

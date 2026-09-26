"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type {
  GeneratedPost,
  Insight,
  Platform,
  PostMetrics,
  WeeklyReport,
} from "@/utils/contentpulse/types";
import {
  normalizeHashtags,
  normalizeStringList,
} from "@/utils/contentpulse/normalize";
import { CommandCenter as ExtractedCommandCenter } from "@/components/contentpulse/command-center";
import { PostCard as ExtractedPostCard } from "@/components/contentpulse/post-card";

const platformNames: Record<Platform, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
};
const platformRatio: Record<Platform, string> = {
  instagram: "9:16",
  youtube: "16:9",
  facebook: "1:1",
};
const platformIcon: Record<Platform, string> = {
  instagram: "◎",
  youtube: "▶",
  facebook: "f",
};
const toneBar: Record<string, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  green: "bg-green-500",
};
const toneText: Record<string, string> = {
  red: "text-red-300",
  blue: "text-blue-300",
  amber: "text-amber-300",
  green: "text-green-300",
};
const inputClass =
  "w-full border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-100 outline-none transition focus:border-red-500";
const panelClass = "border border-zinc-800 bg-zinc-950/70 p-5";
type CreativeResponse = {
  error?: string;
  details?: string[];
  imageData?: string;
  creativeUrl?: string;
};
const generationMessages = [
  "Reading the brief... গল্পটা বুঝে নিচ্ছি...",
  "Building the story spine... গল্পের কাঠামো বানাচ্ছি...",
  "Drilling into the audience... দর্শকের মনস্তত্ত্ব দেখছি...",
  "Writing native Bengali hooks... বাংলার হুক লিখছি...",
  "Adapting the idea to each platform... প্ল্যাটফর্ম অনুযায়ী সাজাচ্ছি...",
  "Polishing captions and CTAs... ক্যাপশন আর CTA পালিশ করছি...",
  "Preparing your review cards... রিভিউ কার্ড তৈরি করছি...",
  "Finishing the last details... শেষ ছোঁয়া দিচ্ছি...",
];

function Button({
  children,
  className = "",
  disabled = false,
  onClick,
  title,
  type = "button",
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${className}`}>
      {children}
    </button>
  );
}
function Tag({
  children,
  tone = "zinc",
}: {
  children: React.ReactNode;
  tone?: "zinc" | "red" | "blue" | "amber" | "green";
}) {
  const colors = {
    zinc: "border-zinc-700 bg-zinc-900 text-zinc-400",
    red: "border-red-500/40 bg-red-500/10 text-red-300",
    blue: "border-blue-500/40 bg-blue-500/10 text-blue-300",
    amber: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    green: "border-green-500/40 bg-green-500/10 text-green-300",
  };
  return (
    <span
      className={`inline-flex border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${colors[tone]}`}>
      {children}
    </span>
  );
}
function Status({ status }: { status: string }) {
  const tone =
    status === "published"
      ? "green"
      : status === "approved" || status === "scheduled"
        ? "blue"
        : status === "rejected"
          ? "red"
          : "amber";
  return <Tag tone={tone}>{status}</Tag>;
}
function PlatformTag({
  platform,
  ratio = true,
}: {
  platform: Platform;
  ratio?: boolean;
}) {
  return (
    <Tag
      tone={
        platform === "instagram"
          ? "red"
          : platform === "youtube"
            ? "blue"
            : "amber"
      }>
      {platformIcon[platform]} {platformNames[platform]}
      {ratio ? ` · ${platformRatio[platform]}` : ""}
    </Tag>
  );
}

export function LegacyPostCard({
  post,
  onAction,
  autoGenerate = false,
  staggerIndex = 0,
}: {
  post: GeneratedPost;
  onAction?: (action: string, post: GeneratedPost) => void;
  autoGenerate?: boolean;
  staggerIndex?: number;
}) {
  const hashtags = normalizeHashtags(post.hashtags);
  const [creativeUrl, setCreativeUrl] = useState(post.creativeUrl);
  const [creativeBusy, setCreativeBusy] = useState(false);
  const [creativeSaving, setCreativeSaving] = useState(false);
  const [creativeError, setCreativeError] = useState("");
  const triggeredPostIdRef = useRef<string | null>(null);

  async function readJsonResponse(
    response: Response,
  ): Promise<CreativeResponse> {
    const text = await response.text();
    if (!text)
      return {
        error: `Server returned an empty response (${response.status}).`,
      };
    try {
      return JSON.parse(text) as CreativeResponse;
    } catch {
      return {
        error: `Server returned an invalid response (${response.status}).`,
      };
    }
  }

  const generateCreative = useCallback(async () => {
    setCreativeBusy(true);
    setCreativeError("");
    try {
      const generationResponse = await fetch("/api/creative/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });
      const generated = await readJsonResponse(generationResponse);
      if (!generationResponse.ok || !generated.imageData) {
        throw new Error(
          generated.details?.[0] ??
            generated.error ??
            "Visual generation failed.",
        );
      }
      setCreativeUrl(generated.imageData);
      setCreativeBusy(false);
      setCreativeSaving(true);

      const storageResponse = await fetch("/api/creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          imageData: generated.imageData,
        }),
      });
      const stored = await readJsonResponse(storageResponse);
      if (!storageResponse.ok || !stored.creativeUrl) {
        setCreativeError("Visual generated, but Storage persistence failed.");
        return;
      }
      setCreativeUrl(stored.creativeUrl);
    } catch (error) {
      setCreativeError(
        error instanceof Error ? error.message : "Visual generation failed.",
      );
    } finally {
      setCreativeBusy(false);
      setCreativeSaving(false);
    }
  }, [post.id]);

  useEffect(() => {
    if (!autoGenerate || creativeUrl || triggeredPostIdRef.current === post.id)
      return;
    triggeredPostIdRef.current = post.id;
    const timer = setTimeout(() => {
      void generateCreative();
    }, staggerIndex * 1500);
    return () => clearTimeout(timer);
  }, [autoGenerate, creativeUrl, generateCreative, post.id, staggerIndex]);
  return (
    <article
      className={`${panelClass} flex min-h-160 w-120 shrink-0 flex-col gap-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <PlatformTag platform={post.platform} />
          <div className="flex gap-2">
            <Tag>
              {post.language === "bn"
                ? "Bengali · Native generation"
                : "English"}
            </Tag>
            <Status status={post.status} />
          </div>
        </div>
        <code className="text-xs text-zinc-600">{post.id}</code>
      </div>
      <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden border border-dashed border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 p-3 text-center text-xs text-zinc-600">
        {creativeUrl ? (
          <Image
            src={creativeUrl}
            alt={post.title ?? `${platformNames[post.platform]} creative`}
            width={600}
            height={450}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : creativeBusy ? (
          <div className="flex flex-col items-center gap-3 text-blue-300">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-blue-300/30 border-t-blue-300" />
            <span>Generating visual...</span>
            <span className="text-[10px] text-zinc-500">
              {platformRatio[post.platform]} composition
            </span>
          </div>
        ) : (
          <span className="max-w-45">
            Creative preview
            <br />
            <span className="text-zinc-500">{post.creativePrompt}</span>
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          disabled={creativeBusy || creativeSaving}
          onClick={generateCreative}
          className="border-blue-500/60 text-blue-300">
          {creativeBusy
            ? "Generating visual..."
            : creativeSaving
              ? "Saving visual..."
              : creativeUrl
                ? "Regenerate visual"
                : "Generate visual ✦"}
        </Button>
        {creativeError && (
          <span className="text-[10px] text-red-300">{creativeError}</span>
        )}
      </div>
      {post.title && (
        <h3 className="font-semibold text-zinc-100">{post.title}</h3>
      )}
      <div className="space-y-3 text-sm leading-6 text-zinc-300">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">
            Caption
          </p>
          <p className="mt-1 whitespace-pre-wrap">{post.caption}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">
            Creative direction
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {post.creativePrompt}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">
            Rationale
          </p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {post.rationale}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {hashtags.map((tag) => (
          <span key={tag} className="text-xs text-blue-300">
            {tag}
          </span>
        ))}
      </div>
      {onAction && (
        <div className="flex gap-2">
          <Button
            className="border-green-500/50 text-green-300 hover:bg-green-500/10"
            onClick={() => onAction("approve", post)}>
            Approve
          </Button>
          <Button
            className="border-red-500/50 text-red-300 hover:bg-red-500/10"
            onClick={() => onAction("reject", post)}>
            Reject & Retry
          </Button>
        </div>
      )}
    </article>
  );
}

function LegacyCommandCenter() {
  const [campaigns, setCampaigns] = useState<
    Array<{ id: string; name: string; status: string }>
  >([]);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  useEffect(() => {
    Promise.all([
      fetch("/api/campaigns").then((response) => response.json()),
      fetch("/api/posts").then((response) => response.json()),
      fetch("/api/insights").then((response) => response.json()),
    ]).then(([campaignResult, postResult, insightResult]) => {
      if (Array.isArray(campaignResult.campaigns))
        setCampaigns(campaignResult.campaigns);
      if (Array.isArray(postResult.posts)) setPosts(postResult.posts);
      if (Array.isArray(insightResult.insights))
        setInsights(insightResult.insights);
    });
  }, []);
  const stats = [
    [
      String(
        campaigns.filter((campaign) => campaign.status === "active").length,
      ),
      "Active campaigns",
      "From current workspace",
      "red",
    ],
    [
      String(posts.filter((post) => post.status === "review").length),
      "Awaiting approval",
      "Needs attention",
      "amber",
    ],
    [
      String(posts.filter((post) => post.status === "scheduled").length),
      "Scheduled",
      "Release queue",
      "blue",
    ],
    [
      String(posts.filter((post) => post.status === "published").length),
      "Published",
      "Traceable posts",
      "green",
    ],
  ];
  const latestInsight = insights[0];
  const topPost = posts.find((post) => post.status === "published") ?? posts[0];
  const steps = [
    "Brief",
    "Generate",
    "Approve",
    "Publish",
    "Measure",
    "Learn",
    "Next brief",
  ];
  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([value, label, note, tone]) => (
          <div key={label} className={panelClass}>
            <div className={`mb-6 h-1 w-10 ${toneBar[tone]}`} />
            <strong className="block text-3xl font-medium text-zinc-100">
              {value}
            </strong>
            <span className="mt-2 block text-sm text-zinc-300">{label}</span>
            <small className="mt-1 block text-xs text-zinc-600">{note}</small>
          </div>
        ))}
      </div>
      <section className={panelClass}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-400">
              The operating loop
            </p>
            <h2 className="mt-2 text-lg font-semibold">
              One brief. A learning system.
            </h2>
          </div>
          <Tag tone="blue">Live workflow</Tag>
        </div>
        <div className="grid gap-2 md:grid-cols-7">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex min-h-16 flex-1 flex-col justify-center border border-zinc-800 bg-zinc-900/60 px-3">
                <span className="text-[10px] text-zinc-600">0{index + 1}</span>
                <strong className="mt-1 text-xs text-zinc-200">{step}</strong>
              </div>
              {index < steps.length - 1 && (
                <span className="hidden text-red-500 md:block">→</span>
              )}
            </div>
          ))}
        </div>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className={panelClass}>
          <div className="mb-5 flex justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-red-400">
                Top performing concept
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                {topPost?.title ?? "No published concept yet"}
              </h2>
            </div>
            <Tag tone="green">{topPost ? topPost.id : "Awaiting data"}</Tag>
          </div>
          <p className="text-sm leading-6 text-zinc-400">
            {topPost?.rationale ??
              "Publish a campaign to see the strongest performing concept here."}
          </p>
          <div className="mt-6 flex gap-2">
            {topPost ? (
              <PlatformTag platform={topPost.platform} />
            ) : (
              <Tag>Pipeline pending</Tag>
            )}
            {topPost && <Tag>{topPost.conceptId}</Tag>}
          </div>
        </section>
        <section className={`${panelClass} border-blue-500/30`}>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-400">
            Latest AI insight
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            {latestInsight?.claim ?? "No insight generated yet"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {latestInsight?.recommendation ??
              "Generate insights after metrics are available."}
          </p>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex gap-2">
              {latestInsight?.sourcePostIds.map((id) => (
                <Tag key={id} tone="blue">
                  {id}
                </Tag>
              ))}
            </div>
            <a href="/insights" className="text-xs font-bold text-blue-300">
              Create Next Brief →
            </a>
          </div>
        </section>
      </div>
      <section className={panelClass}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Recent activity</h2>
          <span className="text-xs text-zinc-600">Today</span>
        </div>
        <div className="divide-y divide-zinc-900">
          {posts.slice(0, 4).map((post) => (
            <div
              key={post.id}
              className="grid gap-2 py-3 text-sm md:grid-cols-[90px_1fr_140px]">
              <span className="text-xs text-zinc-600">{post.status}</span>
              <span
                className={
                  toneText[
                    post.status === "published"
                      ? "green"
                      : post.status === "review"
                        ? "amber"
                        : "blue"
                  ]
                }>
                {post.title ?? post.id}
              </span>
              <code className="text-xs text-zinc-600 md:text-right">
                {post.id}
              </code>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export { ExtractedCommandCenter as CommandCenter };
export { LegacyCommandCenter };

export function StudioWorkspace() {
  const router = useRouter();
  const [form, setForm] = useState({
    campaignName: "Raat Baaki: The Signal",
    objective: "Drive anticipation for the next episode reveal.",
    topic: "Riya discovers that the recurring signal connects to her family.",
    audience: "Bengali thriller viewers aged 18-34",
    primaryLanguage: "bn",
    secondaryLanguage: "en",
    tone: "bold, cinematic, emotionally curious",
    cta: "এখনই দেখুন",
    context: "Keep the reveal intriguing without spoilers.",
  });
  const [platforms, setPlatforms] = useState<Platform[]>([
    "instagram",
    "youtube",
    "facebook",
  ]);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [campaignId, setCampaignId] = useState("");
  const [busy, setBusy] = useState(false);
  const [commitBusy, setCommitBusy] = useState(false);
  const [generationMessage, setGenerationMessage] = useState(
    generationMessages[0],
  );
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const storedBrief = window.sessionStorage.getItem(
      "contentpulse-next-brief",
    );
    if (!storedBrief) return;
    try {
      const brief = JSON.parse(storedBrief);
      startTransition(() => {
        setForm((current) => ({ ...current, ...brief }));
        setNotice(
          "Next brief loaded from your insight. Review it, then generate.",
        );
      });
    } catch {
      startTransition(() => setNotice("The next brief could not be loaded."));
    } finally {
      window.sessionStorage.removeItem("contentpulse-next-brief");
    }
  }, []);
  useEffect(() => {
    if (!busy) return;
    let index = 0;
    const timer = window.setInterval(() => {
      index = Math.min(index + 1, generationMessages.length - 1);
      setGenerationMessage(generationMessages[index]);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [busy]);
  const update = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  async function generate(event: React.FormEvent) {
    event.preventDefault();
    setGenerationMessage(generationMessages[0]);
    setBusy(true);
    setNotice("");
    try {
      const campaign = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, platforms }),
      }).then((res) => res.json());
      const result = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: campaign.campaign.id }),
      }).then((res) => res.json());
      setCampaignId(campaign.campaign.id);
      setPosts(result.posts ?? []);
      setNotice(`Generated ${result.posts?.length ?? 0} platform-ready posts.`);
    } catch {
      setNotice("Generation failed. Check the API response and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function proceedToApproval() {
    if (!campaignId) return;
    setCommitBusy(true);
    const response = await fetch(`/api/campaigns/${campaignId}/commit`, {
      method: "POST",
    });
    if (response.ok) router.push("/approval");
    else setNotice("Could not save this campaign. Please retry.");
    setCommitBusy(false);
  }
  return (
    <div className="space-y-8">
      {posts.length > 0 && (
        <div className="flex items-center justify-between border border-blue-500/30 bg-blue-500/10 p-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-300">
              Next step
            </p>
            <p className="mt-1 text-sm text-blue-100">
              Your generated posts are ready for human review.
            </p>
          </div>
          <Button
            disabled={commitBusy}
            onClick={proceedToApproval}
            className="border-blue-400 bg-blue-500 text-white">
            {commitBusy ? "Saving campaign..." : "Proceed to Approval Queue →"}
          </Button>
        </div>
      )}
      <form
        onSubmit={generate}
        className="grid min-w-0 gap-5 lg:grid-cols-[minmax(270px,320px)_minmax(0,1fr)]">
        <section className={`${panelClass} min-w-0 space-y-4`}>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-red-400">
            01 / Brief
          </p>
          <h2 className="text-xl font-semibold">Give the work a direction.</h2>
          {[
            ["campaignName", "Campaign name"],
            ["objective", "Objective"],
            ["topic", "Topic"],
            ["audience", "Audience"],
            ["tone", "Tone"],
            ["cta", "CTA"],
          ].map(([key, label]) => (
            <label
              key={key}
              className="block text-xs font-semibold text-zinc-400">
              {label}
              <input
                className={`${inputClass} mt-2`}
                value={form[key as keyof typeof form]}
                onChange={(event) => update(key, event.target.value)}
              />
            </label>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-zinc-400">
              Primary
              <select
                className={`${inputClass} mt-2`}
                value={form.primaryLanguage}
                onChange={(event) =>
                  update("primaryLanguage", event.target.value)
                }>
                <option value="bn">Bengali</option>
                <option value="en">English</option>
              </select>
            </label>
            <label className="text-xs text-zinc-400">
              Secondary
              <select
                className={`${inputClass} mt-2`}
                value={form.secondaryLanguage}
                onChange={(event) =>
                  update("secondaryLanguage", event.target.value)
                }>
                <option value="en">English</option>
                <option value="bn">Bengali</option>
              </select>
            </label>
          </div>
          <label className="block text-xs font-semibold text-zinc-400">
            Context
            <textarea
              className={`${inputClass} mt-2 min-h-20`}
              value={form.context}
              onChange={(event) => update("context", event.target.value)}
            />
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["instagram", "youtube", "facebook"] as Platform[]).map(
              (platform) => (
                <label
                  key={platform}
                  className={`cursor-pointer border p-2 text-center text-xs ${platforms.includes(platform) ? "border-red-500 bg-red-500/10 text-red-200" : "border-zinc-800 text-zinc-600"}`}>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={platforms.includes(platform)}
                    onChange={() =>
                      setPlatforms((current) =>
                        current.includes(platform)
                          ? current.filter((item) => item !== platform)
                          : [...current, platform],
                      )
                    }
                  />
                  {platformNames[platform]}
                </label>
              ),
            )}
          </div>
          <Button
            type="submit"
            disabled={busy || !platforms.length}
            className="w-full border-red-500 bg-red-500 text-white">
            {busy ? generationMessage : "Generate Campaign ✦"}
          </Button>
          {notice && (
            <p className="border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-200">
              {notice}
            </p>
          )}
        </section>
        <section className="min-w-0 space-y-3 overflow-hidden">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-400">
                02 / Outputs
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                Platform-ready thinking
              </h2>
            </div>
            {posts.length > 0 && <Tag tone="green">Ready for review</Tag>}
          </div>
          {posts.length === 0 ? (
            <div
              className={`${panelClass} flex min-h-140 items-center justify-center text-center text-sm text-zinc-600`}>
              Generated platform variants will appear here.
            </div>
          ) : (
            <div className="studio-carousel flex w-full min-w-0 max-w-full gap-4 overflow-x-auto pb-4">
              {posts.map((post, index) => (
                <ExtractedPostCard
                  key={post.id}
                  post={post}
                  autoGenerate
                  staggerIndex={index}
                />
              ))}
            </div>
          )}
        </section>
      </form>
    </div>
  );
}

export function ApprovalWorkspace() {
  const [items, setItems] = useState<GeneratedPost[]>([]);
  const [filter, setFilter] = useState<Platform | "all">("all");
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [campaignNames, setCampaignNames] = useState<Record<string, string>>(
    {},
  );
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    null,
  );
  const [selected, setSelected] = useState<GeneratedPost | null>(null);
  useEffect(() => {
    fetch("/api/posts")
      .then((response) => response.json())
      .then((result) => {
        if (Array.isArray(result.posts)) setItems(result.posts);
      });
    fetch("/api/campaigns")
      .then((response) => response.json())
      .then((result) => {
        if (Array.isArray(result.campaigns)) {
          setCampaignNames(
            Object.fromEntries(
              result.campaigns.map((campaign: { id: string; name: string }) => [
                campaign.id,
                campaign.name,
              ]),
            ),
          );
        }
      });
  }, []);
  const visible = items.filter(
    (post) =>
      post.campaignId === selectedCampaignId &&
      (filter === "all" || post.platform === filter),
  );
  async function action(actionName: string, post: GeneratedPost) {
    const endpoint = actionName === "approve" ? "approve" : "reject";
    await fetch(`/api/posts/${post.id}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feedback: feedback[post.id] ?? "Needs a sharper hook.",
      }),
    });
    setItems((current) =>
      current.map((item) =>
        item.id === post.id
          ? {
              ...item,
              status: endpoint === "approve" ? "approved" : "rejected",
              rejectionReason: feedback[post.id],
            }
          : item,
      ),
    );
  }
  async function retry(post: GeneratedPost) {
    const result = await fetch(`/api/posts/${post.id}/retry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feedback: feedback[post.id] ?? "Make the hook sharper.",
      }),
    }).then((res) => res.json());
    if (result.post)
      setItems((current) =>
        current.map((item) => (item.id === post.id ? result.post : item)),
      );
  }
  const campaignGroups = [...new Set(items.map((post) => post.campaignId))].map(
    (campaignId) => {
      const posts = items.filter((post) => post.campaignId === campaignId);
      return {
        id: campaignId,
        name: campaignNames[campaignId] ?? "ContentPulse campaign",
        posts,
      };
    },
  );
  if (selected) {
    const campaignName =
      campaignNames[selected.campaignId] ?? "ContentPulse campaign";
    return (
      <div className="space-y-5">
        <Button
          onClick={() => setSelected(null)}
          className="border-zinc-700 text-zinc-300">
          ← Back to approval queue
        </Button>
        <section
          className={`${panelClass} grid gap-6 lg:grid-cols-[minmax(280px,1fr)_1.2fr]`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <PlatformTag platform={selected.platform} />
              <Status status={selected.status} />
            </div>
            {selected.creativeUrl ? (
              <Image
                src={selected.creativeUrl}
                alt={selected.title ?? "Post creative"}
                width={800}
                height={600}
                className="aspect-4/3 w-full object-cover"
                unoptimized
              />
            ) : (
              <div className="flex aspect-4/3 items-center justify-center border border-dashed border-zinc-800 text-sm text-zinc-500">
                Visual not generated yet
              </div>
            )}
          </div>
          <div className="space-y-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-400">
                Post detail
              </p>
              <h2 className="mt-2 text-2xl font-semibold">{selected.title}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <Tag>{selected.id}</Tag>
                <Tag>{selected.campaignId}</Tag>
                <Tag>{campaignName}</Tag>
                <Tag>
                  {selected.language === "bn"
                    ? "Bengali · Native generation"
                    : "English"}
                </Tag>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                Caption
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                {selected.caption}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                Creative rationale
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {selected.rationale}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {normalizeHashtags(selected.hashtags).map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }
  if (!selectedCampaignId) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm text-zinc-500">
            Choose a campaign to review its generated posts.
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            Campaigns awaiting review
          </h2>
        </div>
        {campaignGroups.length === 0 ? (
          <div
            className={`${panelClass} flex min-h-60 flex-col items-center justify-center p-8 text-center`}>
            <p className="text-sm text-zinc-400">
              No campaigns awaiting review.
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              Create a campaign brief in Generative Studio to produce posts for
              approval.
            </p>
            <a
              href="/studio"
              className="mt-4 border border-red-500 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/20">
              Go to Generative Studio →
            </a>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {campaignGroups.map((campaign) => (
              <button
                key={campaign.id}
                type="button"
                onClick={() => setSelectedCampaignId(campaign.id)}
                className={`${panelClass} text-left transition hover:border-blue-500/60`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-400">
                      Campaign
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-zinc-100">
                      {campaign.name}
                    </h2>
                  </div>
                  <Tag tone="blue">{campaign.id}</Tag>
                </div>
                <div className="mt-6 flex items-end justify-between">
                  <div className="flex gap-2">
                    <Tag>{campaign.posts.length} posts</Tag>
                    <Tag tone="amber">
                      {
                        campaign.posts.filter(
                          (post) => post.status === "review",
                        ).length
                      }{" "}
                      in review
                    </Tag>
                  </div>
                  <span className="text-xs font-semibold text-blue-300">
                    Open queue →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
  const activeCampaignName =
    campaignNames[selectedCampaignId] ?? "ContentPulse campaign";
  const activePosts = items.filter(
    (post) => post.campaignId === selectedCampaignId,
  );
  const pipeline = ["review", "approved", "scheduled", "published"] as const;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button
            onClick={() => {
              setSelectedCampaignId(null);
              setFilter("all");
            }}
            className="border-zinc-700 text-zinc-300">
            ← All campaigns
          </Button>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[.18em] text-blue-400">
            {selectedCampaignId}
          </p>
          <h2 className="mt-1 text-xl font-semibold">{activeCampaignName}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Tag tone="amber">
            {activePosts.filter((post) => post.status === "review").length}{" "}
            awaiting review
          </Tag>
          <a
            href="/publisher"
            className="border border-blue-500 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-200">
            Open Publisher →
          </a>
        </div>
      </div>
      <section className="grid gap-2 border border-zinc-800 bg-zinc-950/60 p-4 sm:grid-cols-4">
        <div className="sm:col-span-4">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-zinc-500">
            Approval to publish pipeline
          </p>
        </div>
        {pipeline.map((status, index) => (
          <div key={status} className="flex items-center gap-2">
            <div
              className={`flex-1 border px-3 py-3 ${status === "review" ? "border-amber-500/50 bg-amber-500/10" : "border-zinc-800 bg-zinc-900/50"}`}>
              <span className="block text-[10px] uppercase text-zinc-600">
                0{index + 1}
              </span>
              <strong className="mt-1 block text-xs capitalize text-zinc-200">
                {status}
              </strong>
              <span className="mt-1 block text-xs text-zinc-500">
                {activePosts.filter((post) => post.status === status).length}{" "}
                posts
              </span>
            </div>
            {index < pipeline.length - 1 && (
              <span className="hidden text-blue-400 sm:block">→</span>
            )}
          </div>
        ))}
      </section>
      <div className="flex flex-wrap gap-2">
        {(["all", "instagram", "youtube", "facebook"] as const).map((value) => (
          <Button
            key={value}
            onClick={() => setFilter(value)}
            className={
              filter === value
                ? "border-red-500 bg-red-500/10 text-red-200"
                : "border-zinc-800 text-zinc-500"
            }>
            {value === "all" ? "All posts" : platformNames[value]}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {visible.map((post) => (
          <article
            key={post.id}
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("button, textarea, a"))
                return;
              setSelected(post);
            }}
            className={`${panelClass} cursor-pointer transition hover:border-blue-500/60`}>
            <div className="flex justify-between">
              <PlatformTag platform={post.platform} />
              <Status status={post.status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Tag>{post.id}</Tag>
              <Tag>{post.campaignId}</Tag>
              <Tag>{campaignNames[post.campaignId] ?? "Campaign"}</Tag>
            </div>
            <div className="mt-4 flex gap-3">
              {post.creativeUrl ? (
                <Image
                  src={post.creativeUrl}
                  alt={post.title ?? "Post creative"}
                  width={96}
                  height={96}
                  className="h-24 w-24 shrink-0 object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center border border-zinc-800 bg-zinc-900 text-xs text-zinc-600">
                  {platformRatio[post.platform]}
                </div>
              )}
              <div>
                <code className="text-xs text-zinc-600">
                  {post.id} ·{" "}
                  {post.language === "bn"
                    ? "Bengali · Native generation"
                    : "English"}
                </code>
                <h3 className="mt-2 font-semibold">{post.title}</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-400">
                  {post.caption}
                </p>
              </div>
            </div>
            {post.status === "rejected" && (
              <div className="mt-4 space-y-2">
                <textarea
                  className={`${inputClass} min-h-20`}
                  placeholder="Editorial feedback for retry"
                  value={feedback[post.id] ?? post.rejectionReason ?? ""}
                  onChange={(event) =>
                    setFeedback((current) => ({
                      ...current,
                      [post.id]: event.target.value,
                    }))
                  }
                />
                <Button
                  onClick={() => retry(post)}
                  className="border-blue-500/60 text-blue-300">
                  Retry content
                </Button>
              </div>
            )}
            {post.status === "review" && (
              <div className="mt-5 flex gap-2">
                <Button
                  onClick={() => action("approve", post)}
                  className="border-green-500/50 text-green-300">
                  Approve
                </Button>
                <Button
                  onClick={() => action("reject", post)}
                  className="border-red-500/50 text-red-300">
                  Reject & Retry
                </Button>
              </div>
            )}
            {post.status === "approved" && (
              <Button
                onClick={async () => {
                  await fetch(`/api/posts/${post.id}/schedule`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      scheduledAt: new Date().toISOString(),
                    }),
                  });
                  setItems((current) =>
                    current.map((item) =>
                      item.id === post.id
                        ? { ...item, status: "scheduled" }
                        : item,
                    ),
                  );
                }}
                className="mt-5 border-blue-500/50 text-blue-300">
                Schedule post
              </Button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

export function PublisherWorkspace() {
  const [items, setItems] = useState<GeneratedPost[]>([]);
  const [campaignNames, setCampaignNames] = useState<Record<string, string>>(
    {},
  );
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2);
    return d.toISOString().slice(0, 16);
  });
  const [publishErrors, setPublishErrors] = useState<Record<string, string>>(
    {},
  );

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [postsRes, campRes] = await Promise.all([
        fetch("/api/posts")
          .then((r) => r.json())
          .catch(() => null),
        fetch("/api/campaigns")
          .then((r) => r.json())
          .catch(() => null),
      ]);
      if (postsRes && Array.isArray(postsRes.posts)) {
        setItems(postsRes.posts);
      }
      if (campRes && Array.isArray(campRes.campaigns)) {
        setCampaignNames(
          Object.fromEntries(
            campRes.campaigns.map((c: { id: string; name: string }) => [
              c.id,
              c.name,
            ]),
          ),
        );
      }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  async function schedule(post: GeneratedPost, targetDate?: string) {
    setBusyId(post.id);
    const dateToSchedule = targetDate
      ? new Date(targetDate).toISOString()
      : new Date().toISOString();
    try {
      const response = await fetch(`/api/posts/${post.id}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: dateToSchedule }),
      });
      const result = await response.json();
      const updated = result.post ?? result;
      if (updated?.id || response.ok) {
        setItems((current) =>
          current.map((item) =>
            item.id === post.id
              ? { ...item, status: "scheduled", scheduledAt: dateToSchedule }
              : item,
          ),
        );
      }
    } catch (err) {
      console.error("Scheduling failed", err);
    } finally {
      setBusyId("");
      setSchedulingId(null);
    }
  }

  async function publish(post: GeneratedPost) {
    setBusyId(post.id);
    setPublishErrors((current) => ({ ...current, [post.id]: "" }));
    try {
      const response = await fetch(`/api/posts/${post.id}/publish`, {
        method: "POST",
      });
      const result = await response.json();
      if (result.post) {
        setItems((current) =>
          current.map((item) => (item.id === post.id ? result.post : item)),
        );
      } else if (result.error || result.validation) {
        const errorMsg =
          result.validation?.errors
            ?.map((e: { message: string }) => e.message)
            .join(", ") ??
          result.error ??
          "Validation failed";
        setPublishErrors((current) => ({ ...current, [post.id]: errorMsg }));
      }
    } catch (err) {
      setPublishErrors((current) => ({
        ...current,
        [post.id]: err instanceof Error ? err.message : "Publishing failed",
      }));
    } finally {
      setBusyId("");
    }
  }

  const campaignIds = [...new Set(items.map((post) => post.campaignId))];

  const visiblePosts = items.filter((post) => {
    const matchesCampaign =
      selectedCampaignId === "all" || post.campaignId === selectedCampaignId;
    const matchesPlatform =
      platformFilter === "all" || post.platform === platformFilter;
    return matchesCampaign && matchesPlatform;
  });

  const counts = {
    approved: visiblePosts.filter((p) => p.status === "approved").length,
    scheduled: visiblePosts.filter((p) => p.status === "scheduled").length,
    published: visiblePosts.filter((p) => p.status === "published").length,
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Panel */}
      <section className={`${panelClass} space-y-5 border-blue-500/30`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-400">
              Final release gate
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              Campaign Release Pipeline & Mock Publisher
            </h2>
            <p className="mt-1 text-xs leading-5 text-zinc-400">
              Schedule approved content, run platform adapter validations, and
              simulate live social publications.
            </p>
          </div>
          <Button
            disabled={isRefreshing}
            onClick={() => void refreshData()}
            className="border-zinc-700 bg-zinc-800/80 text-xs text-zinc-300 hover:bg-zinc-700">
            {isRefreshing ? "Syncing..." : "🔄 Refresh Data"}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80 pt-4">
          {/* Campaign Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Campaign:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCampaignId("all")}
              className={`rounded-sm px-2.5 py-1 text-xs font-medium transition ${
                selectedCampaignId === "all"
                  ? "border border-red-500/80 bg-red-500/15 text-red-200"
                  : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              }`}>
              All campaigns ({items.length})
            </button>
            {campaignIds.map((cid) => (
              <button
                key={cid}
                type="button"
                onClick={() => setSelectedCampaignId(cid)}
                className={`rounded-sm px-2.5 py-1 text-xs font-medium transition ${
                  selectedCampaignId === cid
                    ? "border border-red-500/80 bg-red-500/15 text-red-200"
                    : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                }`}>
                {campaignNames[cid] ?? cid} (
                {items.filter((p) => p.campaignId === cid).length})
              </button>
            ))}
          </div>

          {/* Platform Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mr-1">
              Platform:
            </span>
            {(["all", "instagram", "youtube", "facebook"] as const).map(
              (plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setPlatformFilter(plat)}
                  className={`rounded-sm px-2 py-0.5 text-xs transition ${
                    platformFilter === plat
                      ? "border border-blue-500 bg-blue-500/20 text-blue-200"
                      : "border border-zinc-800 text-zinc-500 hover:text-zinc-300"
                  }`}>
                  {plat === "all" ? "All" : platformNames[plat]}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Status Pipeline Counter Bar */}
        <div className="grid grid-cols-3 gap-3 border-t border-zinc-800/80 pt-4">
          <div className="flex items-center justify-between rounded-sm border border-amber-500/30 bg-amber-500/5 px-3 py-2">
            <span className="text-xs text-amber-300/90 font-medium">
              1. Ready to Schedule
            </span>
            <Tag tone="amber">{counts.approved}</Tag>
          </div>
          <div className="flex items-center justify-between rounded-sm border border-blue-500/30 bg-blue-500/5 px-3 py-2">
            <span className="text-xs text-blue-300/90 font-medium">
              2. Scheduled for Release
            </span>
            <Tag tone="blue">{counts.scheduled}</Tag>
          </div>
          <div className="flex items-center justify-between rounded-sm border border-green-500/30 bg-green-500/5 px-3 py-2">
            <span className="text-xs text-green-300/90 font-medium">
              3. Published & Live
            </span>
            <Tag tone="green">{counts.published}</Tag>
          </div>
        </div>
      </section>

      {/* 3-Column Kanban Board */}
      <div className="grid gap-5 lg:grid-cols-3">
        {(
          [
            {
              key: "approved",
              label: "Approved Posts",
              badgeTone: "amber",
              subtitle: "Awaiting Schedule",
            },
            {
              key: "scheduled",
              label: "Scheduled Queue",
              badgeTone: "blue",
              subtitle: "Ready for Publication",
            },
            {
              key: "published",
              label: "Published Assets",
              badgeTone: "green",
              subtitle: "Live on Platforms",
            },
          ] as const
        ).map(({ key: status, label, badgeTone, subtitle }) => {
          const columnPosts = visiblePosts.filter(
            (item) => item.status === status,
          );

          return (
            <section
              key={status}
              className="flex min-h-[460px] flex-col rounded-sm border border-zinc-800 bg-zinc-950/70 p-4">
              <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h2 className="text-sm font-semibold tracking-wide text-zinc-100">
                    {label}
                  </h2>
                  <p className="text-[10px] text-zinc-500">{subtitle}</p>
                </div>
                <Tag tone={badgeTone}>{columnPosts.length}</Tag>
              </div>

              {columnPosts.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                  <p className="text-xs text-zinc-500">
                    {status === "approved"
                      ? "No approved posts awaiting schedule. Go to Approval Queue to approve posts."
                      : status === "scheduled"
                        ? "No posts scheduled. Select an approved post on the left to schedule it."
                        : "No posts published yet. Click 'Validate & Mock Publish' on a scheduled post."}
                  </p>
                  {status === "approved" && (
                    <a
                      href="/approval"
                      className="mt-3 text-xs text-red-400 hover:text-red-300 underline underline-offset-4">
                      Open Approval Queue →
                    </a>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {columnPosts.map((post) => (
                    <article
                      key={post.id}
                      className="rounded-xs border border-zinc-800/90 bg-zinc-900/70 p-3.5 shadow-sm transition hover:border-zinc-700">
                      <div className="flex items-center justify-between">
                        <PlatformTag platform={post.platform} />
                        <span className="font-mono text-[10px] text-zinc-500">
                          {post.id}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Tag tone="blue">
                          {campaignNames[post.campaignId] ?? post.campaignId}
                        </Tag>
                        <Tag>
                          {post.language === "bn"
                            ? "Bengali (বাংলা)"
                            : "English"}
                        </Tag>
                      </div>

                      {/* Creative Image Preview */}
                      {post.creativeUrl ? (
                        <div className="mt-3 overflow-hidden rounded-xs border border-zinc-800 bg-black">
                          <Image
                            src={post.creativeUrl}
                            alt={post.title ?? "Creative preview"}
                            width={340}
                            height={190}
                            className="aspect-video w-full object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="mt-3 flex aspect-video w-full items-center justify-center rounded-xs border border-dashed border-zinc-800 bg-zinc-950 text-[11px] text-zinc-600">
                          {platformRatio[post.platform]} • Visual creative
                          pending
                        </div>
                      )}

                      <h3 className="mt-3 text-xs font-semibold text-zinc-200">
                        {post.title ?? "Untitled publication"}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">
                        {post.caption}
                      </p>

                      <div className="mt-3 space-y-1 border-t border-zinc-800/80 pt-2.5 text-[10px] text-zinc-500">
                        <p className="flex items-center gap-1 text-green-400">
                          <span>✓</span> Aspect ratio {post.aspectRatio}
                        </p>
                        <p className="flex items-center gap-1 text-green-400">
                          <span>✓</span> {platformNames[post.platform]} adapter
                          ready
                        </p>
                      </div>

                      {/* SCHEDULE ACTION UNDER APPROVED */}
                      {status === "approved" && (
                        <div className="mt-3 border-t border-zinc-800 pt-3">
                          {schedulingId === post.id ? (
                            <div className="space-y-2.5 rounded-xs border border-blue-500/40 bg-blue-500/10 p-2.5">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-300">
                                Target Publication Date & Time
                              </label>
                              <input
                                type="datetime-local"
                                value={scheduleDate}
                                onChange={(e) =>
                                  setScheduleDate(e.target.value)
                                }
                                className={`${inputClass} w-full px-2 py-1 text-xs`}
                              />
                              <div className="flex gap-1.5">
                                {[
                                  { label: "+2h", hours: 2 },
                                  { label: "Tomorrow", hours: 24 },
                                  { label: "+3d", hours: 72 },
                                ].map(({ label, hours }) => (
                                  <button
                                    key={label}
                                    type="button"
                                    onClick={() => {
                                      const d = new Date(
                                        Date.now() + hours * 3600 * 1000,
                                      );
                                      setScheduleDate(
                                        d.toISOString().slice(0, 16),
                                      );
                                    }}
                                    className="rounded-xs border border-blue-500/30 bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-200 hover:bg-blue-500/30">
                                    {label}
                                  </button>
                                ))}
                              </div>
                              <div className="flex gap-2 pt-1">
                                <Button
                                  disabled={busyId === post.id}
                                  onClick={() => schedule(post, scheduleDate)}
                                  className="flex-1 border-blue-500 bg-blue-600 py-1.5 text-xs text-white hover:bg-blue-500">
                                  {busyId === post.id
                                    ? "Scheduling..."
                                    : "Confirm Schedule"}
                                </Button>
                                <Button
                                  onClick={() => setSchedulingId(null)}
                                  className="border-zinc-700 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800">
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                disabled={busyId === post.id}
                                onClick={() => {
                                  const nextSlot = new Date(
                                    Date.now() + 2 * 60 * 60 * 1000,
                                  )
                                    .toISOString()
                                    .slice(0, 16);
                                  setScheduleDate(nextSlot);
                                  setSchedulingId(post.id);
                                }}
                                className="flex-1 border-blue-500/60 bg-blue-500/10 py-1.5 text-xs text-blue-300 hover:bg-blue-500/20">
                                Schedule Post ⏱
                              </Button>
                              <Button
                                disabled={busyId === post.id}
                                onClick={() => schedule(post)}
                                title="Schedule immediately for release"
                                className="border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700">
                                Now
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* PUBLISH ACTION UNDER SCHEDULED */}
                      {status === "scheduled" && (
                        <div className="mt-3 space-y-2 border-t border-zinc-800 pt-3">
                          {post.scheduledAt && (
                            <p className="flex items-center gap-1.5 text-[11px] font-medium text-blue-300">
                              <span>⏱</span> Scheduled:{" "}
                              {new Date(post.scheduledAt).toLocaleString()}
                            </p>
                          )}
                          <Button
                            disabled={busyId === post.id}
                            onClick={() => publish(post)}
                            className="w-full border-red-500 bg-red-500/15 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/25">
                            {busyId === post.id
                              ? "Validating & Publishing..."
                              : "Validate & Mock Publish 🚀"}
                          </Button>
                          {publishErrors[post.id] && (
                            <p className="mt-2 border border-red-500/40 bg-red-500/10 p-2 text-[10px] text-red-300">
                              ⚠️ {publishErrors[post.id]}
                            </p>
                          )}
                        </div>
                      )}

                      {/* PUBLISHED SUCCESS DETAILS */}
                      {status === "published" && (
                        <div className="mt-3 space-y-1.5 border-t border-zinc-800 pt-3">
                          <p className="flex items-center gap-1 text-xs font-semibold text-green-400">
                            <span>✓</span> Mock Published to{" "}
                            {platformNames[post.platform]}
                          </p>
                          {post.publishedAt && (
                            <p className="text-[10px] text-zinc-400">
                              Published:{" "}
                              {new Date(post.publishedAt).toLocaleString()}
                            </p>
                          )}
                          {post.externalPostId && (
                            <div className="rounded-xs border border-zinc-800 bg-zinc-950 p-1.5 font-mono text-[10px] text-zinc-400">
                              Post ID: {post.externalPostId}
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

export function AnalyticsWorkspace() {
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [metrics, setMetrics] = useState<PostMetrics[]>([]);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [metricNotice, setMetricNotice] = useState("");
  
  useEffect(() => {
    fetch("/api/campaigns")
      .then((response) => response.json())
      .then((result) => {
        if (Array.isArray(result.campaigns) && result.campaigns.length > 0) {
          setCampaigns(result.campaigns);
          setSelectedCampaignId(result.campaigns[0].id);
        }
      });
  }, []);

  useEffect(() => {
    if (!selectedCampaignId) return;
    Promise.all([
      fetch(`/api/metrics`).then(res => res.json()),
      fetch(`/api/posts?campaignId=${selectedCampaignId}&status=published`).then(res => res.json())
    ]).then(([metricsResult, postsResult]) => {
      const publishedPosts = Array.isArray(postsResult.posts) ? postsResult.posts : [];
      setPosts(publishedPosts);
      
      const publishedPostIds = new Set(publishedPosts.map((p: GeneratedPost) => p.id));
      if (Array.isArray(metricsResult.metrics)) {
        setMetrics(metricsResult.metrics.filter((m: PostMetrics) => publishedPostIds.has(m.postId)));
      }
    });
  }, [selectedCampaignId]);
  async function ingestMetrics() {
    const result = await fetch("/api/metrics/ingest", { method: "POST" }).then(
      (response) => response.json(),
    );
    if (Array.isArray(result.metrics)) {
      setMetrics(result.metrics);
      setMetricNotice(
        `Simulated from ${result.metrics.length} published mock-adapter post${result.metrics.length === 1 ? "" : "s"}.`,
      );
    } else setMetricNotice(result.error ?? "Metrics could not be ingested.");
  }
  const platformFor = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) return post.platform === 'youtube' ? 'YouTube' : post.platform === 'facebook' ? 'Facebook' : 'Instagram';
    return postId.startsWith("IG") ? "Instagram" : postId.startsWith("YT") ? "YouTube" : "Facebook";
  };
  const formatNumber = (value?: number) =>
    value == null ? "—" : value.toLocaleString();
  const rows = [
    ["Platform", ...metrics.map((metric) => platformFor(metric.postId))],
    [
      "Impressions",
      ...metrics.map((metric) => formatNumber(metric.impressions)),
    ],
    ["Reach", ...metrics.map((metric) => formatNumber(metric.reach))],
    ["Views", ...metrics.map((metric) => formatNumber(metric.views))],
    [
      "Engagement rate",
      ...metrics.map(
        (metric) => `${(metric.engagementRate * 100).toFixed(1)}%`,
      ),
    ],
    [
      "Likes / comments / shares",
      ...metrics.map(
        (metric) =>
          `${formatNumber(metric.likes)} / ${formatNumber(metric.comments)} / ${formatNumber(metric.shares)}`,
      ),
    ],
  ];

  if (metrics.length === 0) {
    return (
      <div className="space-y-5">
        <section
          className={`${panelClass} flex min-h-60 flex-col items-center justify-center p-8 text-center`}>
          <p className="text-sm text-zinc-400">
            No performance metrics recorded yet.
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            Publish posts in the Publisher workspace to begin ingesting
            cross-platform engagement metrics.
          </p>
          <a
            href="/publisher"
            className="mt-4 border border-blue-500 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-200 hover:bg-blue-500/20">
            Go to Publisher →
          </a>
        </section>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      <section className={`${panelClass} overflow-x-auto`}>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-400">
              Like-for-like concept comparison
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              Like-for-like performance
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Tag tone="green">{metrics.length} posts compared</Tag>
            <Button
              onClick={ingestMetrics}
              className="border-blue-500/50 text-blue-300">
              Ingest published metrics
            </Button>
          </div>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <Tag tone="amber">source: mock-adapter</Tag>
          {metricNotice && (
            <span className="text-xs text-zinc-500">{metricNotice}</span>
          )}
        </div>
        <table className="w-full min-w-162.5 border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-600">
              <th className="pb-3">Metric</th>
              {metrics.map((metric) => (
                <th key={metric.postId} className="pb-3">
                  {metric.postId}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="border-b border-zinc-900 text-sm">
                <th className="py-4 font-medium text-zinc-500">{row[0]}</th>
                {row.slice(1).map((value, index) => (
                  <td
                    key={`${row[0]}-${index}`}
                    className={`py-4 ${row[0] === "Engagement rate" && index === 0 ? "font-bold text-red-300" : "text-zinc-300"}`}>
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.postId} className={panelClass}>
            <span className="text-xs text-blue-300">
              {platformFor(metric.postId)}
            </span>
            <strong className="mt-3 block text-3xl">
              {(metric.engagementRate * 100).toFixed(1)}%
            </strong>
            <p className="mt-1 text-xs text-zinc-600">
              {metric.postId} engagement rate
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InsightsWorkspace() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>([]);
  const [items, setItems] = useState<Insight[]>([]);
  const [notice, setNotice] = useState("");
  const [campaignId, setCampaignId] = useState("");
  useEffect(() => {
    fetch("/api/campaigns")
      .then((response) => response.json())
      .then((result) => {
        if (Array.isArray(result.campaigns) && result.campaigns.length > 0) {
          setCampaigns(result.campaigns);
          setCampaignId(result.campaigns[0].id);
        }
      });
  }, []);

  useEffect(() => {
    if (!campaignId) return;
    fetch(`/api/insights?campaignId=${campaignId}`)
      .then((response) => response.json())
      .then((result) => {
        if (Array.isArray(result.insights)) setItems(result.insights);
      });
  }, [campaignId]);
  async function generate() {
    const result = await fetch("/api/insights/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId }),
    }).then((res) => res.json());
    if (result.insights) {
      setItems(result.insights);
      setNotice("New performance insights are ready.");
    }
  }
  async function nextBrief(id: string) {
    const result = await fetch("/api/briefs/from-insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ insightId: id }),
    }).then((res) => res.json());
    if (result.brief) {
      window.sessionStorage.setItem(
        "contentpulse-next-brief",
        JSON.stringify(result.brief),
      );
      router.push("/studio");
    } else setNotice("Could not create next brief.");
  }
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm text-zinc-400 font-medium">Campaign:</label>
          <select
            className="border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>
        </div>
        <Button
          onClick={generate}
          className="border-blue-500 bg-blue-500/10 text-blue-200">
          Generate fresh insights ✦
        </Button>
      </div>
      <p className="text-sm text-zinc-500">
        Evidence-linked recommendations from your published content.
      </p>
      {notice && (
        <div className="border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-200">
          {notice}
        </div>
      )}
      <div className="mb-4">
        <Tag tone="amber">
          Evidence: published posts + persisted metrics + insights
        </Tag>
      </div>
      {items.length === 0 && (
        <div className={`${panelClass} text-sm text-zinc-500`}>
          No insights yet. Ingest metrics and generate insights from the active
          campaign.
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((insight) => (
          <article
            key={insight.id}
            className={`${panelClass} border-l-2 border-l-blue-500`}>
            <div className="flex justify-between">
              <Tag tone="blue">{insight.type}</Tag>
              <code className="text-xs text-zinc-600">{insight.id}</code>
            </div>
            <h2 className="mt-5 text-lg font-semibold leading-7">
              {insight.claim}
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {insight.recommendation}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                {insight.sourcePostIds.map((id) => (
                  <Tag key={id}>{id}</Tag>
                ))}
              </div>
              <Button
                onClick={() => nextBrief(insight.id)}
                className="border-blue-500/50 text-blue-300">
                Create Next Brief →
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function ReportsWorkspace() {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [notice, setNotice] = useState("");
  function downloadReport() {
    if (!report) return;
    const sections: Array<[string, string[]]> = [
      ["What Worked", normalizeStringList(report.content.whatWorked)],
      [
        "What Underperformed",
        normalizeStringList(report.content.whatUnderperformed),
      ],
      [
        "Platform Learnings",
        normalizeStringList(report.content.platformLearnings),
      ],
      [
        "Language Learnings",
        normalizeStringList(report.content.languageLearnings),
      ],
      [
        "Creative Learnings",
        normalizeStringList(report.content.creativeLearnings),
      ],
      [
        "Recommended Next Actions",
        normalizeStringList(report.content.recommendedNextActions),
      ],
    ];
    const markdown = [
      "# ContentPulse Weekly Report",
      "",
      `Period: ${report.periodStart} to ${report.periodEnd}`,
      "",
      "## Executive Summary",
      report.content.executiveSummary,
      "",
      ...sections.flatMap(([title, values]) => [
        `## ${title}`,
        ...values.map((value) => `- ${value}`),
        "",
      ]),
      "## Source Posts",
      ...report.sourcePostIds.map((id) => `- ${id}`),
      "",
      `Generated: ${report.createdAt}`,
    ].join("\n");
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `contentpulse-report-${report.periodEnd}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }
  useEffect(() => {
    fetch("/api/reports")
      .then((response) => response.json())
      .then((result) => {
        if (Array.isArray(result.reports) && result.reports.length > 0)
          setReport(result.reports[result.reports.length - 1]);
      });
  }, []);
  async function generate() {
    const result = await fetch("/api/reports/generate", {
      method: "POST",
    }).then((res) => res.json());
    if (result.report) {
      setReport(result.report);
      setNotice("Weekly report is ready.");
    }
  }
  return (
    <div className="space-y-5">
      <div>
        <Tag tone="amber">
          Evidence: published posts + persisted metrics + insights
        </Tag>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Tag tone="blue">
            {report
              ? `${report.periodStart} → ${report.periodEnd}`
              : "No report yet"}
          </Tag>
          <h2 className="mt-3 text-2xl font-semibold">
            Weekly performance report
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            disabled={!report}
            onClick={downloadReport}
            className="border-zinc-700 text-zinc-300">
            Download report ↓
          </Button>
          <Button
            onClick={generate}
            className="border-blue-500 bg-blue-500/10 text-blue-200">
            Generate report ✦
          </Button>
        </div>
      </div>
      {notice && (
        <div className="border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-200">
          {notice}
        </div>
      )}
      <section className={`${panelClass} border-l-2 border-l-red-500`}>
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-red-400">
          Executive summary
        </p>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-zinc-200">
          {report?.content.executiveSummary ??
            "Generate a report after insights and metrics are available."}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {report?.sourcePostIds.map((id) => (
            <Tag key={id}>{id}</Tag>
          ))}
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {(
          [
            ["What worked", report?.content.whatWorked ?? [], "green"],
            [
              "What underperformed",
              report?.content.whatUnderperformed ?? [],
              "red",
            ],
            [
              "Platform learnings",
              report?.content.platformLearnings ?? [],
              "blue",
            ],
            [
              "Language learnings",
              report?.content.languageLearnings ?? [],
              "amber",
            ],
            [
              "Creative learnings",
              report?.content.creativeLearnings ?? [],
              "blue",
            ],
            [
              "Recommended next actions",
              report?.content.recommendedNextActions ?? [],
              "red",
            ],
          ] as [string, string[], string][]
        ).map((section) => {
          const [title, rawValues, tone] = section;
          const values = normalizeStringList(rawValues);
          return (
            <section key={title} className={panelClass}>
              <h3 className={`text-sm font-semibold ${toneText[tone]}`}>
                {title}
              </h3>
              <ul className="mt-4 space-y-3">
                {values.map((value) => (
                  <li
                    key={value}
                    className="flex gap-2 text-sm leading-6 text-zinc-400">
                    <span className={toneText[tone]}>•</span>
                    {value}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <div className="flex justify-end">
        <a
          href="/studio"
          className="border border-red-500 bg-red-500 px-4 py-3 text-xs font-bold text-white">
          Create Next Brief →
        </a>
      </div>
    </div>
  );
}

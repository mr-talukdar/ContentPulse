"use client";

import { useEffect, useState } from "react";
import type { GeneratedPost, Insight } from "@/utils/contentpulse/types";
import {
  PlatformTag,
  Tag,
  toneBar,
  toneText,
  panelClass,
} from "@/components/contentpulse/primitives";

export function CommandCenter() {
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
            Latest insight
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

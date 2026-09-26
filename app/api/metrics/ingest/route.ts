import { NextResponse } from "next/server";
import { body, jsonError } from "@/app/api/_lib";
import { contentStore } from "@/utils/contentpulse/store";
import { getContentRepository } from "@/utils/contentpulse/repository";
import type { GeneratedPost, PostMetrics } from "@/utils/contentpulse/types";

function simulateMetrics(post: GeneratedPost): PostMetrics {
  const seed = [...post.id].reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );
  const impressions = 12000 + (seed % 7) * 2400;
  const likes = Math.round(impressions * (0.06 + (seed % 5) * 0.012));
  const comments = Math.round(likes * 0.08);
  const shares = Math.round(likes * 0.14);
  return {
    id: `MET_${post.id}`,
    postId: post.id,
    impressions,
    reach: Math.round(impressions * 0.76),
    views:
      post.platform === "youtube"
        ? Math.round(impressions * 0.64)
        : Math.round(impressions * 0.38),
    likes,
    comments,
    shares,
    saves: post.platform === "instagram" ? Math.round(likes * 0.2) : undefined,
    engagementRate: Number(
      ((likes + comments + shares) / impressions).toFixed(4),
    ),
    createdAt: new Date().toISOString(),
  };
}

export async function POST(request: Request) {
  const input = await body(request);
  const repository = await getContentRepository();
  const persistedPosts = repository
    ? await repository.listPosts({ status: "published" })
    : [];
  const posts = persistedPosts.length
    ? persistedPosts
    : [...contentStore.posts.values()].filter(
        (post) => post.status === "published",
      );
  const selected = input.postId
    ? posts.filter((post) => post.id === input.postId).map(simulateMetrics)
    : posts.map(simulateMetrics);

  if (!selected.length) {
    return jsonError(
      "No published posts found to simulate metrics for. Publish a post first.",
      404,
    );
  }

  for (const metric of selected)
    contentStore.metrics.set(metric.postId, metric);
  if (repository)
    for (const metric of selected) await repository.saveMetrics(metric);
  return NextResponse.json({
    metrics: selected,
    source: "published-post-simulation",
  });
}

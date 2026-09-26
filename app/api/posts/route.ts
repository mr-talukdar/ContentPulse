import { NextResponse } from "next/server";
import { contentStore } from "@/utils/contentpulse/store";
import type { Platform, PostStatus } from "@/utils/contentpulse/types";
import { getContentRepository } from "@/utils/contentpulse/repository";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const platform = url.searchParams.get("platform") as Platform | null;
  const status = url.searchParams.get("status") as PostStatus | null;
  const campaignId = url.searchParams.get("campaignId");
  const repository = await getContentRepository();
  if (repository) {
    try {
      return NextResponse.json({
        posts: await repository.listPosts({ platform, status, campaignId }),
        persistence: "supabase",
      });
    } catch (error) {
      console.error("Post read failed", error);
      return NextResponse.json(
        { error: "Posts could not be loaded from Supabase." },
        { status: 502 },
      );
    }
  }
  const posts = [...contentStore.posts.values()]
    .filter(
      (post) =>
        (!platform || post.platform === platform) &&
        (!status || post.status === status) &&
        (!campaignId || post.campaignId === campaignId),
    )
    .reverse();
  return NextResponse.json({ posts });
}

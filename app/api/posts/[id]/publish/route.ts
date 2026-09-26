import { NextResponse } from "next/server";
import { transitionPost, jsonError } from "@/app/api/_lib";
import * as instagram from "@/utils/contentpulse/adapters/instagram";
import * as youtube from "@/utils/contentpulse/adapters/youtube";
import * as facebook from "@/utils/contentpulse/adapters/facebook";
import { getPost } from "@/utils/contentpulse/store";
export async function POST(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const post = getPost(id);
  if (!post) return jsonError("Post not found.", 404);
  const adapter =
    post.platform === "instagram"
      ? instagram
      : post.platform === "youtube"
        ? youtube
        : facebook;
  const validation = adapter.validate(post);
  if (!validation.valid)
    return NextResponse.json(
      { error: "Platform validation failed.", validation },
      { status: 422 },
    );
  const result = await transitionPost(id, "published", {
    externalPostId: adapter.publish(post).externalPostId,
    publishedAt: "2026-09-26T12:00:00.000Z",
  });
  return result.error ?? NextResponse.json({ post: result.post, validation });
}

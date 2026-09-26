import { NextResponse } from "next/server";
import { assertTransition } from "@/utils/contentpulse/state-machine";
import { contentStore, getPost } from "@/utils/contentpulse/store";
import type { PostStatus } from "@/utils/contentpulse/types";
import { getContentRepository } from "@/utils/contentpulse/repository";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function body(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function transitionPost(
  id: string,
  to: PostStatus,
  fields: Record<string, unknown> = {},
) {
  const post = getPost(id);
  if (!post) return { error: jsonError("Post not found.", 404) };
  try {
    assertTransition(post.status, to);
  } catch (error) {
    return { error: jsonError((error as Error).message, 409) };
  }
  const updatedPost = contentStore.updatePostStatus(id, to, fields);
  const repository = await getContentRepository();
  if (repository && updatedPost) await repository.savePost(updatedPost);
  return { post: updatedPost };
}

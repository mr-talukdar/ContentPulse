import { NextResponse } from "next/server";
import { body, transitionPost } from "@/app/api/_lib";
import { contentStore } from "@/utils/contentpulse/store";
import { generateWithFallback, parseJson } from "@/utils/ai/gemini-gateway";
import { retryPrompt } from "@/utils/contentpulse/prompts/retry";
import { getContentRepository } from "@/utils/contentpulse/repository";
import { normalizeHashtags } from "@/utils/contentpulse/normalize";

interface RetryGen {
  caption: string;
  title?: string;
  cta: string;
  hashtags: string[];
  creativePrompt: string;
  rationale: string;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const input = await body(request);
  const feedback = String(input.feedback ?? "Make the tone more engaging");

  // Step 1: Transition status from 'rejected' -> 'generating'
  const genResult = await transitionPost(id, "generating", {
    rejectionReason: feedback,
  });
  if (genResult.error) return genResult.error;

  const post = genResult.post!;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const promptStr = retryPrompt(post, feedback);
      const aiResult = await generateWithFallback<RetryGen>(
        "fast",
        promptStr,
        parseJson,
      );

      // Update post with new generated content and transition to 'review'
      const updatedPost = {
        ...post,
        caption: aiResult.data.caption,
        title: aiResult.data.title ?? post.title,
        cta: aiResult.data.cta,
        hashtags: normalizeHashtags(aiResult.data.hashtags),
        creativePrompt: aiResult.data.creativePrompt,
        rationale: aiResult.data.rationale,
        model: aiResult.model,
        status: "review" as const,
        rejectionReason: undefined,
      };

      contentStore.posts.set(id, updatedPost);
      const repository = await getContentRepository();
      if (repository) await repository.savePost(updatedPost);

      return NextResponse.json({
        post: updatedPost,
        mode: "live-ai",
        message: "Regenerated content using Gemini based on feedback.",
      });
    } catch (err) {
      console.error("Gemini retry generation failed", err);
    }
  }

  // Fallback: Transition back to 'review' with regenerated indicator
  const updatedPost = {
    ...post,
    caption: `${post.caption} [Revised based on: "${feedback}"]`,
    status: "review" as const,
  };
  contentStore.posts.set(id, updatedPost);
  const repository = await getContentRepository();
  if (repository) await repository.savePost(updatedPost);

  return NextResponse.json({
    post: updatedPost,
    mode: "demo-fallback",
    message: "Retry completed with feedback applied.",
  });
}

import { NextResponse } from "next/server";
import { body, jsonError } from "@/app/api/_lib";
import { getPost } from "@/utils/contentpulse/store";
import { getContentRepository } from "@/utils/contentpulse/repository";
import { generateHuggingFaceImage } from "@/utils/ai/huggingface-gateway";
import { getLocalCreative } from "@/utils/ai/local-creative-library";

export async function POST(request: Request) {
  const input = await body(request);
  const postId = String(input.postId ?? "");
  const repository = await getContentRepository();
  const post = getPost(postId) ?? (await repository?.getPost(postId));
  if (!post) return jsonError("Post not found.", 404);

  const prompt = String(input.creativePrompt ?? post.creativePrompt);
  try {
    if (!process.env.HF_API_KEY)
      throw new Error("HF_API_KEY is not configured.");
    const generated = await generateHuggingFaceImage(prompt);
    return NextResponse.json({
      postId,
      status: "generated",
      provider: "huggingface",
      model: generated.model,
      mimeType: generated.mimeType,
      imageData: `data:${generated.mimeType};base64,${generated.base64Data}`,
      aspectRatio: post.aspectRatio,
      message:
        "Visual generated successfully. Storage upload is a separate step.",
    });
  } catch (error) {
    try {
      const fallback = await getLocalCreative(post.platform);
      return NextResponse.json({
        postId,
        status: "generated",
        provider: "local-library",
        model: fallback.model,
        mimeType: fallback.mimeType,
        imageData: `data:${fallback.mimeType};base64,${fallback.base64Data}`,
        aspectRatio: post.aspectRatio,
        message:
          "Using the local creative library fallback. Storage upload is a separate step.",
        details: [String(error)],
      });
    } catch (fallbackError) {
      return NextResponse.json(
        {
          postId,
          status: "generation-failed",
          error: "Hugging Face and local creative fallback failed.",
          details: [String(error), String(fallbackError)],
        },
        { status: 502 },
      );
    }
  }
}

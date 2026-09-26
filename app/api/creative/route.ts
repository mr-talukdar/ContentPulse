import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { body, jsonError } from "@/app/api/_lib";
import { getPost, contentStore } from "@/utils/contentpulse/store";
import { createClient } from "@/utils/supabase/server";
import { getContentRepository } from "@/utils/contentpulse/repository";
import { generateHuggingFaceImage } from "@/utils/ai/huggingface-gateway";
import { getLocalCreative } from "@/utils/ai/local-creative-library";

function decodeImageData(
  value: string,
): { bytes: Buffer; contentType: string; extension: string } | null {
  const match = value.match(
    /^data:(image\/(?:png|jpeg|webp|svg\+xml));base64,(.+)$/,
  );
  if (!match) return null;
  const contentType = match[1];
  const extension =
    contentType === "image/svg+xml"
      ? "svg"
      : contentType.split("/")[1].replace("jpeg", "jpg");
  return { bytes: Buffer.from(match[2], "base64"), contentType, extension };
}

export async function POST(request: Request) {
  const input = await body(request);
  const postId = String(input.postId ?? "");
  const repository = await getContentRepository();
  const post = (await repository?.getPost(postId)) ?? getPost(postId);
  if (!post) return jsonError("Post not found.", 404);
  const creativePrompt = String(input.creativePrompt ?? post.creativePrompt);
  const imageData =
    typeof input.imageData === "string"
      ? decodeImageData(input.imageData)
      : null;
  if (input.imageData && !imageData)
    return jsonError("imageData must be a PNG, JPEG, or WebP data URL.", 415);
  let generatedModel: string | undefined;
  let generatedProvider: string | undefined;
  let resolvedImageData = imageData;
  if (!resolvedImageData) {
    try {
      if (!process.env.HF_API_KEY)
        throw new Error("HF_API_KEY is not configured.");
      const generated = await generateHuggingFaceImage(creativePrompt);
      generatedModel = generated.model;
      generatedProvider = "huggingface";
      resolvedImageData = decodeImageData(
        `data:${generated.mimeType};base64,${generated.base64Data}`,
      );
    } catch (error) {
      console.error("Hugging Face creative generation failed", error);
      const fallback = await getLocalCreative(post.platform);
      generatedModel = fallback.model;
      generatedProvider = "local-library";
      resolvedImageData = decodeImageData(
        `data:${fallback.mimeType};base64,${fallback.base64Data}`,
      );
    }
  }
  if (!resolvedImageData)
    return jsonError(
      "Creative fallback returned an unsupported image format.",
      502,
    );
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      {
        postId,
        status: "storage-not-configured",
        creativePrompt,
        aspectRatio: post.aspectRatio,
        message: "Supabase Storage credentials are not configured.",
      },
      { status: 503 },
    );
  }
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "contentpulse-media";
  const path = `creatives/${post.campaignId}/${post.id}.${resolvedImageData.extension}`;
  const supabase = createClient(await cookies());
  const upload = await supabase.storage
    .from(bucket)
    .upload(path, resolvedImageData.bytes, {
      contentType: resolvedImageData.contentType,
      upsert: true,
    });
  if (upload.error)
    return NextResponse.json(
      { error: "Creative upload failed.", detail: upload.error.message },
      { status: 502 },
    );
  const publicUrl = supabase.storage.from(bucket).getPublicUrl(path)
    .data.publicUrl;
  const updatedPost = { ...post, creativeUrl: publicUrl, creativePrompt };
  contentStore.posts.set(post.id, updatedPost);
  if (repository) await repository.savePost(updatedPost);
  return NextResponse.json({
    post: updatedPost,
    status: "stored",
    bucket,
    path,
    creativeUrl: publicUrl,
    model: generatedModel,
    provider: generatedProvider,
  });
}

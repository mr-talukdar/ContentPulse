import type { GeneratedPost } from "../types";
import { platformProfiles } from "../platform-profiles";

export type AdapterValidationResult = {
  valid: boolean;
  errors: { field: string; code: string; message: string }[];
};
export type PublishResult = {
  success: true;
  externalPostId: string;
  publishedAt: string;
};

export function validate(post: GeneratedPost): AdapterValidationResult {
  const errors = [];
  if (post.platform !== "instagram")
    errors.push({
      field: "platform",
      code: "PLATFORM_MISMATCH",
      message: "Post is not an Instagram post.",
    });
  if (!platformProfiles.instagram.allowedRatios.includes(post.aspectRatio))
    errors.push({
      field: "aspectRatio",
      code: "INVALID_ASPECT_RATIO",
      message: "Instagram requires a 9:16, 4:5, or 1:1 creative.",
    });
  if (post.caption.length > platformProfiles.instagram.maxCaptionLength)
    errors.push({
      field: "caption",
      code: "CAPTION_TOO_LONG",
      message: "Instagram caption exceeds 2,200 characters.",
    });
  return { valid: errors.length === 0, errors };
}

export function publish(post: GeneratedPost): PublishResult {
  const result = validate(post);
  if (!result.valid)
    throw new Error(result.errors.map((error) => error.message).join(" "));
  return {
    success: true,
    externalPostId: "IG_001",
    publishedAt: "2026-09-26T12:00:00.000Z",
  };
}

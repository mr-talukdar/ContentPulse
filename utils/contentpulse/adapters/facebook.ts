import type { GeneratedPost } from "../types";
import { platformProfiles } from "../platform-profiles";
import type { AdapterValidationResult, PublishResult } from "./instagram";

export function validate(post: GeneratedPost): AdapterValidationResult {
  const errors = [];
  if (post.platform !== "facebook")
    errors.push({
      field: "platform",
      code: "PLATFORM_MISMATCH",
      message: "Post is not a Facebook post.",
    });
  if (!platformProfiles.facebook.allowedRatios.includes(post.aspectRatio))
    errors.push({
      field: "aspectRatio",
      code: "INVALID_ASPECT_RATIO",
      message: "Facebook requires a 1:1, 4:5, or 16:9 creative.",
    });
  if (post.caption.length > platformProfiles.facebook.maxCaptionLength)
    errors.push({
      field: "caption",
      code: "CAPTION_TOO_LONG",
      message: "Facebook caption exceeds 63,206 characters.",
    });
  return { valid: errors.length === 0, errors };
}

export function publish(post: GeneratedPost): PublishResult {
  const result = validate(post);
  if (!result.valid)
    throw new Error(result.errors.map((error) => error.message).join(" "));
  return {
    success: true,
    externalPostId: "FB_001",
    publishedAt: "2026-09-26T12:00:00.000Z",
  };
}

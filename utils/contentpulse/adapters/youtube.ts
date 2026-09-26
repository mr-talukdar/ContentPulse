import type { GeneratedPost } from "../types";
import { platformProfiles } from "../platform-profiles";
import type { AdapterValidationResult, PublishResult } from "./instagram";

export function validate(post: GeneratedPost): AdapterValidationResult {
  const errors = [];
  if (post.platform !== "youtube")
    errors.push({
      field: "platform",
      code: "PLATFORM_MISMATCH",
      message: "Post is not a YouTube post.",
    });
  if (!platformProfiles.youtube.allowedRatios.includes(post.aspectRatio))
    errors.push({
      field: "aspectRatio",
      code: "INVALID_ASPECT_RATIO",
      message: "YouTube requires a 16:9 or 9:16 creative.",
    });
  if (post.caption.length > platformProfiles.youtube.maxCaptionLength)
    errors.push({
      field: "caption",
      code: "CAPTION_TOO_LONG",
      message: "YouTube description exceeds 5,000 characters.",
    });
  return { valid: errors.length === 0, errors };
}

export function publish(post: GeneratedPost): PublishResult {
  const result = validate(post);
  if (!result.valid)
    throw new Error(result.errors.map((error) => error.message).join(" "));
  return {
    success: true,
    externalPostId: "YT_001",
    publishedAt: "2026-09-26T12:00:00.000Z",
  };
}

export type ModelTier = "reasoning" | "fast" | "image";

const configured = (key: string, fallback: string) =>
  process.env[key] || fallback;

export const modelRegistry: Record<ModelTier, string[]> = {
  reasoning: [
    configured(
      "GEMINI_REASONING_MODEL",
      process.env.GEMINI_MODEL || "gemini-3.8-flash",
    ),
    "gemini-3.7-flash",
    "gemini-3.5-flash-lite",
  ],
  fast: [
    configured(
      "GEMINI_FAST_MODEL",
      process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    ),
    "gemini-3.1-flash-lite",
  ],
  image: [
    configured("GEMINI_IMAGE_MODEL", "gemini-3.1-flash-image"),
    "gemini-2.5-flash-image",
    configured("GEMINI_IMAGE_FALLBACK_MODEL", "gemini-3.1-flash-lite-image"),
  ],
};

export function modelsFor(tier: ModelTier): readonly string[] {
  return modelRegistry[tier];
}

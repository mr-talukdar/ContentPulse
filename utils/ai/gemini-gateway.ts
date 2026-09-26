import { GoogleGenAI } from "@google/genai";
import { modelsFor, type ModelTier } from "./model-registry";

function isTransientModelError(error: unknown): boolean {
  const message = String(error).toLowerCase();
  return (
    message.includes("503") ||
    message.includes("unavailable") ||
    message.includes("429") ||
    message.includes("resource_exhausted") ||
    message.includes("too many requests")
  );
}

function isUnavailableImageQuota(error: unknown): boolean {
  const message = String(error).toLowerCase();
  return message.includes("free_tier") && message.includes("limit: 0");
}

async function pause(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function generateWithFallback<T>(
  tier: ModelTier,
  prompt: string,
  parse: (text: string) => T,
): Promise<{ data: T; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey)
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  let lastError: unknown;
  for (const model of modelsFor(tier)) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await new GoogleGenAI({
          apiKey,
        }).models.generateContent({
          model,
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        if (!response.text)
          throw new Error("Gemini returned an empty response.");
        return { data: parse(response.text), model };
      } catch (error) {
        lastError = error;
        if (!isTransientModelError(error) || attempt === 1) break;
        await pause(700 * (attempt + 1));
      }
    }
  }
  throw new Error(`All Gemini ${tier} models failed: ${String(lastError)}`);
}

export type GeneratedImage = {
  model: string;
  mimeType: string;
  base64Data: string;
};

export async function generateImageWithFallback(
  prompt: string,
): Promise<GeneratedImage> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey)
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  let lastError: unknown;
  for (const model of modelsFor("image")) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await new GoogleGenAI({
          apiKey,
        }).models.generateContent({
          model,
          contents: prompt,
          config: { responseModalities: ["TEXT", "IMAGE"] },
        });
        const parts =
          response.candidates?.flatMap(
            (candidate) => candidate.content?.parts ?? [],
          ) ?? [];
        const imagePart = parts.find((part) => part.inlineData?.data);
        if (!imagePart?.inlineData?.data)
          throw new Error("Gemini returned no image data.");
        return {
          model,
          mimeType: imagePart.inlineData.mimeType ?? "image/png",
          base64Data: imagePart.inlineData.data,
        };
      } catch (error) {
        lastError = error;
        if (isUnavailableImageQuota(error)) {
          throw new Error(
            "Gemini image generation is unavailable for this project: the current free-tier image quota is 0. Enable Gemini billing or use an image provider with available credits.",
          );
        }
        if (!isTransientModelError(error) || attempt === 1) break;
        await pause(900 * (attempt + 1));
      }
    }
  }
  throw new Error(`All Gemini image models failed: ${String(lastError)}`);
}

export function parseJson<T>(text: string): T {
  return JSON.parse(
    text.replace(/^```json\s*/i, "").replace(/\s*```$/, ""),
  ) as T;
}

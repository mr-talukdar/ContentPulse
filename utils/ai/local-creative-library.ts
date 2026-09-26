import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Platform } from "@/utils/contentpulse/types";

const assets: Record<Platform, string> = {
  instagram: "instagram.svg",
  youtube: "youtube.svg",
  facebook: "facebook.svg",
};

export async function getLocalCreative(
  platform: Platform,
): Promise<{ model: string; mimeType: string; base64Data: string }> {
  const assetPath = path.join(
    process.cwd(),
    "public",
    "creative-library",
    assets[platform],
  );
  const bytes = await readFile(assetPath);
  return {
    model: "local-creative-library",
    mimeType: "image/svg+xml",
    base64Data: bytes.toString("base64"),
  };
}

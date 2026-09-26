import type { Platform } from "./types";

export type PlatformProfile = {
  platform: Platform;
  primaryRatio: string;
  allowedRatios: readonly string[];
  maxCaptionLength: number;
  tone: string;
  hashtagRange: string;
  ctaStyle: string;
  creativeEmphasis: string;
};

export const platformProfiles: Record<Platform, PlatformProfile> = {
  instagram: {
    platform: "instagram",
    primaryRatio: "9:16",
    allowedRatios: ["9:16", "4:5", "1:1"],
    maxCaptionLength: 2200,
    tone: "Energetic and intimate",
    hashtagRange: "5-10 focused hashtags",
    ctaStyle: "Watch now",
    creativeEmphasis: "Character and visual hook",
  },
  youtube: {
    platform: "youtube",
    primaryRatio: "16:9",
    allowedRatios: ["16:9", "9:16"],
    maxCaptionLength: 5000,
    tone: "Explanatory and cinematic",
    hashtagRange: "3-5 minimal hashtags",
    ctaStyle: "Watch or subscribe",
    creativeEmphasis: "Wide cinematic composition",
  },
  facebook: {
    platform: "facebook",
    primaryRatio: "1:1",
    allowedRatios: ["1:1", "4:5", "16:9"],
    maxCaptionLength: 63206,
    tone: "Conversational",
    hashtagRange: "5-15 moderate hashtags",
    ctaStyle: "Watch, learn more, or share",
    creativeEmphasis: "Social and share-friendly",
  },
};

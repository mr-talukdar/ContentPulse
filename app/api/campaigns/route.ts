import { NextResponse } from "next/server";
import { body, jsonError } from "@/app/api/_lib";
import { contentStore } from "@/utils/contentpulse/store";
import type { ContentBrief } from "@/utils/contentpulse/types";
import { getContentRepository } from "@/utils/contentpulse/repository";

export async function GET() {
  const repository = await getContentRepository();
  if (repository) {
    try {
      return NextResponse.json({
        campaigns: await repository.listCampaigns(),
        persistence: "supabase",
      });
    } catch (error) {
      console.error("Campaign read failed", error);
      return jsonError("Campaigns could not be loaded from Supabase.", 502);
    }
  }
  return NextResponse.json({ campaigns: [...contentStore.campaigns.values()] });
}

export async function POST(request: Request) {
  const input = await body(request);
  const brief = (input.brief ?? input) as Partial<ContentBrief>;
  if (
    !brief.campaignName ||
    !brief.objective ||
    !brief.topic ||
    !brief.audience
  )
    return jsonError(
      "campaignName, objective, topic, and audience are required.",
    );
  const campaignName = String(brief.campaignName);
  const id = contentStore.nextId("CMP", contentStore.campaigns);
  const campaign = {
    id,
    name: campaignName,
    brief: {
      ...brief,
      id: `BRF_${id.slice(4)}`,
      campaignName,
      objective: String(brief.objective),
      topic: String(brief.topic),
      audience: String(brief.audience),
      primaryLanguage: brief.primaryLanguage ?? "en",
      tone: brief.tone ?? "cinematic",
      cta: brief.cta ?? "Watch now",
      platforms: brief.platforms ?? ["instagram"],
    },
    status: "draft" as const,
    createdAt: new Date().toISOString(),
  };
  contentStore.campaigns.set(id, campaign);
  return NextResponse.json({ campaign }, { status: 201 });
}

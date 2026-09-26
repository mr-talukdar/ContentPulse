import { NextResponse } from "next/server";
import { contentStore } from "@/utils/contentpulse/store";
import { getContentRepository } from "@/utils/contentpulse/repository";

export async function GET(request: Request) {
  const campaignId = new URL(request.url).searchParams.get("campaignId");
  const repository = await getContentRepository();
  if (repository)
    return NextResponse.json({
      insights: await repository.listInsights(campaignId),
      persistence: "supabase",
    });
  const insights = [...contentStore.insights.values()].filter(
    (item) => !campaignId || item.campaignId === campaignId,
  );
  return NextResponse.json({ insights });
}

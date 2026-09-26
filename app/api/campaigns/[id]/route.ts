import { NextResponse } from "next/server";
import { contentStore, getCampaignPosts } from "@/utils/contentpulse/store";
import { jsonError } from "@/app/api/_lib";

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const campaign = contentStore.campaigns.get(id);
  if (!campaign) return jsonError("Campaign not found.", 404);
  return NextResponse.json({
    campaign,
    concept: [...contentStore.concepts.values()].find(
      (item) => item.campaignId === id,
    ),
    posts: getCampaignPosts(id),
  });
}

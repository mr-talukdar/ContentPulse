import { NextResponse } from "next/server";
import { jsonError } from "@/app/api/_lib";
import { contentStore, getCampaignPosts } from "@/utils/contentpulse/store";
import { getContentRepository } from "@/utils/contentpulse/repository";

export async function POST(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const campaign = contentStore.campaigns.get(id);
  if (!campaign) return jsonError("Campaign not found.", 404);
  const repository = await getContentRepository();
  const concept = [...contentStore.concepts.values()].find(
    (item) => item.campaignId === id,
  );
  const posts = getCampaignPosts(id);
  if (repository) {
    try {
      await repository.saveCampaign(campaign);
      if (concept) await repository.saveConcept(concept);
      for (const post of posts) await repository.savePost(post);
    } catch (error) {
      console.error("Campaign commit failed", error);
      return jsonError("Campaign could not be committed to Supabase.", 502);
    }
  }
  return NextResponse.json({
    campaign,
    concept,
    posts,
    persistence: repository ? "supabase" : "memory",
  });
}

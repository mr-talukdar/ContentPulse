import { NextResponse } from "next/server";
import { body, jsonError } from "@/app/api/_lib";
import { demoConcept, demoPosts } from "@/utils/contentpulse/demo-data";
import { contentStore } from "@/utils/contentpulse/store";
import { generateWithFallback, parseJson } from "@/utils/ai/gemini-gateway";
import { campaignPrompt } from "@/utils/contentpulse/prompts/campaign";
import { instagramPrompt } from "@/utils/contentpulse/prompts/instagram";
import { youtubePrompt } from "@/utils/contentpulse/prompts/youtube";
import { facebookPrompt } from "@/utils/contentpulse/prompts/facebook";
import type {
  CampaignConcept,
  GeneratedPost,
  Platform,
  Language,
} from "@/utils/contentpulse/types";
import { normalizeHashtags } from "@/utils/contentpulse/normalize";

interface ConceptGen {
  name: string;
  description: string;
  strategicIntent: string;
}

interface PostGen {
  caption: string;
  title?: string;
  cta: string;
  hashtags: string[];
  creativePrompt: string;
  aspectRatio: string;
  rationale: string;
}

export async function POST(request: Request) {
  const input = await body(request);
  const campaignId = String(input.campaignId ?? "CMP_001");
  const campaign = contentStore.campaigns.get(campaignId);
  if (!campaign) return jsonError("Campaign not found.", 404);

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      // 1. Generate Campaign Concept using Gemini Reasoning model
      const conceptResult = await generateWithFallback<ConceptGen>(
        "reasoning",
        campaignPrompt(campaign.brief),
        parseJson,
      );

      const conceptId = `CON_${Date.now().toString().slice(-4)}`;
      const concept: CampaignConcept = {
        id: conceptId,
        campaignId,
        name: conceptResult.data.name,
        description: conceptResult.data.description,
        strategicIntent: conceptResult.data.strategicIntent,
      };
      contentStore.concepts.set(concept.id, concept);

      // 2. Generate Posts for requested platforms & languages using Gemini
      const platforms: Platform[] =
        campaign.brief.platforms.length > 0
          ? campaign.brief.platforms
          : ["instagram", "youtube", "facebook"];
      const languages: Language[] = [
        campaign.brief.primaryLanguage,
        ...(campaign.brief.secondaryLanguage
          ? [campaign.brief.secondaryLanguage]
          : []),
      ];

      const generatedPosts: GeneratedPost[] = [];
      let postCounter = 1;

      for (const platform of platforms) {
        for (const language of languages) {
          let promptStr = "";
          if (platform === "instagram")
            promptStr = instagramPrompt(campaign.brief, language, concept.name);
          else if (platform === "youtube")
            promptStr = youtubePrompt(campaign.brief, language, concept.name);
          else
            promptStr = facebookPrompt(campaign.brief, language, concept.name);

          try {
            const postResult = await generateWithFallback<PostGen>(
              "fast",
              promptStr,
              parseJson,
            );

            const prefix =
              platform === "instagram"
                ? "IG"
                : platform === "youtube"
                  ? "YT"
                  : "FB";
            const postId = `${prefix}_${String(postCounter++).padStart(3, "0")}`;

            const post: GeneratedPost = {
              id: postId,
              campaignId,
              conceptId: concept.id,
              platform,
              language,
              caption: postResult.data.caption,
              title: postResult.data.title,
              cta: postResult.data.cta,
              hashtags: normalizeHashtags(postResult.data.hashtags),
              creativePrompt: postResult.data.creativePrompt,
              aspectRatio:
                postResult.data.aspectRatio ||
                (platform === "instagram"
                  ? "9:16"
                  : platform === "youtube"
                    ? "16:9"
                    : "1:1"),
              rationale: postResult.data.rationale,
              model: postResult.model,
              status: "review",
            };

            generatedPosts.push(post);
            contentStore.posts.set(post.id, post);
          } catch (err) {
            console.error(
              `AI post generation failed for ${platform} ${language}`,
              err,
            );
          }
        }
      }

      if (generatedPosts.length > 0) {
        contentStore.campaigns.set(campaignId, {
          ...campaign,
          status: "active",
        });
        return NextResponse.json({
          campaign: contentStore.campaigns.get(campaignId),
          concept,
          posts: generatedPosts,
          mode: "live-ai",
          model: conceptResult.model,
        });
      }
    } catch (error) {
      console.error(
        "Live AI campaign generation failed, falling back to demo data",
        error,
      );
    }
  }

  // Fallback to demo data if API key missing or AI calls fail
  contentStore.concepts.set(demoConcept.id, { ...demoConcept, campaignId });
  const posts = demoPosts.map((post) => ({
    ...post,
    campaignId,
    status: "review" as const,
  }));
  for (const post of posts) contentStore.posts.set(post.id, post);
  contentStore.campaigns.set(campaignId, { ...campaign, status: "active" });

  return NextResponse.json({
    campaign: contentStore.campaigns.get(campaignId),
    concept: demoConcept,
    posts,
    mode: "demo-fallback",
  });
}

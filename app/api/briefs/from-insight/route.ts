import { NextResponse } from "next/server";
import { body, jsonError } from "@/app/api/_lib";
import { contentStore } from "@/utils/contentpulse/store";
import { generateWithFallback, parseJson } from "@/utils/ai/gemini-gateway";
import { nextBriefPrompt } from "@/utils/contentpulse/prompts/next-brief";
import type { ContentBrief } from "@/utils/contentpulse/types";

interface BriefGen {
  campaignName: string;
  objective: string;
  topic: string;
  audience: string;
  primaryLanguage: "bn" | "en";
  secondaryLanguage?: "bn" | "en";
  tone: string;
  cta: string;
  platforms: ("instagram" | "youtube" | "facebook")[];
  context?: string;
}

export async function POST(request: Request) {
  const input = await body(request);
  const insightId = String(input.insightId ?? "INS_001");
  const insight = contentStore.insights.get(insightId);
  if (!insight) return jsonError("Insight not found.", 404);

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const promptStr = nextBriefPrompt(insight);
      const aiResult = await generateWithFallback<BriefGen>(
        "fast",
        promptStr,
        parseJson,
      );

      const brief: ContentBrief = {
        id: `BRF_${Date.now()}`,
        campaignName: aiResult.data.campaignName,
        objective: aiResult.data.objective,
        topic: aiResult.data.topic,
        audience: aiResult.data.audience,
        primaryLanguage: aiResult.data.primaryLanguage || "bn",
        secondaryLanguage: aiResult.data.secondaryLanguage || "en",
        tone: aiResult.data.tone,
        cta: aiResult.data.cta,
        platforms: aiResult.data.platforms || [
          "instagram",
          "youtube",
          "facebook",
        ],
        context: `Generated from AI Insight ${insight.id}: ${aiResult.data.context || insight.recommendation}`,
      };

      return NextResponse.json({
        brief,
        mode: "live-ai",
        model: aiResult.model,
      });
    } catch (err) {
      console.error("Gemini next-brief generation failed", err);
    }
  }

  // Fallback brief construction
  return NextResponse.json({
    brief: {
      id: `BRF_${Date.now()}`,
      campaignName: "Next ContentPulse Campaign",
      objective: insight.recommendation,
      topic: insight.claim,
      audience: "Hoichoi viewers",
      primaryLanguage: "bn",
      secondaryLanguage: "en",
      tone: "cinematic and culturally relevant",
      cta: "এখনই দেখুন",
      platforms: ["instagram", "youtube", "facebook"],
      context: `Based on Insight ${insight.id}`,
    },
    mode: "demo-fallback",
  });
}

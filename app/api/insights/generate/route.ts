import { NextResponse } from "next/server";
import { body } from "@/app/api/_lib";
import { demoInsights } from "@/utils/contentpulse/demo-data";
import { contentStore } from "@/utils/contentpulse/store";
import { generateWithFallback, parseJson } from "@/utils/ai/gemini-gateway";
import { insightsPrompt } from "@/utils/contentpulse/prompts/insights";
import type { Insight } from "@/utils/contentpulse/types";
import { getContentRepository } from "@/utils/contentpulse/repository";

interface InsightGen {
  type:
    | "strong"
    | "weak"
    | "platform"
    | "language"
    | "creative"
    | "recommendation";
  claim: string;
  recommendation: string;
  sourcePostIds: string[];
}

export async function POST(request: Request) {
  const input = await body(request);
  const campaignId = String(input.campaignId ?? "CMP_001");
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const repository = await getContentRepository();
      const posts = repository
        ? (await repository.listPosts()).filter((post) => post.campaignId === campaignId)
        : Array.from(contentStore.posts.values()).filter((p) => p.campaignId === campaignId);
      const metrics = repository ? await repository.listMetrics() : Array.from(contentStore.metrics.values());
      if (!posts.length || !metrics.length) return NextResponse.json({ error: "Publish posts and ingest metrics before generating insights." }, { status: 409 });

      const promptStr = insightsPrompt(posts, metrics);
      const aiResult = await generateWithFallback<InsightGen[]>(
        "reasoning",
        promptStr,
        parseJson,
      );

      const generatedInsights: Insight[] = aiResult.data.map((item, idx) => ({
        id: `INS_${Date.now().toString().slice(-4)}_${idx + 1}`,
        campaignId,
        type: item.type,
        claim: item.claim,
        recommendation: item.recommendation,
        sourcePostIds: (item.sourcePostIds || []).filter((id) => posts.some((post) => post.id === id)),
        createdAt: new Date().toISOString(),
      }));

      for (const insight of generatedInsights) {
        contentStore.insights.set(insight.id, insight);
      }
      if (repository)
        for (const insight of generatedInsights)
          await repository.saveInsight(insight);

      return NextResponse.json({
        insights: generatedInsights,
        mode: "live-ai",
        model: aiResult.model,
      });
    } catch (err) {
      console.error("Gemini insights generation failed", err);
    }
  }

  // Fallback to demo insights
  const insights = demoInsights.filter(
    (item) => item.campaignId === campaignId,
  );
  const resultInsights = insights.length > 0 ? insights : demoInsights;

  for (const insight of resultInsights) {
    contentStore.insights.set(insight.id, insight);
  }

  return NextResponse.json({
    insights: resultInsights,
    mode: "demo-fallback",
  });
}

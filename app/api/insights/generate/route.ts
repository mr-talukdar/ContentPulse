import { NextResponse } from "next/server";
import { body, jsonError } from "@/app/api/_lib";
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

  if (!apiKey) {
    return jsonError("GEMINI_API_KEY is not configured on the server.", 500);
  }

  try {
    const repository = await getContentRepository();
    const allPosts = repository
      ? (await repository.listPosts()).filter(
          (post) => post.campaignId === campaignId,
        )
      : Array.from(contentStore.posts.values()).filter(
          (p) => p.campaignId === campaignId,
        );
    const posts = allPosts.filter((post) => post.status === "published");
    const metrics = repository
      ? await repository.listMetrics()
      : Array.from(contentStore.metrics.values());

    const evidenceIds = new Set(posts.map((post) => post.id));
    const evidenceMetrics = metrics.filter((metric) =>
      evidenceIds.has(metric.postId),
    );
    if (!posts.length || !evidenceMetrics.length) {
      return NextResponse.json(
        {
          error: "Publish posts and ingest metrics before generating insights.",
        },
        { status: 409 },
      );
    }

    const promptStr = insightsPrompt(posts, evidenceMetrics);
    const aiResult = await generateWithFallback<InsightGen[]>(
      "reasoning",
      promptStr,
      parseJson,
    );

    const validTypes = ["strong", "weak", "platform", "language", "creative", "recommendation"];
    const generatedInsights: Insight[] = aiResult.data.map((item, idx) => {
      let safeType = String(item.type).toLowerCase();
      if (!validTypes.includes(safeType)) {
        safeType = "recommendation";
      }
      return {
        id: `INS_${Date.now().toString().slice(-4)}_${idx + 1}`,
        campaignId,
        type: safeType as any,
        claim: item.claim,
        recommendation: item.recommendation,
        sourcePostIds: (item.sourcePostIds || []).filter((id) =>
          posts.some((post) => post.id === id),
        ),
        createdAt: new Date().toISOString(),
      };
    });

    for (const insight of generatedInsights) {
      contentStore.insights.set(insight.id, insight);
    }
    if (repository) {
      for (const insight of generatedInsights)
        await repository.saveInsight(insight);
    }

    return NextResponse.json({
      insights: generatedInsights,
      mode: "live-ai",
      model: aiResult.model,
    });
  } catch (err) {
    console.error("Gemini insights generation failed", err);
    return jsonError(
      "Insights generation failed. Please verify AI configuration and try again.",
      502,
    );
  }
}

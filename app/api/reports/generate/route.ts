import { NextResponse } from "next/server";
import { jsonError } from "@/app/api/_lib";
import { contentStore } from "@/utils/contentpulse/store";
import { generateWithFallback, parseJson } from "@/utils/ai/gemini-gateway";
import { reportPrompt } from "@/utils/contentpulse/prompts/report";
import type { WeeklyReport } from "@/utils/contentpulse/types";
import { getContentRepository } from "@/utils/contentpulse/repository";
import { normalizeStringList } from "@/utils/contentpulse/normalize";

interface ReportGen {
  executiveSummary: string;
  whatWorked: string[];
  whatUnderperformed: string[];
  platformLearnings: string[];
  languageLearnings: string[];
  creativeLearnings: string[];
  recommendedNextActions: string[];
  sourcePostIds: string[];
}

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return jsonError("GEMINI_API_KEY is not configured on the server.", 500);
  }

  try {
    const repository = await getContentRepository();
    const insights = repository
      ? await repository.listInsights()
      : Array.from(contentStore.insights.values());
    const metrics = repository
      ? await repository.listMetrics()
      : Array.from(contentStore.metrics.values());

    if (!insights.length || !metrics.length) {
      return NextResponse.json(
        {
          error:
            "Generate insights after publishing posts and ingesting metrics.",
        },
        { status: 409 },
      );
    }

    const promptStr = reportPrompt(insights, metrics);
    const aiResult = await generateWithFallback<ReportGen>(
      "fast",
      promptStr,
      parseJson,
    );

    const reportId = `RPT_${Date.now().toString().slice(-4)}`;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const report: WeeklyReport = {
      id: reportId,
      periodStart: weekAgo.toISOString().split("T")[0],
      periodEnd: now.toISOString().split("T")[0],
      content: {
        executiveSummary: aiResult.data.executiveSummary,
        whatWorked: normalizeStringList(aiResult.data.whatWorked),
        whatUnderperformed: normalizeStringList(
          aiResult.data.whatUnderperformed,
        ),
        platformLearnings: normalizeStringList(
          aiResult.data.platformLearnings,
        ),
        languageLearnings: normalizeStringList(
          aiResult.data.languageLearnings,
        ),
        creativeLearnings: normalizeStringList(
          aiResult.data.creativeLearnings,
        ),
        recommendedNextActions: normalizeStringList(
          aiResult.data.recommendedNextActions,
        ),
      },
      sourcePostIds: (aiResult.data.sourcePostIds || []).filter((id) =>
        metrics.some((metric) => metric.postId === id),
      ),
      createdAt: now.toISOString(),
    };

    contentStore.reports.set(report.id, report);
    if (repository) await repository.saveReport(report);

    return NextResponse.json({
      report,
      mode: "live-ai",
      model: aiResult.model,
    });
  } catch (err) {
    console.error("Gemini report generation failed", err);
    return jsonError(
      "Weekly report generation failed. Please verify AI configuration and try again.",
      502,
    );
  }
}

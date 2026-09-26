import { NextResponse } from "next/server";
import { demoReport } from "@/utils/contentpulse/demo-data";
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

  if (apiKey) {
    try {
      const insights = Array.from(contentStore.insights.values());
      const metrics = Array.from(contentStore.metrics.values());

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
        sourcePostIds: aiResult.data.sourcePostIds || [
          "IG_001",
          "YT_001",
          "FB_001",
        ],
        createdAt: now.toISOString(),
      };

      contentStore.reports.set(report.id, report);
      const repository = await getContentRepository();
      if (repository) await repository.saveReport(report);

      return NextResponse.json({
        report,
        mode: "live-ai",
        model: aiResult.model,
      });
    } catch (err) {
      console.error("Gemini report generation failed", err);
    }
  }

  // Fallback to demo report
  contentStore.reports.set(demoReport.id, demoReport);
  return NextResponse.json({
    report: demoReport,
    mode: "demo-fallback",
  });
}

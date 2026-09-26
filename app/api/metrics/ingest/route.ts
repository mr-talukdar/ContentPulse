import { NextResponse } from "next/server";
import { body, jsonError } from "@/app/api/_lib";
import { demoMetrics } from "@/utils/contentpulse/demo-data";
import { contentStore } from "@/utils/contentpulse/store";
import { getContentRepository } from "@/utils/contentpulse/repository";
export async function POST(request: Request) {
  const input = await body(request);
  const selected = input.postId
    ? demoMetrics.filter((item) => item.postId === input.postId)
    : demoMetrics;
  if (!selected.length)
    return jsonError("No metrics found for that post.", 404);
  for (const metric of selected)
    contentStore.metrics.set(metric.postId, metric);
  const repository = await getContentRepository();
  if (repository)
    for (const metric of selected) await repository.saveMetrics(metric);
  return NextResponse.json({ metrics: selected });
}

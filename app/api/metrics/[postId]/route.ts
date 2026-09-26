import { NextResponse } from "next/server";
import { contentStore } from "@/utils/contentpulse/store";
import { jsonError } from "@/app/api/_lib";
import { getContentRepository } from "@/utils/contentpulse/repository";

export async function GET(
  _: Request,
  context: { params: Promise<{ postId: string }> },
) {
  const { postId } = await context.params;
  const repository = await getContentRepository();
  if (repository) {
    const metrics = await repository.listMetrics(postId);
    if (!metrics.length) return jsonError("Metrics not found.", 404);
    return NextResponse.json({ metrics: metrics[0], persistence: "supabase" });
  }
  const metric = contentStore.metrics.get(postId);
  if (!metric) return jsonError("Metrics not found.", 404);
  return NextResponse.json({ metrics: metric });
}

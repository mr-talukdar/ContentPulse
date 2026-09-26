import { NextResponse } from "next/server";
import { body, transitionPost } from "@/app/api/_lib";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const input = await body(request);
  const result = await transitionPost(id, "scheduled", {
    scheduledAt: String(input.scheduledAt ?? new Date().toISOString()),
  });
  return result.error ?? NextResponse.json(result.post);
}

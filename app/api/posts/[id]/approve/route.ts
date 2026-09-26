import { NextResponse } from "next/server";
import { transitionPost } from "@/app/api/_lib";
export async function POST(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const result = await transitionPost(id, "approved");
  return result.error ?? NextResponse.json(result.post);
}

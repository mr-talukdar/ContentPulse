import { NextResponse } from "next/server";
import { contentStore } from "@/utils/contentpulse/store";
import { getContentRepository } from "@/utils/contentpulse/repository";

export async function GET() {
  const repository = await getContentRepository();
  if (repository)
    return NextResponse.json({
      reports: await repository.listReports(),
      persistence: "supabase",
    });
  return NextResponse.json({ reports: [...contentStore.reports.values()] });
}

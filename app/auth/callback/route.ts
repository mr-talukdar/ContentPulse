import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function safeNextPath(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = safeNextPath(url.searchParams.get("next"));
  if (!code)
    return NextResponse.redirect(
      new URL("/login?error=missing_code", url.origin),
    );

  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin),
    );
  return NextResponse.redirect(new URL(nextPath, url.origin));
}

"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function GoogleLogin() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });
    if (authError) {
      setError(authError.message);
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-3">
      <button
        type="button"
        onClick={signIn}
        disabled={busy}
        className="flex w-full items-center justify-center gap-3 border border-zinc-700 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-wait disabled:opacity-60">
        <span className="text-base font-bold">G</span>
        {busy ? "Redirecting to Google..." : "Continue with Google"}
      </button>
      {error && (
        <p className="border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function LogoutButton() {
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await createClient().auth.signOut();
    window.location.assign("/login");
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="text-left text-[10px] font-semibold text-zinc-500 transition hover:text-zinc-200 disabled:opacity-50">
      {busy ? "Signing out..." : "Sign out"}
    </button>
  );
}

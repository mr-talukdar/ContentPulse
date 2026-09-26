"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function LogoutButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function signOut() {
    setBusy(true);
    await createClient().auth.signOut();
    router.push("/login");
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

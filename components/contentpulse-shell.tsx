import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { ContentPulseNav } from "@/components/contentpulse-nav";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

function firstName(
  user: {
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  } | null,
) {
  const displayName =
    user?.user_metadata?.full_name ?? user?.user_metadata?.name;
  if (typeof displayName === "string" && displayName.trim())
    return displayName.trim().split(/\s+/)[0];
  return user?.email?.split("@")[0] ?? "Account";
}

export async function ContentPulseShell({
  title,
  eyebrow,
  wide = false,
  children,
}: {
  title: string;
  eyebrow: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  const user = isSupabaseConfigured
    ? (await createClient(await cookies()).auth.getUser()).data.user
    : null;
  return (
    <main className="cp-shell">
      <aside className="cp-sidebar">
        <Link href="/" className="cp-brand">
          <span className="cp-mark">H</span>
          <span>
            <strong>ContentPulse</strong>
            <small>AI content operations</small>
          </span>
        </Link>
        <p className="cp-label">Workspace</p>
        <ContentPulseNav />
        <div className="cp-sidebar-status">
          <span /> Gemini + Supabase ready
          <div className="mt-3 pl-4">{user && <LogoutButton />}</div>
        </div>
      </aside>
      <section className="cp-main">
        <header className="cp-topbar">
          <span>Content operations / {title}</span>
          <span className="cp-live">
            ● {user ? `Hi, ${firstName(user)}` : "Demo workspace"}
          </span>
        </header>
        <div className={wide ? "cp-content cp-content-wide" : "cp-content"}>
          <p className="cp-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {children}
        </div>
      </section>
    </main>
  );
}

export function Placeholder({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <section className="cp-placeholder">
      <span className="cp-placeholder-icon">✦</span>
      <div>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>
    </section>
  );
}

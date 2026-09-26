import { GoogleLogin } from "@/components/google-login";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 text-zinc-100">
      <section className="w-full max-w-md border border-zinc-800 bg-zinc-950 p-8 shadow-2xl shadow-red-950/20">
        <div className="mb-10 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-red-500 text-lg font-black">
            H
          </span>
          <div>
            <strong className="block text-base">ContentPulse</strong>
            <span className="text-xs text-zinc-500">AI content operations</span>
          </div>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-red-400">
          Workspace access
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Sign in to your command center.
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Use your Google account to keep campaigns, approvals, and insights
          associated with your workspace identity.
        </p>
        <div className="mt-8">
          <GoogleLogin />
        </div>
        <p className="mt-8 text-center text-[11px] leading-5 text-zinc-600">
          Google authentication is handled by Supabase Auth. ContentPulse never
          receives your Google password.
        </p>
      </section>
    </main>
  );
}

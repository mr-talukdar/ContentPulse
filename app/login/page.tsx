import { GoogleLogin } from "@/components/google-login";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-[#0a0a0a] text-zinc-100 lg:grid-cols-[1.1fr_.9fr]">
      <section className="flex items-center justify-center border-b border-zinc-800 px-6 py-12 lg:border-b-0 lg:border-r lg:px-16">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-red-500 text-lg font-black">
              H
            </span>
            <div>
              <strong className="block text-base">ContentPulse</strong>
              <span className="text-xs text-zinc-500">
                AI content operations
              </span>
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
            Google authentication is handled by Supabase Auth. ContentPulse
            never receives your Google password.
          </p>
        </div>
      </section>
      <section className="relative flex items-center overflow-hidden px-8 py-16 lg:px-20">
        <div className="absolute right-12 top-12 h-32 w-32 border border-red-500/20" />
        <div className="relative max-w-xl">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-blue-400">
            The work behind the workspace
          </p>
          <h2 className="mt-5 text-4xl font-semibold leading-tight sm:text-6xl">
            Content that moves like a signal.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-8 text-zinc-400">
            ContentPulse turns one brief into native Bengali and English
            platform variants, gives people a real approval gate, validates
            every creative, and closes the loop with metrics, insights, and the
            next brief.
          </p>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <div className="border-l-2 border-red-500 pl-3">
              <strong className="block text-sm">Create</strong>
              <span className="text-xs text-zinc-600">
                Brief to platform copy
              </span>
            </div>
            <div className="border-l-2 border-blue-500 pl-3">
              <strong className="block text-sm">Control</strong>
              <span className="text-xs text-zinc-600">
                Human approval included
              </span>
            </div>
            <div className="border-l-2 border-amber-500 pl-3">
              <strong className="block text-sm">Learn</strong>
              <span className="text-xs text-zinc-600">
                Metrics back to briefs
              </span>
            </div>
          </div>
          <blockquote className="mt-14 border border-zinc-800 bg-zinc-950/70 p-5 text-sm leading-7 text-zinc-300">
            “I spent the OpenAI credits perfecting image generation, so the
            natural next step is an internship after the hackathon. At least the
            pixels got a career launch.”
          </blockquote>
          <p className="mt-3 text-xs text-zinc-600">
            Built with curiosity, persistence, and an apparently generous image
            budget.
          </p>
        </div>
      </section>
    </main>
  );
}

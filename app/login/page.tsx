import { GoogleLogin } from "@/components/google-login";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-[#0a0a0a] text-zinc-100 lg:grid-cols-[380px_1fr] xl:grid-cols-[400px_1fr]">
      {/* Left Column: Sign-in panel */}
      <section className="flex items-center justify-center border-b border-zinc-800 px-6 py-10 lg:border-b-0 lg:border-r lg:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-red-500 text-lg font-black text-white">
              H
            </span>
            <div>
              <strong className="block text-base text-zinc-100">
                ContentPulse
              </strong>
              <span className="text-xs text-zinc-500">
                AI content operations
              </span>
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-red-400">
            Workspace access
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl text-zinc-100">
            Sign in to your command center.
          </h1>
          <p className="mt-2 text-xs leading-5 text-zinc-400">
            Use your Google account to keep campaigns, approvals, and insights
            associated with your workspace identity.
          </p>
          <div className="mt-6">
            <GoogleLogin />
          </div>
          <p className="mt-6 text-center text-[10px] leading-4 text-zinc-600">
            Google authentication is handled by Supabase Auth. ContentPulse
            never receives your Google password.
          </p>
        </div>
      </section>

      {/* Right Column: Widescreen two-column content utilizing horizontal space */}
      <section className="relative flex items-center overflow-y-auto px-6 py-8 sm:px-10 lg:px-12 xl:px-16 2xl:px-20">
        <div className="pointer-events-none absolute right-12 top-10 h-28 w-28 border border-red-500/10" />

        <div className="relative w-full max-w-6xl py-2">
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-14">
            {/* Column 1: What ContentPulse is & The Operating Loop */}
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-blue-400">
                  THE BUILDER BEHIND THE WORKSPACE
                </p>
                <h2 className="mt-2 text-2xl font-semibold leading-tight text-zinc-100 sm:text-4xl">
                  Content that moves like a signal.
                </h2>
              </div>

              <div className="space-y-2.5 text-xs leading-6 text-zinc-400">
                <p>
                  ContentPulse is an AI powered content operations command
                  center built by Rahul Talukdar during the Hoichoi AI Builders
                  Hackathon ’26.
                </p>
                <p>
                  The idea is simple: content teams shouldn&apos;t have to treat
                  creation, publishing and analytics as separate workflows.
                </p>
                <p className="font-medium text-zinc-300">
                  ContentPulse takes a single content brief and carries it
                  through the entire loop:
                </p>
                <div className="overflow-x-auto rounded-xs border border-zinc-800 bg-zinc-950/80 px-3 py-2 font-mono text-[11px] text-zinc-300">
                  Brief → Generate → Approve → Schedule → Publish → Measure →
                  Learn → Next Brief
                </div>
                <p>
                  It generates platform specific content for Instagram, YouTube
                  and Facebook, creates native Bengali and English variations,
                  gives humans control through an approval gate, validates
                  content before publishing, and connects performance data back
                  to AI generated insights.
                </p>
                <p>
                  The goal isn&apos;t simply to make AI generate more content.
                </p>
                <p className="font-medium text-zinc-300">
                  It&apos;s to make AI part of the entire content feedback loop.
                </p>
              </div>

              {/* Feature Highlights: Create / Control / Learn */}
              <div className="grid gap-3 pt-2 sm:grid-cols-3">
                <div className="border-l-2 border-red-500 pl-2.5">
                  <strong className="block text-xs font-semibold text-zinc-200">
                    Create
                  </strong>
                  <span className="mt-0.5 block text-[11px] leading-4 text-zinc-500">
                    Brief to platform specific Bengali and English content
                  </span>
                </div>
                <div className="border-l-2 border-blue-500 pl-2.5">
                  <strong className="block text-xs font-semibold text-zinc-200">
                    Control
                  </strong>
                  <span className="mt-0.5 block text-[11px] leading-4 text-zinc-500">
                    Human approval before anything reaches the publishing
                    pipeline
                  </span>
                </div>
                <div className="border-l-2 border-amber-500 pl-2.5">
                  <strong className="block text-xs font-semibold text-zinc-200">
                    Learn
                  </strong>
                  <span className="mt-0.5 block text-[11px] leading-4 text-zinc-500">
                    Performance data becomes insights that shape the next brief
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Builder info, Stack, Easter egg, and Footer */}
            <div className="flex flex-col justify-between space-y-5 lg:border-l lg:border-zinc-800/80 lg:pl-10 xl:pl-12">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.18em] text-zinc-400">
                    Built by Rahul Talukdar
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-zinc-300">
                    I&apos;m a developer and builder who enjoys taking an idea
                    from “what if?” to “okay, this actually works.”
                  </p>
                </div>

                <div className="rounded-xs border border-zinc-800/70 bg-zinc-950/50 p-3">
                  <p className="text-[11px] text-zinc-400">
                    ContentPulse was built in a 12 hour hackathon using:
                  </p>
                  <p className="mt-1 font-mono text-xs text-zinc-200">
                    Next.js · React · TypeScript · Tailwind · Supabase · Gemini
                  </p>
                  <p className="mt-1.5 text-[10px] italic text-zinc-500">
                    Built under pressure, debugged under greater pressure, and
                    powered by a questionable amount of caffeine.
                  </p>
                </div>
              </div>

              {/* Quote / Internship Easter Egg */}
              <blockquote className="rounded-xs border border-zinc-800 bg-zinc-950/80 p-3 text-xs leading-5 text-zinc-300 shadow-sm">
                <p className="italic text-zinc-200">
                  “I came here to build an AI content platform.
                  <br />I may also leave with an internship.”
                </p>
                <p className="mt-2 text-xs font-medium text-amber-300/90">
                  কাজটা AI দিয়ে করালাম, চাকরিটা এবার মানুষই দিক। 😭
                </p>
                <div className="mt-2 space-y-0.5 font-mono text-[11px]">
                  <p className="text-blue-400">
                    useEffect(() =&gt; apply(), [opportunity])
                  </p>
                  <p className="text-emerald-400">
                    {'await internship.find({ location: "anywhere" })'}
                  </p>
                </div>
                <p className="mt-1 text-[10px] text-zinc-500">
                  Dependency array intentionally not empty. I&apos;m ready to
                  start. 👀
                </p>
              </blockquote>

              <p className="text-[10px] text-zinc-600">
                Built with curiosity, persistence, and an unhealthy willingness
                to debug at 2 AM.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

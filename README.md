# ContentPulse

ContentPulse is an AI content-operations workspace for streaming teams. It turns an episode into structured, timestamped intelligence that editorial, marketing, localization, compliance, and content operations can query and act on.

The current screen is the dashboard foundation described in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md), using representative analysis data while the Gemini and Supabase workflow is implemented.

## Stack

- Next.js 16, React 19, and TypeScript
- Tailwind CSS 4 for the build toolchain
- Supabase SSR clients for future persistence
- Gemini Flash as the planned primary multimodal AI provider

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

The dashboard can be viewed without credentials because it currently renders fixture intelligence. Add Supabase and Gemini values to `.env` before implementing or testing the API workflow. Never expose a Gemini secret or Supabase service-role key in a `NEXT_PUBLIC_` variable.

## Checks

```bash
npm run lint
npm run build
```

## Product scope

The build document targets a 12-hour MVP: upload a short video, analyze it with Gemini, persist structured results in Supabase, display scenes, moments, flags, and metadata, and answer timestamp-aware questions through an AI content agent. Actual clip rendering, authentication, GraphQL, and vector search are intentionally deferred.

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for the complete requirement checklist, data model, build order, and demo acceptance criteria.

## Tomorrow's runbook

Use a prepared five-minute video for the first end-to-end test. The dashboard fixtures are temporary scaffolding; the live flow should upload the video, ask Gemini for structured analysis, save it in the existing Supabase project, and reload the result from Supabase.

Set the existing Supabase values plus a server-only `GEMINI_API_KEY` in `.env`. Gemini API limits belong to the Google AI Studio project and usage tier, not a generic consumer Plus subscription. Check the active limits in [Google AI Studio](https://aistudio.google.com/rate-limit) before testing.

Read [ANTIGRAVITY_HANDOFF.md](ANTIGRAVITY_HANDOFF.md) for the complete current-state inventory, environment contract, scope guardrails, and next build sequence. See [problem-statement.md](problem-statement.md) for the product problem.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

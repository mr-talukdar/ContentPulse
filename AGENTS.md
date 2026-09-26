<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ContentPulse Agent Guide

## 1. Product Overview
ContentPulse is an AI-powered closed-loop content operations workspace. It connects brief creation, multi-platform creative and copy generation, human review gates, platform adapter validation, mock publishing, deterministic metrics ingestion, AI insight and report generation, and automated feedback into the next brief.

The core operational loop:
```text
Brief → Generate → Approve → Schedule → Validate → Publish → Measure → Learn → Next Brief
```

For complete architecture, domain models, database schema, and API contracts, see [system-design.md](system-design.md).

## 2. Tech Stack & Architecture
- **Framework**: Next.js 16.3.6 (App Router, Turbopack)
- **UI Library**: React 19.2.8
- **Styling**: Tailwind CSS 4.x (dark mode theme with zinc/slate base, red/blue/amber accents)
- **Language**: TypeScript 5.x (strict type checking)
- **Database & Auth**: Supabase SSR (`@supabase/ssr`, `@supabase/supabase-js`)
  - Identity: Google OAuth via Supabase Auth (no custom credentials)
  - Database: PostgreSQL with RLS policies scoped to campaign ownership
  - Storage: `contentpulse-media` bucket for creative assets
- **AI Engine**:
  - Google Gemini via `@google/genai` (multi-model fallback: `gemini-3.8-flash` → `gemini-3.5-flash-lite`)
  - Image generation via Hugging Face (`FLUX.1-schnell` / `SDXL`) with local SVG creative library fallback (`public/creative-library/`)

## 3. Core Principles & Guardrails
1. **Never Break the Closed Loop**: Changes to any step must preserve data flow into subsequent steps (e.g. insights must link to published post IDs; next briefs must prefill from insights).
2. **Strict State Machine**: Post mutations MUST follow defined lifecycle transitions:
   `draft` → `generating` → `review` → `approved` / `rejected` → `scheduled` → `published`.
3. **Multi-Platform Adaptation**:
   - Instagram: 9:16 vertical, punchy visual hooks, native Bengali/English.
   - YouTube: 16:9 widescreen, narrative-driven titles and descriptions.
   - Facebook: 1:1 square or 4:5 vertical, community conversation & share-oriented.
4. **Native Language Generation**: Bengali copy must be natively generated from context and briefs, NOT translated from English.
5. **Human Approval Gate**: Posts cannot be scheduled or published without explicit approval.
6. **Platform Adapter Validation**: Assets are strictly validated against platform aspect ratios and constraints before mock publishing.
7. **Security & Secrets**: Never expose API keys (`GEMINI_API_KEY`, `HF_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) to client-side bundles. All AI calls run in Next.js server route handlers.

## 4. Key Workspaces & Navigation
- `/`: Command Center overview & pipeline status
- `/studio`: Generative Studio for briefs, multi-platform generation, and visual creation
- `/approval`: Approval Queue with campaign filtering and approve/reject/retry actions
- `/publisher`: Release pipeline (Approved → Scheduled → Adapter Validation → Published)
- `/analytics`: Cross-platform metrics comparison and like-for-like analysis
- `/insights`: AI-generated strategic insights with cited source posts
- `/reports`: Executive performance reports with Markdown export
- `/login`: Google OAuth authentication entry point

## 5. Standard Commands
- Run development server: `npm run dev`
- Type checking: `npx tsc --noEmit`
- Linting: `npm run lint`
- Production build: `npm run build`

# ContentPulse — Claude Developer Guide

@AGENTS.md

## Fast Reference
- **System Design**: See [system-design.md](system-design.md) for full architecture, database schemas, state machine definitions, and API route specs.
- **Commands**:
  - `npm run dev` — start Next.js Turbopack development server
  - `npx tsc --noEmit` — run TypeScript validation
  - `npm run lint` — run ESLint check
  - `npm run build` — run Next.js production build

## Architecture & Code Conventions
- Follow Next.js 16 App Router conventions (`app/**/page.tsx`, `app/api/**/route.ts`).
- Server components by default; use `'use client'` only where state, effects, or browser events are required.
- Do not bypass server-side state machine checks in `/api/posts/[id]/*`.
- Validate all route parameters and request bodies with types defined in `utils/contentpulse/types.ts`.
- Retain dark mode styling (`zinc-950` / `zinc-900` / `zinc-800`) with consistent Hoichoi-inspired accents.

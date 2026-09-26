# ContentPulse Implementation Progress

## Current Runtime Status

- **Gemini AI Integration Complete**: `/api/generate`, `/api/posts/[id]/retry`, `/api/insights/generate`, `/api/reports/generate`, and `/api/briefs/from-insight` routes are fully wired to `utils/ai/gemini-gateway.ts` with live Gemini model routing and automatic fallback to demo fixtures if API key is missing or calls fail.
- **State Machine Security Boundary**: Validated and enforced across all post mutation routes (`approve`, `reject`, `retry`, `schedule`, `publish`).
- **Platform Adapter Validation**: Instagram (9:16), YouTube (16:9), and Facebook (1:1/4:5) adapters enforce aspect ratio constraints and reject invalid assets before publishing.
- The existing `/api/analyze` flow remains untouched and operational.
- **Interactive frontend complete**: The Command Center and all six workflow pages now use a shared Tailwind CSS 4 client UI with loading, action, retry, and generated-result states.
- **Read APIs and hydration complete**: Added the system-design GET routes for campaigns, campaign detail, posts, metrics, per-post metrics, insights, and reports. Approval, Publisher, Analytics, Insights, and Reports now hydrate from those APIs with fixture fallback.
- **Live pipeline surfaces completed**: Command Center derives campaign/post/insight activity from API reads; Analytics renders repository metrics; Insights reads generated insight rows; Reports reads persisted reports and shows an explicit empty state before the first report.
- **Creative generation implemented**: `/api/creative/generate` uses Hugging Face image generation when `HF_API_KEY` is configured, falls back to local platform assets, and returns a data URL before the separate Supabase Storage persistence step.
- **Hugging Face visual provider selected & verified**: Live text-to-image with `black-forest-labs/FLUX.1-schnell` was tested and verified with `HF_API_KEY` (generating a 1.4MB JPEG via provider `nscale` in ~4.5s). Added automatic multi-model fallback (`FLUX.1-schnell` → `SDXL` → `SD 1.5`) with a 30s timeout per candidate in `utils/ai/huggingface-gateway.ts`.
- **High-fidelity local creative library upgraded**: Upgraded `public/creative-library/{instagram,youtube,facebook}.svg` from wireframe placeholders into high-fidelity, cinematic Hoichoi original posters with Bengali typography ("রাত বাকি", "যে সত্য লুকিয়ে ছিল..."), dramatic noir lighting, and authentic production badges for vertical 9:16, widescreen 16:9, and square 1:1 ratios.
- **Visual generation concurrency throttled**: Added staggered auto-generation in `PostCard` (`staggerIndex * 1500ms`) to prevent concurrent requests from exhausting Hugging Face serverless rate limits.
- **Storage extension mapping fixed**: Corrected `decodeImageData` in `app/api/creative/route.ts` so `image/svg+xml` maps to `.svg` instead of `.svg+xml`.
- **Token exhaustion modal added**: Implemented `components/token-exhausted-dialog.tsx` mounted in `app/layout.tsx`. When Hugging Face hits quota limits or falls back to local assets, an interactive modal triggers informing the user that free-tier tokens are exhausted, offering an interactive "💼 Offer Him an Internship ✦" recruitment flow (with email contact and GitHub link) or "🎨 Fallback to Demo Library" static continuation.
- **Local creative library added**: Platform-mapped SVG assets provide deterministic Instagram, YouTube, and Facebook fallbacks when Hugging Face is unavailable.
- **Local creative library added**: Platform-mapped SVG assets provide a deterministic Instagram, YouTube, or Facebook fallback when Hugging Face is unavailable, and still flow through Supabase Storage persistence.
- **Visual generation isolated**: Added `/api/creative/generate` so the frontend receives and displays the generated image before the separate Supabase Storage persistence request. Storage failures no longer hide a successfully generated visual.
- **Creative Storage bucket added to schema**: `supabase/schema.sql` now creates the public `contentpulse-media` bucket and adds authenticated upload/update/read policies for `creatives/*` assets.
- **Visual pipeline split verified**: The two-step generation/upload architecture returns visuals before Storage persistence; the current Hugging Face/local fallback path still needs a live HF-token verification.
- **Schema rerun hardened**: Added drop-before-create guards for the existing Problem 1 RLS policies so Supabase SQL Editor can safely re-run the complete schema without `42710 policy already exists` errors.
- **Problem 3 policy rerun hardened**: Added drop-before-create guards for all owner-aware campaign, concept, post, metrics, insight, report, and demo insert policies.
- **RLS type compatibility fixed**: Owner-aware policies now cast stored owner IDs and `auth.uid()` to text, allowing the schema to run against existing deployments where owner columns were created with a different compatible type.
- **Generation activity messaging added**: Studio now cycles through predetermined English/Bengali activity messages while campaign generation is running.
- **Generation activity sequence fixed**: Studio activity messages now progress one-way from brief analysis to platform adaptation and final review preparation, without looping back to a starting message.
- **Visual UI state fixed**: Generated images render immediately before Storage persistence completes; the card now separates `Generating visual...` from `Saving visual...` and retains the preview if persistence fails.
- **Studio visual automation added**: New generated posts automatically begin visual generation with ratio-aware spinners; failures retain a retry action and successful cards expose regenerate.
- **Approval detail workflow added**: Approval Queue now shows campaign name/ID, persisted creative thumbnails, and an expandable focused post-detail screen with caption, rationale, hashtags, and visual.
- **Full-content Studio rail added**: Studio output cards now preserve full caption, creative direction, rationale, and hashtags in wider cards with horizontal scrolling instead of compressing or truncating post data.
- **Deferred campaign persistence added**: Studio no longer hydrates historical owner posts or persists new campaign output during generation. The explicit Approval Queue handoff commits the current campaign, concept, and posts through `/api/campaigns/[id]/commit`.
- **Studio workspace widened**: Generative Studio now uses the full main application width, with a narrower brief column and a bounded smooth horizontal carousel for fixed-width generated cards.
- **Approval campaign grouping added**: Approval Queue opens with campaign cards first, then scopes social-platform filters and post review actions to the selected campaign.
- **Approval-to-publisher handoff strengthened**: Selected campaigns now show review/approved/scheduled/published counts, an explicit Publisher link, and Publisher explains the validation/mock-publish release gate.
- **Publisher pipeline implemented**: Publisher now presents Approved → Scheduled → Validate → Mock Publish → Published with scheduling UI, adapter progress messaging, stable external IDs, and a deterministic invalid-ratio validation failure card.
- **Google identity persistence added**: Google-only Supabase Auth login, OAuth callback exchange, cookie session refresh, and shared logout are implemented. Configuration requirements are documented in `GOOGLE_AUTH_SETUP.md`.
- **Identity architecture confirmed**: Supabase Auth is the identity authority; Google is the only OAuth provider. No email/password login or separate app-owned login system is used.
- **Google OAuth initiation verified**: Local `/login` renders correctly and the button redirects to Google through the configured Supabase Auth callback without exposing credentials to ContentPulse.
- **Supabase persistence added**: Authenticated requests now use `utils/contentpulse/repository.ts` for campaign, concept, post, metrics, insight, and report persistence when `NEXT_PUBLIC_DEMO_MODE=false`; demo mode remains an explicit fallback.
- **Supabase persistence verified**: With demo mode disabled and the schema applied, authenticated `GET /api/campaigns` returned `persistence: "supabase"` successfully.
- **Ownership schema added**: Campaigns and reports have owner IDs, and Problem 3 policies scope authenticated writes and related child reads through campaign ownership while preserving nullable seeded demo rows.
- **Gemini availability hardened**: The model registry honors `GEMINI_MODEL`, defaults to the current stable `gemini-3.8-flash` when unset, uses `gemini-3.5-flash-lite` for high-throughput fallback, and retries transient `503`/`429` capacity errors before falling through.
- **Model output normalization fixed**: Added shared hashtag normalization so Gemini string outputs become Postgres `text[]` values before Supabase writes and safe arrays before React `.map()` rendering.
- **Report output normalization fixed**: Added shared list normalization so report sections remain arrays even when a model returns a single string; provider names were removed from repeated user-facing workflow labels.
- **Report download added**: Reports now offer a client-side Markdown download containing the summary, learnings, recommendations, period, and source post IDs.
- **README rewritten**: Replaced the original Problem 1 scaffold README with a complete current ContentPulse product, architecture, API, persistence, authentication, media, setup, demo, validation, and known-gaps guide.

## Single Source of Truth

This file is the canonical implementation ledger, project status, and next-step plan for ContentPulse. `GOOGLE_AUTH_SETUP.md` remains as a supporting operator guide because it contains Google Cloud and Supabase configuration instructions, not progress history.

## Current Architecture

- **Identity**: Supabase Auth is the identity authority; Google is the only OAuth provider. There is no email/password login or separate application-owned login system.
- **Persistence**: With `NEXT_PUBLIC_DEMO_MODE=false` and an authenticated session, campaigns, concepts, posts, metrics, insights, reports, and creative URLs persist through Supabase. Demo fixtures remain the explicit fallback.
- **AI**: Gemini handles text generation, retries, insights, reports, and next briefs through server-only routes with model fallback.
- **Media**: Hugging Face handles optional remote image generation; the local creative library is the deterministic fallback. Images upload to Supabase Storage and are saved as `posts.creative_url`.
- **Image fallback boundary**: `utils/ai/model-registry.ts` still contains legacy Gemini image model entries for compatibility, but the active creative routes do not call them.
- **Security**: Post transitions are enforced server-side. Campaign/report owner IDs and owner-aware RLS policies are present in `supabase/schema.sql`.

## Next Steps

### 1. Verify Visual Generation and Storage

- Add `HF_API_KEY` to `.env` and confirm `HF_IMAGE_MODEL` is available for the account.
- Click **Generate visual** in Studio for a real post.
- Confirm the response provider is `huggingface` when HF is configured, or `local-library` without HF access.
- Confirm the `contentpulse-media` bucket exists and its read policy allows previews.
- Re-run the updated `supabase/schema.sql` in the Supabase SQL Editor so the bucket and Storage policies are actually created.
- Confirm the generated `creative_url` is persisted in Supabase and survives refresh.
- If the bucket is private, replace public URLs with signed URLs for previews.

### 2. Verify the Authenticated Supabase Workflow

- Create a campaign from Studio while signed in.
- Confirm the campaign row has the current Google user ID in `campaigns.owner_id`.
- Confirm concepts and posts are persisted with the campaign relationship.
- Exercise approve → reject/retry → schedule → publish and verify each status in Supabase.
- Ingest metrics, generate insights, generate a report, and confirm all rows persist.
- Refresh the browser and confirm the data is still available.

### 3. Harden Ownership and RLS

- Run Supabase security advisors against the applied schema.
- Test owner read/write access with the current Google user.
- Test that a second user cannot read or mutate the first user’s campaign.
- Test that anonymous users can only see nullable seeded demo rows, if that behavior remains desired.
- Add a migration path for any existing rows that need ownership assigned.

### 4. Add Browser Walkthrough Tests

- Add a Next.js-compatible browser test runner.
- Cover login initiation, Command Center, Studio generation, approval/retry, scheduling, mock publishing, analytics, insights, and reports.
- Run browser tests in deterministic demo mode for CI.
- Add an opt-in live Supabase/Gemini smoke test for deployed verification only.

### 5. Production Cleanup

- Add structured Zod validation for Hugging Face image responses and route payloads.
- Add retry/backoff and user-visible timeout handling for Hugging Face image generation.
- Replace any remaining direct demo-store reads with repository reads in authenticated mode.
- Add monitoring for Gemini failures, Storage upload failures, and Supabase persistence errors.
- Rotate any credentials that may have been exposed during local setup and keep secrets out of tracked files.

## Files created or updated

- `utils/contentpulse/types.ts`: Added Problem 3 domain types while preserving legacy episode-analysis types used by `/api/analyze`.
- `utils/contentpulse/state-machine.ts`: Added valid post transitions, transition assertions, and next-status lookup.
- `utils/contentpulse/platform-profiles.ts`: Added Instagram, YouTube, and Facebook ratios and copy constraints.
- `utils/contentpulse/demo-data.ts`: Added deterministic `CMP_001`/`CMP_002`/`CMP_003`, `IG_001`/`YT_001`/`FB_001`, metrics, insights, and report fixtures.
- `utils/contentpulse/store.ts`: Added the server-side demo data store and post lookup/status update helpers.
- `utils/contentpulse/repository.ts`: Added the authenticated Supabase repository with snake_case/camelCase mapping and demo fallback selection.
- `utils/contentpulse/adapters/instagram.ts`: Added Instagram validation and stable mock publishing.
- `utils/contentpulse/adapters/youtube.ts`: Added YouTube validation and stable mock publishing.
- `utils/contentpulse/adapters/facebook.ts`: Added Facebook validation and stable mock publishing.
- `utils/ai/model-registry.ts`: Added environment-configured reasoning, fast, and image model tiers with fallbacks.
- `utils/ai/gemini-gateway.ts`: Added server-only Gemini JSON generation with model fallback.
- `utils/ai/huggingface-gateway.ts`: Added server-only Hugging Face text-to-image response normalization for data URLs, remote URLs, and Blob responses.
- `utils/ai/local-creative-library.ts`: Maps each platform to a local creative asset and returns a Storage-ready data URL payload.
- `public/creative-library/{instagram,youtube,facebook}.svg`: Added deterministic platform-specific local creative fallback assets.
- `utils/contentpulse/prompts/{campaign,instagram,youtube,facebook,retry,insights,report,next-brief}.ts`: Added structured prompt builders; Bengali prompts explicitly generate natively from the brief.
- `utils/contentpulse/normalize.ts`: Normalizes model hashtag arrays or strings into unique hashtag arrays.
- `utils/contentpulse/normalize.ts`: Also normalizes report section strings into renderable lists.
- `supabase/schema.sql`: Preserved existing Problem 1 tables and added campaigns, concepts, posts, metrics, insights, reports, indexes, constraints, RLS, and demo grants.
- `app/api/_lib.ts`: Added shared JSON parsing, error responses, and state-transition enforcement.
- `app/api/campaigns/route.ts`: Added campaign GET/POST.
- `app/api/generate/route.ts`: Integrated live Gemini reasoning + multi-platform post generation with fallback.
- `app/api/posts/[id]/{approve,reject,retry,schedule,publish}/route.ts`: Integrated live Gemini retry generation and guarded state transitions.
- `app/api/metrics/ingest/route.ts`: Added deterministic metrics ingestion.
- `app/api/insights/generate/route.ts`: Integrated live Gemini insight generation with source post traceability.
- `app/api/reports/generate/route.ts`: Integrated live Gemini report generation with evidence citations.
- `app/api/briefs/from-insight/route.ts`: Integrated live Gemini insight-to-brief creation.
- `app/api/campaigns/[id]/route.ts`: Added campaign detail reads with related concept and posts.
- `app/api/posts/route.ts`: Added filterable post reads by status and platform.
- `app/api/metrics/route.ts`: Added metrics collection reads.
- `app/api/metrics/[postId]/route.ts`: Added per-post metrics reads.
- `app/api/insights/route.ts`: Added campaign-filtered insight reads.
- `app/api/reports/route.ts`: Added report collection reads.
- `supabase/schema.sql`: Added owner IDs and owner-aware RLS policies for the Problem 3 tables.
- `app/api/creative/route.ts`: Added image data validation, Hugging Face/local fallback handling, Supabase Storage upload, and post creative URL persistence.
- `app/api/creative/generate/route.ts`: Added an independent Hugging Face/local-fallback image generation endpoint returning a data URL for direct frontend verification.
- `app/auth/callback/route.ts`: Exchanges the Supabase OAuth callback code for a cookie-backed session.
- `app/login/page.tsx`: Added the Google-only login screen.
- `components/google-login.tsx`: Added the Supabase Google OAuth trigger and error state.
- `components/logout-button.tsx`: Added session sign-out and redirect behavior.
- `proxy.ts`: Added Next.js 16 Supabase session refresh handling.
- `GOOGLE_AUTH_SETUP.md`: Added Google Cloud, Supabase, environment, redirect URL, and verification instructions.
- `.env.example`: Documented all Supabase, Gemini model-tier, demo-mode, Storage, and upload environment variables with safe placeholders.
- `package.json`: Added the pinned `@huggingface/inference` dependency and removed the unused OpenAI SDK.
- `components/contentpulse-shell.tsx`: Shared navigation shell.
- `app/{studio,approval,publisher,analytics,insights,reports}/page.tsx`: Initial route page scaffolds.
- `app/globals.css`: ContentPulse dark workspace shell styles and responsive behavior.
- `components/contentpulse-ui.tsx`: Added interactive Command Center, Generative Studio brief form and live Gemini generation action, approval filters/actions/retry feedback, publisher kanban and adapter publish action, analytics comparison table, insight generation/next-brief actions, and weekly report generation/evidence view.
- `app/page.tsx`: Replaced the legacy episode dashboard with the ContentPulse Command Center.
- `app/studio/page.tsx`: Wired the Generative Studio workspace.
- `app/approval/page.tsx`: Wired the Approval Queue workspace.
- `app/publisher/page.tsx`: Wired the Publisher pipeline workspace.
- `app/analytics/page.tsx`: Wired the like-for-like Analytics workspace.
- `app/insights/page.tsx`: Wired the AI Insights workspace.
- `app/reports/page.tsx`: Wired the Weekly Reports workspace.

## Frontend implementation status

- Completed rich, interactive React Client Components for all 6 pages using Tailwind CSS 4 to match the Stitch design system (`ContentPulse Dark`):
  1. `app/page.tsx` (Command Center): Dashboard overview, 4 stats cards, flywheel diagram, top concept, latest insight with CTA button.
  2. `app/studio/page.tsx` (Generative Studio): Brief input form with campaign name, objective, topic, audience, Bengali/English selectors, tone, CTA, platform cards, and `Generate Campaign ✦` submit action. Shows 3-column platform output cards upon generation.
  3. `app/approval/page.tsx` (Approval Queue): Filterable list of posts in review, rejected with feedback box, and approved states with `Approve`, `Reject & Retry`, and `Schedule` actions.
  4. `app/publisher/page.tsx` (Publisher): Pipeline view showing post validation status and mock publish triggering.
  5. `app/analytics/page.tsx` (Analytics): Like-for-like concept performance comparison table.
  6. `app/insights/page.tsx` (Insights): AI insight cards with source post ID badges (`IG_001`, `FB_001`) and `Create Next Brief →` trigger.
  7. `app/reports/page.tsx` (Reports): Weekly report view with cited evidence and `Create Next Brief →` CTA.

## Current Problems and Remaining Product Work

- Verify the Hugging Face token, configured image model, and local-library fallback with a real Studio **Generate visual** click.
- Verify the generated image survives the separate Storage upload and that `posts.creative_url` remains populated after refresh.
- Re-run the latest `supabase/schema.sql` if the Storage bucket or owner-aware policies are not present in the deployed project.
- Complete live authenticated workflow and cross-user RLS verification against the applied Supabase schema.
- Add browser-level walkthrough tests for the full brief → generate → approve → schedule → publish → learn loop.
- Add monitoring and structured error handling for Hugging Face failures, Storage upload failures, and Supabase persistence errors.
- Remove stale demo fixtures from non-demo read paths once the authenticated repository is fully verified across every page.

## Validation

- `npx tsc --noEmit` passes cleanly (0 errors).
- `npm run lint` passes cleanly.
- `npm run build` passes cleanly.
- `npx tsc --noEmit` passes cleanly after the interactive frontend implementation.
- `npx tsc --noEmit` passes cleanly after the read APIs and creative storage boundary.
- `npx tsc --noEmit` passes cleanly after Google OAuth implementation.
- `npm run build` passes; Next.js recognizes `/auth/callback`, `/login`, and `proxy.ts`.
- `npx tsc --noEmit` passes cleanly after Supabase repository and ownership changes.
- `npm run build` passes after Supabase repository and ownership changes; all auth and persistence routes compile.
- `npx tsc --noEmit` passes after Gemini visual generation and Storage integration.
- `npm run build` passes after Gemini visual generation and Storage integration.
- `npx tsc --noEmit` passes after Gemini model availability hardening.
- Browser smoke check: `http://localhost:3000/login` rendered successfully and Google OAuth initiation reached the Google sign-in endpoint. Final consent and callback session verification require the user to complete Google sign-in.
- `HF_API_KEY` with `black-forest-labs/FLUX.1-schnell` verified live; generated a 1.4MB JPEG in ~4.5 seconds via provider `nscale`.
- Added multi-model fallback chain (`FLUX.1-schnell` → `SDXL` → `SD 1.5`) and staggered auto-generation in `PostCard` to prevent rate limits.
- Upgraded `public/creative-library/` with a 12-asset diverse library of high-fidelity cinematic Hoichoi original posters (4 Instagram 9:16, 4 YouTube 16:9, 4 Facebook 1:1) with hash rotation and semantic keyword matching so generated posts never share identical wireframes.
- Added Token Exhaustion / Developer Internship recruitment dialog (`components/token-exhausted-dialog.tsx`) notifying evaluators when Hugging Face quotas expire, providing 1-click email outreach (`buduman209@gmail.com`) or static fallback to the demo creative library.
- Stabilized `PostCard` React Fast Refresh effect and callback lifecycle (`triggeredPostIdRef`), eliminating DevTools warning traces and preventing duplicate auto-generation triggers.
- Cleaned up ~120 lines of obsolete commented-out code in `components/contentpulse-ui.tsx`.
- All quality gates pass: `npx tsc --noEmit` (0 errors), `npm run lint` (0 errors), and `npm run build` (all 25 routes compiled successfully).

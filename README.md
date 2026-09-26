# ContentPulse

> **Create. Approve. Publish. Learn.**

ContentPulse is an AI-native content operations command center that turns a single content brief into platform-specific Bengali and English social posts, routes them through human approval, validates platform constraints, mock-publishes them with traceable IDs, ingests performance metrics, generates AI-powered insights and reports, and feeds those learnings back into the next campaign brief — closing the loop automatically.

Built by **Rahul Talukdar** during the **Hoichoi AI Builders Hackathon '26**.

---

## The Idea

Content teams normally treat creation, publishing, and analytics as separate workflows across disconnected tools. ContentPulse brings the entire content lifecycle into one continuous, AI-assisted loop:

```
Brief → Generate → Approve → Schedule → Validate → Publish → Measure → Learn → Next Brief
                                                                                    ↓
                                                                              Loop Closes
```

ContentPulse is **not** just an AI content generator. It's a **closed-loop content operations system** where every stage feeds into the next.

---

## What It Does

| Step | What Happens |
|------|-------------|
| **Brief** | Define a campaign with audience, tone, target platforms, and language preferences |
| **Generate** | AI creates platform-specific Bengali and English content with tailored creative prompts |
| **Review** | Human approval gate — nothing publishes without explicit human sign-off |
| **Reject / Retry** | Rejected posts go back to AI with feedback for regeneration |
| **Schedule** | Approved posts are scheduled for publishing |
| **Validate** | Platform adapters enforce aspect ratio and format rules before publishing |
| **Publish** | Mock publish with stable, traceable external post IDs (`IG_001`, `YT_001`, `FB_001`) |
| **Measure** | Deterministic performance metrics are ingested per published post |
| **Learn** | AI generates strategic insights citing specific source posts |
| **Report** | Executive summary with evidence-linked recommendations and Markdown export |
| **Next Brief** | Insights pre-fill the next campaign brief — the loop closes |

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.3.6 |
| UI | React | 19.2.8 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS (dark mode) | 4.x |
| Database & Auth | Supabase (Postgres, Auth, Storage) | SSR |
| AI — Text | Google Gemini via `@google/genai` | 2.24.0 |
| AI — Image | Hugging Face (FLUX.1-schnell / SDXL) | Inference API |
| Validation | Zod | 4.6.5 |

---

## Architecture

### System Overview

```
┌──────────────────────────────────────────┐
│            Browser (Client)              │
│     Next.js Pages + React 19 UI          │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│          Next.js API Routes              │
│  ┌────────────┐  ┌─────────────────────┐ │
│  │   State    │  │  Platform Adapters  │ │
│  │  Machine   │  │   (IG / YT / FB)   │ │
│  └────────────┘  └─────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │       Gemini Gateway                │ │
│  │   (Model Registry + Fallback)       │ │
│  └─────────────────────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │    Hugging Face Image Gateway       │ │
│  │  (FLUX.1 → SDXL → Local Fallback)  │ │
│  └─────────────────────────────────────┘ │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│             Data Layer                    │
│   Supabase Postgres + Storage + Auth     │
└──────────────────────────────────────────┘
```

### AI Model Strategy

ContentPulse uses multiple AI models for different jobs, with automatic fallback chains:

| Task | Primary Model | Fallback Chain |
|------|--------------|----------------|
| Campaign & post generation | `gemini-3.8-flash` | → `gemini-3.7-flash` → `gemini-3.5-flash-lite` |
| Fast operations | `gemini-3.5-flash-lite` | → `gemini-3.1-flash-lite` |
| Image generation | HF `FLUX.1-schnell` | → `SDXL` → `SD 1.5` → Local SVG library |

Transient errors (`503`, `429`) trigger automatic retries with exponential backoff before falling through to the next model.

### Post Lifecycle State Machine

The state machine is enforced server-side. Invalid transitions return `400 Bad Request`.

```
draft → generating → review → approved → scheduled → published
                       ↓
                    rejected → (retry with feedback) → generating
```

| From | To | Trigger |
|------|----|---------:|
| `draft` | `generating` | "Generate Campaign" |
| `generating` | `review` | AI generation completes |
| `review` | `approved` | Human clicks "Approve" |
| `review` | `rejected` | Human clicks "Reject & Retry" |
| `rejected` | `generating` | Human submits retry feedback |
| `approved` | `scheduled` | "Schedule Post" |
| `scheduled` | `published` | Adapter validates + mock publish |

Attempting `review → scheduled`, `draft → published`, or any other invalid path is blocked.

---

## Pages & Navigation

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Command Center | Pipeline overview, operational KPIs, top concept, latest insight |
| `/studio` | Generative Studio | Brief form → AI campaign generation → platform-specific cards |
| `/approval` | Approval Queue | Campaign-scoped review with approve, reject, and retry actions |
| `/publisher` | Publisher | Schedule → Validate → Mock Publish pipeline |
| `/analytics` | Analytics | Cross-platform metrics comparison (like-for-like) |
| `/insights` | Insights | AI-generated strategic insights with source post citations |
| `/reports` | Reports | Executive performance reports with Markdown download |
| `/login` | Login | Google OAuth via Supabase Auth |

---

## API Routes

### Campaign Management

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/campaigns` | List all campaigns |
| `GET` | `/api/campaigns/[id]` | Get campaign detail with concept and posts |
| `POST` | `/api/campaigns/[id]/commit` | Persist ephemeral campaign to Supabase |

### Content Generation

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/generate` | Generate campaign concept + platform posts from brief |
| `POST` | `/api/creative/generate` | Generate visual creative (HF or local fallback) |
| `POST` | `/api/creative` | Upload creative to Supabase Storage |
| `POST` | `/api/briefs/from-insight` | Create next brief from an insight |

### Post Lifecycle

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/posts` | List posts (filterable by campaign / status) |
| `POST` | `/api/posts/[id]/approve` | `review` → `approved` |
| `POST` | `/api/posts/[id]/reject` | `review` → `rejected` (with feedback) |
| `POST` | `/api/posts/[id]/retry` | `rejected` → `generating` → `review` |
| `POST` | `/api/posts/[id]/schedule` | `approved` → `scheduled` |
| `POST` | `/api/posts/[id]/publish` | Validate + `scheduled` → `published` |

### Analytics & Intelligence

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/metrics` | Get all metrics |
| `GET` | `/api/metrics/[postId]` | Get metrics for a specific post |
| `POST` | `/api/metrics/ingest` | Ingest deterministic metrics for published posts |
| `GET` | `/api/insights` | List insights |
| `POST` | `/api/insights/generate` | Generate insights from metrics + published posts |
| `GET` | `/api/reports` | List reports |
| `POST` | `/api/reports/generate` | Generate executive weekly report |

---

## Multi-Platform Content Strategy

ContentPulse generates **platform-specific content**, not generic posts. Each platform gets tailored copy, creative direction, and format:

| | Instagram | YouTube | Facebook |
|---|-----------|---------|----------|
| **Aspect Ratio** | 9:16 (vertical) | 16:9 (widescreen) | 1:1 or 4:5 |
| **Tone** | Energetic, intimate | Explanatory, cinematic | Conversational |
| **Focus** | Discovery + curiosity | Deeper viewing intent | Shares + community |
| **Hashtags** | 5–10 focused | 3–5 minimal | 5–15 moderate |
| **CTA** | "Watch now" | "Watch / Subscribe" | "Watch / Share / Learn more" |
| **Creative** | Character + visual hook | Wide cinematic composition | Social, share-friendly |

### Language Strategy

- **Bengali**: Natively generated from brief context — never translated from English
- **English**: Generated alongside Bengali for bilingual campaign support

---

## Media & Creative Pipeline

### Generation Flow

```
Brief generates creative_prompt per post
           │
           ▼
POST /api/creative/generate
           │
     ┌─────┴──────┐
     ▼             ▼
 HF Success    HF Fails / No Token
     │             │
     ▼             ▼
 Data URL     Local SVG Library
     │             │
     └──────┬──────┘
            ▼
   Client displays preview immediately
            │
            ▼
   POST /api/creative → Supabase Storage (async)
```

Visual generation is deliberately split from persistence — a Storage failure does not hide a successfully generated visual.

### Local Creative Library

High-fidelity, cinematic platform-mapped SVG assets in `public/creative-library/`:

- `instagram.svg` — 9:16 vertical Bengali poster
- `youtube.svg` — 16:9 widescreen cinematic poster
- `facebook.svg` — 1:1 square community poster

These serve as reliable fallbacks when Hugging Face is unavailable.

### Platform Adapter Validation

Before mock publishing, adapters validate content against platform constraints:

- **Instagram**: 9:16 primary, also allows 4:5 and 1:1
- **YouTube**: 16:9 primary, also allows 9:16
- **Facebook**: 1:1 primary, also allows 4:5 and 16:9

Invalid assets are **rejected with a reason** — content is never silently cropped or resized.

---

## Authentication

ContentPulse uses **Google OAuth only** via Supabase Auth. No email/password login exists.

1. User clicks "Sign in with Google" on `/login`
2. Supabase redirects to Google consent screen
3. OAuth callback exchanges code at `/auth/callback`
4. Session cookie is set via `@supabase/ssr`
5. Middleware refreshes the session on every request

### Google OAuth Setup

1. Create or select a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Configure the OAuth consent screen (External application)
3. Add `openid`, `email`, and `profile` scopes
4. Add your Google account as a test user
5. Create a Web application OAuth client
6. Add this as an authorized redirect URI:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
7. In Supabase **Authentication → Providers → Google**, enable Google and enter the client ID and secret
8. In **Authentication → URL Configuration**, set the site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` as an allowed redirect URL
9. Keep the Google client secret in Supabase only — never in `NEXT_PUBLIC_` variables

---

## Persistence

ContentPulse supports two persistence modes:

### Supabase Mode (Production)

When `NEXT_PUBLIC_DEMO_MODE=false` and Supabase is configured:

- All campaigns, posts, metrics, insights, and reports persist to Postgres
- Creative assets upload to Supabase Storage (`contentpulse-media` bucket)
- RLS policies scope data to campaign owners via `auth.uid()`
- Google OAuth provides identity

### Demo Mode (Default)

When `NEXT_PUBLIC_DEMO_MODE=true` or Supabase is unavailable:

- In-memory store with demo fixtures
- All features work without external dependencies
- Useful for local development and demo walkthroughs

### Deferred Campaign Persistence

Studio generation is intentionally ephemeral. Creating a campaign and generating posts does **not** immediately persist to the database. Persistence occurs when the user clicks **"Proceed to Approval Queue"**, which calls `POST /api/campaigns/[id]/commit`. This prevents abandoned generation attempts from cluttering the database.

---

## Database Schema

Core tables defined in `supabase/schema.sql`:

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `campaigns` | Campaign briefs | `id`, `name`, `brief` (JSONB), `owner_id`, `status` |
| `campaign_concepts` | Generated concepts | `id`, `campaign_id`, `concept_name`, `strategic_intent` |
| `posts` | Platform-specific content | `id`, `platform`, `language`, `caption`, `status`, `aspect_ratio` |
| `post_metrics` | Performance data | `post_id`, `impressions`, `likes`, `engagement_rate` |
| `insights` | AI-generated insights | `campaign_id`, `type`, `claim`, `source_post_ids` |
| `reports` | Executive reports | `period_start`, `period_end`, `content` (JSONB) |

All tables use Row Level Security (RLS) policies scoped through campaign ownership. The schema is designed to be rerunnable — existing policies are dropped before recreation.

---

## Quick Start

### Prerequisites

- Node.js 20+
- A Supabase project (for persistence mode)
- A Google Gemini API key
- A Hugging Face API key (optional — for image generation)

### Setup

```bash
# Clone the repository
git clone https://github.com/mr-talukdar/ContentPulse.git
cd ContentPulse

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your keys (see Environment Variables below)

# Apply database schema (if using Supabase persistence)
# Copy supabase/schema.sql into Supabase SQL Editor and run

# Start development server
npm run dev
```

Open `http://localhost:3000/login` to sign in, then `http://localhost:3000/` for the Command Center.

### Environment Variables

```env
# Supabase (required for persistence mode)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY

# Google Gemini AI (server-side only — required for text generation)
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Model routing (optional — defaults shown)
GEMINI_REASONING_MODEL=gemini-3.5-flash
GEMINI_FAST_MODEL=gemini-3.5-flash-lite

# Hugging Face (server-side only — optional, for image generation)
HF_API_KEY=YOUR_HUGGINGFACE_TOKEN
HF_IMAGE_MODEL=black-forest-labs/FLUX.1-schnell

# Supabase Storage
SUPABASE_STORAGE_BUCKET=contentpulse-media
```

> **Security**: All API keys are server-side only. Variables prefixed with `NEXT_PUBLIC_` are browser-visible — never use that prefix for secrets like `GEMINI_API_KEY` or `HF_API_KEY`.

### Development Commands

```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint
npx tsc --noEmit   # TypeScript validation
```

---

## Demo Walkthrough

A complete demonstration of the closed loop in 14 steps:

| Step | Action | What You See |
|:----:|--------|-------------|
| 1 | Create a campaign brief | Form with audience, tone, platforms, language |
| 2 | Generate content | AI producing 3 platform × 2 language posts |
| 3 | Compare platforms | Instagram vertical vs YouTube wide vs Facebook square |
| 4 | Inspect Bengali output | "Bengali — Native generation" label |
| 5 | Reject a post | Feedback input → AI regeneration with different output |
| 6 | Try scheduling before approval | System blocks with error |
| 7 | Approve and schedule | Status transitions visible in real time |
| 8 | Trigger adapter rejection | Invalid aspect ratio → ❌ REJECTED with reason |
| 9 | Publish a valid post | Mock publish → stable external ID (e.g. `IG_001`) |
| 10 | View metrics | Deterministic performance data per published post |
| 11 | Compare like-for-like | Concept grouping across platforms |
| 12 | Generate AI insights | Strategic analysis citing source post IDs |
| 13 | Generate weekly report | Executive summary with cited evidence |
| 14 | Create next brief | Pre-filled from insight → edit → generate → **loop closes** |

---

## Project Structure

```
content-pulse/
├── app/
│   ├── layout.tsx                    # Root layout (Geist fonts, dark mode)
│   ├── page.tsx                      # Command Center
│   ├── globals.css                   # Global styles
│   ├── icon.png                      # Favicon
│   ├── login/page.tsx                # Google OAuth login
│   ├── studio/page.tsx               # Generative Studio (794 lines)
│   ├── approval/page.tsx             # Approval Queue (555 lines)
│   ├── publisher/page.tsx            # Publisher Pipeline (606 lines)
│   ├── analytics/page.tsx            # Analytics Dashboard (310 lines)
│   ├── insights/page.tsx             # AI Insights (303 lines)
│   ├── reports/page.tsx              # Executive Reports (268 lines)
│   ├── auth/callback/route.ts        # OAuth callback handler
│   └── api/
│       ├── campaigns/                # Campaign CRUD + commit
│       ├── generate/route.ts         # Campaign generation
│       ├── creative/                 # Image generation + storage
│       ├── posts/[id]/               # approve, reject, retry, schedule, publish
│       ├── metrics/                  # Metrics read + ingest
│       ├── insights/                 # Insights read + generate
│       ├── reports/                  # Reports read + generate
│       ├── briefs/from-insight/      # Insight → next brief
│       ├── analyze/route.ts          # Legacy video analysis (preserved)
│       └── _lib.ts                   # Shared API utilities
├── components/
│   ├── contentpulse-shell.tsx        # App shell wrapper
│   ├── contentpulse-nav.tsx          # Sidebar navigation
│   ├── contentpulse-ui.tsx           # Shared UI components
│   ├── google-login.tsx              # Google OAuth button
│   ├── logout-button.tsx             # Logout action
│   └── token-exhausted-dialog.tsx    # HF quota exhaustion modal
├── utils/
│   ├── contentpulse/
│   │   ├── types.ts                  # Domain type definitions
│   │   ├── state-machine.ts          # Post lifecycle state machine
│   │   ├── platform-profiles.ts      # Platform specs & constraints
│   │   ├── repository.ts             # Supabase persistence layer
│   │   ├── store.ts                  # In-memory fallback store
│   │   ├── normalize.ts              # Output normalization
│   │   ├── demo-data.ts              # Demo fixtures
│   │   ├── analysis-schema.ts        # Zod validation schemas
│   │   ├── adapters/                 # Platform validation (IG, YT, FB)
│   │   └── prompts/                  # AI prompt templates per task
│   ├── ai/
│   │   ├── gemini-gateway.ts         # Gemini API with model fallback
│   │   ├── model-registry.ts         # Multi-tier model routing
│   │   ├── huggingface-gateway.ts    # HF image generation with fallback
│   │   └── local-creative-library.ts # SVG fallback asset mapping
│   └── supabase/
│       ├── server.ts                 # Server-side Supabase client
│       └── client.ts                 # Browser-side Supabase client
├── public/
│   ├── creative-library/             # Platform SVG fallback assets
│   └── HoiChoi Logo.png             # Hoichoi logo
├── supabase/
│   └── schema.sql                    # Full database schema + RLS policies
├── system-design.md                  # Complete system design document
├── AGENTS.md                         # AI agent development guide
├── CLAUDE.md                         # Claude developer quick reference
└── README.md                         # This file
```

---

## Known Limitations

| Area | Limitation |
|------|-----------|
| **Publishing** | All publishing is mock — no real Instagram/YouTube/Facebook API integration |
| **Metrics** | Performance data is deterministic simulation, not from real social platforms |
| **Image Quotas** | Hugging Face free tier has token limits; falls back to local SVG library |
| **Real-time Updates** | Dashboard refreshes on navigation, not via WebSocket/SSE |
| **Multi-user** | RLS is implemented but multi-user workflows aren't tested at scale |

---

## Built With

**Next.js** · **React** · **TypeScript** · **Tailwind CSS** · **Supabase** · **Google Gemini** · **Hugging Face**

Built in a 12-hour hackathon. Debugged under greater pressure. Powered by a questionable amount of caffeine.

---

## License

Built for the Hoichoi AI Builders Hackathon '26. See repository for license details.

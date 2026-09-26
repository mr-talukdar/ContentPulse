-- ContentPulse demo schema.
-- Apply this in the existing Supabase SQL editor before enabling live persistence.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  video_name text not null check (char_length(video_name) between 1 and 255),
  video_uri text,
  created_at timestamptz not null default now()
);

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  analysis_json jsonb not null,
  model text not null check (char_length(model) between 1 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null check (char_length(content) between 1 and 20000),
  created_at timestamptz not null default now()
);

create index if not exists analyses_project_id_created_at_idx
  on public.analyses (project_id, created_at desc);

create index if not exists chat_messages_project_id_created_at_idx
  on public.chat_messages (project_id, created_at);

alter table public.projects enable row level security;
alter table public.analyses enable row level security;
alter table public.chat_messages enable row level security;

-- Demo-only policies. Replace these with ownership policies before production use.
drop policy if exists "demo projects readable" on public.projects;
drop policy if exists "demo projects insertable" on public.projects;
drop policy if exists "demo analyses readable" on public.analyses;
drop policy if exists "demo analyses insertable" on public.analyses;
drop policy if exists "demo chat readable" on public.chat_messages;
drop policy if exists "demo chat insertable" on public.chat_messages;

create policy "demo projects readable"
  on public.projects for select to anon, authenticated using (true);
create policy "demo projects insertable"
  on public.projects for insert to anon, authenticated with check (true);

create policy "demo analyses readable"
  on public.analyses for select to anon, authenticated using (true);
create policy "demo analyses insertable"
  on public.analyses for insert to anon, authenticated with check (true);

create policy "demo chat readable"
  on public.chat_messages for select to anon, authenticated using (true);
create policy "demo chat insertable"
  on public.chat_messages for insert to anon, authenticated with check (true);

grant select, insert on public.projects to anon, authenticated;
grant select, insert on public.analyses to anon, authenticated;
grant select, insert on public.chat_messages to anon, authenticated;

-- Problem 3: AI content operations tables. These IDs stay human-readable for demo traceability.
create table if not exists public.campaigns (
  id text primary key,
  name text not null check (char_length(name) between 1 and 200),
  brief jsonb not null,
  owner_id uuid references auth.users(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.campaign_concepts (
  id text primary key,
  campaign_id text not null references public.campaigns(id) on delete cascade,
  concept_name text not null,
  concept_description text not null,
  strategic_intent text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id text primary key,
  campaign_id text not null references public.campaigns(id) on delete cascade,
  concept_id text not null references public.campaign_concepts(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'youtube', 'facebook')),
  language text not null check (language in ('bn', 'en')),
  caption text not null,
  title text,
  cta text not null,
  hashtags text[] not null default '{}',
  creative_url text,
  creative_prompt text,
  aspect_ratio text not null,
  model text,
  rationale text,
  rejection_reason text,
  status text not null default 'draft' check (status in ('draft','generating','review','rejected','approved','scheduled','published')),
  external_post_id text,
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.post_metrics (
  id text primary key,
  post_id text not null references public.posts(id) on delete cascade,
  impressions integer not null default 0 check (impressions >= 0),
  reach integer check (reach is null or reach >= 0),
  views integer check (views is null or views >= 0),
  likes integer not null default 0 check (likes >= 0),
  comments integer not null default 0 check (comments >= 0),
  shares integer not null default 0 check (shares >= 0),
  saves integer check (saves is null or saves >= 0),
  engagement_rate numeric(5,4) not null default 0 check (engagement_rate between 0 and 1),
  created_at timestamptz not null default now()
);

create table if not exists public.insights (
  id text primary key,
  campaign_id text not null references public.campaigns(id) on delete cascade,
  type text not null check (type in ('strong','weak','platform','language','creative','recommendation')),
  claim text not null,
  recommendation text not null,
  source_post_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id text primary key,
  owner_id uuid references auth.users(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  content jsonb not null,
  source_post_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists campaigns_status_idx on public.campaigns(status);
create index if not exists campaign_concepts_campaign_id_idx on public.campaign_concepts(campaign_id);
create index if not exists posts_campaign_id_idx on public.posts(campaign_id);
create index if not exists posts_concept_id_idx on public.posts(concept_id);
create index if not exists posts_status_idx on public.posts(status);
create index if not exists post_metrics_post_id_created_at_idx on public.post_metrics(post_id, created_at desc);
create index if not exists insights_campaign_id_idx on public.insights(campaign_id);

alter table public.campaigns enable row level security;
alter table public.campaign_concepts enable row level security;
alter table public.posts enable row level security;
alter table public.post_metrics enable row level security;
alter table public.insights enable row level security;
alter table public.reports enable row level security;

alter table public.campaigns add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.reports add column if not exists owner_id uuid references auth.users(id) on delete cascade;

drop policy if exists "demo campaigns readable" on public.campaigns;
drop policy if exists "demo campaigns writable" on public.campaigns;
drop policy if exists "demo concepts readable" on public.campaign_concepts;
drop policy if exists "demo concepts writable" on public.campaign_concepts;
drop policy if exists "demo posts readable" on public.posts;
drop policy if exists "demo posts writable" on public.posts;
drop policy if exists "demo metrics readable" on public.post_metrics;
drop policy if exists "demo metrics writable" on public.post_metrics;
drop policy if exists "demo insights readable" on public.insights;
drop policy if exists "demo insights writable" on public.insights;
drop policy if exists "demo reports readable" on public.reports;
drop policy if exists "demo reports writable" on public.reports;
drop policy if exists "campaigns owner readable" on public.campaigns;
drop policy if exists "campaigns owner writable" on public.campaigns;
drop policy if exists "demo campaigns insertable" on public.campaigns;
drop policy if exists "concepts owner readable" on public.campaign_concepts;
drop policy if exists "concepts owner writable" on public.campaign_concepts;
drop policy if exists "posts owner readable" on public.posts;
drop policy if exists "posts owner writable" on public.posts;
drop policy if exists "metrics owner readable" on public.post_metrics;
drop policy if exists "metrics owner writable" on public.post_metrics;
drop policy if exists "insights owner readable" on public.insights;
drop policy if exists "insights owner writable" on public.insights;
drop policy if exists "reports owner readable" on public.reports;
drop policy if exists "reports owner writable" on public.reports;

create policy "campaigns owner readable" on public.campaigns for select to anon, authenticated using (owner_id is null or owner_id::text = (select auth.uid())::text);
create policy "campaigns owner writable" on public.campaigns for all to authenticated using (owner_id::text = (select auth.uid())::text) with check (owner_id::text = (select auth.uid())::text);
create policy "demo campaigns insertable" on public.campaigns for insert to anon with check (owner_id is null);
create policy "concepts owner readable" on public.campaign_concepts for select to anon, authenticated using (exists (select 1 from public.campaigns c where c.id = campaign_id and (c.owner_id is null or c.owner_id::text = (select auth.uid())::text)));
create policy "concepts owner writable" on public.campaign_concepts for all to authenticated using (exists (select 1 from public.campaigns c where c.id = campaign_id and c.owner_id::text = (select auth.uid())::text)) with check (exists (select 1 from public.campaigns c where c.id = campaign_id and c.owner_id::text = (select auth.uid())::text));
create policy "posts owner readable" on public.posts for select to anon, authenticated using (exists (select 1 from public.campaigns c where c.id = campaign_id and (c.owner_id is null or c.owner_id::text = (select auth.uid())::text)));
create policy "posts owner writable" on public.posts for all to authenticated using (exists (select 1 from public.campaigns c where c.id = campaign_id and c.owner_id::text = (select auth.uid())::text)) with check (exists (select 1 from public.campaigns c where c.id = campaign_id and c.owner_id::text = (select auth.uid())::text));
create policy "metrics owner readable" on public.post_metrics for select to anon, authenticated using (exists (select 1 from public.posts p join public.campaigns c on c.id = p.campaign_id where p.id = post_id and (c.owner_id is null or c.owner_id::text = (select auth.uid())::text)));
create policy "metrics owner writable" on public.post_metrics for all to authenticated using (exists (select 1 from public.posts p join public.campaigns c on c.id = p.campaign_id where p.id = post_id and c.owner_id::text = (select auth.uid())::text)) with check (exists (select 1 from public.posts p join public.campaigns c on c.id = p.campaign_id where p.id = post_id and c.owner_id::text = (select auth.uid())::text));
create policy "insights owner readable" on public.insights for select to anon, authenticated using (exists (select 1 from public.campaigns c where c.id = campaign_id and (c.owner_id is null or c.owner_id::text = (select auth.uid())::text)));
create policy "insights owner writable" on public.insights for all to authenticated using (exists (select 1 from public.campaigns c where c.id = campaign_id and c.owner_id::text = (select auth.uid())::text)) with check (exists (select 1 from public.campaigns c where c.id = campaign_id and c.owner_id::text = (select auth.uid())::text));
create policy "reports owner readable" on public.reports for select to anon, authenticated using (owner_id is null or owner_id::text = (select auth.uid())::text);
create policy "reports owner writable" on public.reports for all to authenticated using (owner_id::text = (select auth.uid())::text) with check (owner_id::text = (select auth.uid())::text);

grant select, insert, update, delete on public.campaigns, public.campaign_concepts, public.posts, public.post_metrics, public.insights, public.reports to anon, authenticated;

-- Generated creative assets. The bucket is public so post previews can use stable public URLs.
insert into storage.buckets (id, name, public)
values ('contentpulse-media', 'contentpulse-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "contentpulse media uploads" on storage.objects;
drop policy if exists "contentpulse media updates" on storage.objects;
drop policy if exists "contentpulse media reads" on storage.objects;

create policy "contentpulse media uploads"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'contentpulse-media' and (storage.foldername(name))[1] = 'creatives');

create policy "contentpulse media updates"
  on storage.objects for update to authenticated
  using (bucket_id = 'contentpulse-media' and owner_id::text = (select auth.uid())::text)
  with check (bucket_id = 'contentpulse-media' and owner_id::text = (select auth.uid())::text);

create policy "contentpulse media reads"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'contentpulse-media');

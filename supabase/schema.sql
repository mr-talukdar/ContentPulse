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

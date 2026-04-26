create extension if not exists "pgcrypto";

create table if not exists public.mastery_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  taxonomy_node_id uuid not null references public.taxonomy_nodes(id) on delete cascade,
  score double precision not null default 0 check (score >= 0 and score <= 100),
  confidence double precision not null default 0 check (confidence >= 0 and confidence <= 1),
  attempts_count integer not null default 0,
  last_attempted_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, taxonomy_node_id)
);

create table if not exists public.skill_mastery_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reasoning_skill_id uuid not null references public.reasoning_skills(id) on delete cascade,
  score double precision not null default 0 check (score >= 0 and score <= 100),
  confidence double precision not null default 0 check (confidence >= 0 and confidence <= 1),
  attempts_count integer not null default 0,
  last_attempted_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, reasoning_skill_id)
);

create index if not exists mastery_scores_user_idx on public.mastery_scores(user_id);
create index if not exists mastery_scores_taxonomy_idx on public.mastery_scores(taxonomy_node_id);
create index if not exists skill_mastery_scores_user_idx on public.skill_mastery_scores(user_id);

alter table public.mastery_scores enable row level security;
alter table public.skill_mastery_scores enable row level security;

drop policy if exists "Users can read their mastery scores" on public.mastery_scores;
create policy "Users can read their mastery scores"
on public.mastery_scores for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their mastery scores" on public.mastery_scores;
create policy "Users can insert their mastery scores"
on public.mastery_scores for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their mastery scores" on public.mastery_scores;
create policy "Users can update their mastery scores"
on public.mastery_scores for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read their skill mastery scores" on public.skill_mastery_scores;
create policy "Users can read their skill mastery scores"
on public.skill_mastery_scores for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their skill mastery scores" on public.skill_mastery_scores;
create policy "Users can insert their skill mastery scores"
on public.skill_mastery_scores for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their skill mastery scores" on public.skill_mastery_scores;
create policy "Users can update their skill mastery scores"
on public.skill_mastery_scores for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update, delete on public.mastery_scores to authenticated, service_role;
grant select, insert, update, delete on public.skill_mastery_scores to authenticated, service_role;

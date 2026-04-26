create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  target_test_date date,
  target_score int check (target_score between 472 and 528),
  hours_per_week int default 20 check (hours_per_week between 1 and 100),
  prior_attempt bool default false,
  onboarded_at timestamptz,
  role text default 'student' check (role in ('student','admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.taxonomy_nodes (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.taxonomy_nodes(id) on delete cascade,
  level text check (level in ('section','foundation','category','topic','subtopic')),
  code text unique,
  name text not null,
  description text,
  section text,
  sort_order int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.reasoning_skills (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists taxonomy_nodes_parent_idx on public.taxonomy_nodes(parent_id);
create index if not exists taxonomy_nodes_code_idx on public.taxonomy_nodes(code);
create index if not exists taxonomy_nodes_section_idx on public.taxonomy_nodes(section);

alter table public.profiles enable row level security;
alter table public.taxonomy_nodes enable row level security;
alter table public.reasoning_skills enable row level security;

drop policy if exists "Users can read their profile" on public.profiles;
drop policy if exists "Users can insert their profile" on public.profiles;
drop policy if exists "Users can update their profile" on public.profiles;
drop policy if exists "Users can delete their profile" on public.profiles;

create policy "Users can read their profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert their profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can delete their profile" on public.profiles
  for delete using (auth.uid() = id);

drop policy if exists "Anyone authenticated can read taxonomy" on public.taxonomy_nodes;
drop policy if exists "Anyone authenticated can read reasoning skills" on public.reasoning_skills;

create policy "Anyone authenticated can read taxonomy" on public.taxonomy_nodes
  for select using (auth.role() = 'authenticated');

create policy "Anyone authenticated can read reasoning skills" on public.reasoning_skills
  for select using (auth.role() = 'authenticated');

grant select on public.taxonomy_nodes to authenticated;
grant select on public.reasoning_skills to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;

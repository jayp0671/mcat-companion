create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  stem text not null,
  passage text,
  format text not null default 'discrete' check (format in ('discrete','passage')),
  section text not null check (section in ('chem_phys','cars','bio_biochem','psych_soc')),
  content_category_id uuid references public.taxonomy_nodes(id) on delete set null,
  topic_id uuid references public.taxonomy_nodes(id) on delete set null,
  subtopic_id uuid references public.taxonomy_nodes(id) on delete set null,
  difficulty int not null default 3 check (difficulty between 1 and 5),
  source_type text not null default 'mistake_log' check (source_type in ('mistake_log','ai_generated','hand_written')),
  source_material text,
  review_status text not null default 'approved' check (review_status in ('pending','approved','rejected')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.questions add column if not exists stem text;
alter table public.questions add column if not exists passage text;
alter table public.questions add column if not exists format text not null default 'discrete';
alter table public.questions add column if not exists section text;
alter table public.questions add column if not exists content_category_id uuid references public.taxonomy_nodes(id) on delete set null;
alter table public.questions add column if not exists topic_id uuid references public.taxonomy_nodes(id) on delete set null;
alter table public.questions add column if not exists subtopic_id uuid references public.taxonomy_nodes(id) on delete set null;
alter table public.questions add column if not exists difficulty int not null default 3;
alter table public.questions add column if not exists source_type text not null default 'mistake_log';
alter table public.questions add column if not exists source_material text;
alter table public.questions add column if not exists review_status text not null default 'approved';
alter table public.questions add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.questions add column if not exists created_at timestamptz not null default now();
alter table public.questions add column if not exists updated_at timestamptz not null default now();

create index if not exists questions_section_review_status_idx on public.questions(section, review_status);
create index if not exists questions_topic_id_idx on public.questions(topic_id);
create index if not exists questions_source_type_idx on public.questions(source_type);
create index if not exists questions_created_by_idx on public.questions(created_by);

drop trigger if exists questions_set_updated_at on public.questions;
create trigger questions_set_updated_at
before update on public.questions
for each row execute function public.set_updated_at();

create table if not exists public.question_choices (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  label text not null check (label in ('A','B','C','D')),
  text text not null,
  is_correct bool not null default false,
  position int not null default 0,
  created_at timestamptz not null default now(),
  unique(question_id, label)
);

create index if not exists question_choices_question_id_idx on public.question_choices(question_id);

create table if not exists public.question_skills (
  question_id uuid not null references public.questions(id) on delete cascade,
  skill_id uuid not null references public.reasoning_skills(id) on delete cascade,
  primary key (question_id, skill_id)
);

create index if not exists question_skills_skill_id_idx on public.question_skills(skill_id);

create table if not exists public.mistake_log_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  her_selected_answer text not null,
  correct_answer text not null,
  her_confidence int check (her_confidence between 1 and 5),
  time_spent_seconds int check (time_spent_seconds >= 0),
  notes text,
  logged_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mistake_log_entries_user_logged_idx on public.mistake_log_entries(user_id, logged_at desc);
create index if not exists mistake_log_entries_question_id_idx on public.mistake_log_entries(question_id);

drop trigger if exists mistake_log_entries_set_updated_at on public.mistake_log_entries;
create trigger mistake_log_entries_set_updated_at
before update on public.mistake_log_entries
for each row execute function public.set_updated_at();

alter table public.questions enable row level security;
alter table public.question_choices enable row level security;
alter table public.question_skills enable row level security;
alter table public.mistake_log_entries enable row level security;

drop policy if exists "Users can read own questions and approved questions" on public.questions;
create policy "Users can read own questions and approved questions"
on public.questions for select
to authenticated
using (created_by = auth.uid() or review_status = 'approved');

drop policy if exists "Users can insert own mistake questions" on public.questions;
create policy "Users can insert own mistake questions"
on public.questions for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists "Users can update own questions" on public.questions;
create policy "Users can update own questions"
on public.questions for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

drop policy if exists "Users can delete own questions" on public.questions;
create policy "Users can delete own questions"
on public.questions for delete
to authenticated
using (created_by = auth.uid());

drop policy if exists "Users can read choices for visible questions" on public.question_choices;
create policy "Users can read choices for visible questions"
on public.question_choices for select
to authenticated
using (
  exists (
    select 1 from public.questions q
    where q.id = question_choices.question_id
      and (q.created_by = auth.uid() or q.review_status = 'approved')
  )
);

drop policy if exists "Users can insert choices for own questions" on public.question_choices;
create policy "Users can insert choices for own questions"
on public.question_choices for insert
to authenticated
with check (
  exists (
    select 1 from public.questions q
    where q.id = question_choices.question_id
      and q.created_by = auth.uid()
  )
);

drop policy if exists "Users can update choices for own questions" on public.question_choices;
create policy "Users can update choices for own questions"
on public.question_choices for update
to authenticated
using (
  exists (
    select 1 from public.questions q
    where q.id = question_choices.question_id
      and q.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.questions q
    where q.id = question_choices.question_id
      and q.created_by = auth.uid()
  )
);

drop policy if exists "Users can delete choices for own questions" on public.question_choices;
create policy "Users can delete choices for own questions"
on public.question_choices for delete
to authenticated
using (
  exists (
    select 1 from public.questions q
    where q.id = question_choices.question_id
      and q.created_by = auth.uid()
  )
);

drop policy if exists "Users can read skills for visible questions" on public.question_skills;
create policy "Users can read skills for visible questions"
on public.question_skills for select
to authenticated
using (
  exists (
    select 1 from public.questions q
    where q.id = question_skills.question_id
      and (q.created_by = auth.uid() or q.review_status = 'approved')
  )
);

drop policy if exists "Users can insert skills for own questions" on public.question_skills;
create policy "Users can insert skills for own questions"
on public.question_skills for insert
to authenticated
with check (
  exists (
    select 1 from public.questions q
    where q.id = question_skills.question_id
      and q.created_by = auth.uid()
  )
);

drop policy if exists "Users can delete skills for own questions" on public.question_skills;
create policy "Users can delete skills for own questions"
on public.question_skills for delete
to authenticated
using (
  exists (
    select 1 from public.questions q
    where q.id = question_skills.question_id
      and q.created_by = auth.uid()
  )
);

drop policy if exists "Users can read own mistake log entries" on public.mistake_log_entries;
create policy "Users can read own mistake log entries"
on public.mistake_log_entries for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert own mistake log entries" on public.mistake_log_entries;
create policy "Users can insert own mistake log entries"
on public.mistake_log_entries for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update own mistake log entries" on public.mistake_log_entries;
create policy "Users can update own mistake log entries"
on public.mistake_log_entries for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete own mistake log entries" on public.mistake_log_entries;
create policy "Users can delete own mistake log entries"
on public.mistake_log_entries for delete
to authenticated
using (user_id = auth.uid());

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on public.questions to authenticated, service_role;
grant select, insert, update, delete on public.question_choices to authenticated, service_role;
grant select, insert, update, delete on public.question_skills to authenticated, service_role;
grant select, insert, update, delete on public.mistake_log_entries to authenticated, service_role;

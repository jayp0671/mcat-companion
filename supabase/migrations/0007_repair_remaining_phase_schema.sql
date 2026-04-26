-- Repair migration for remaining phases.
-- This is intentionally additive/idempotent because some tables existed before Phase 5-9
-- and `create table if not exists` does not add newly expected columns.

alter table public.question_explanations
  add column if not exists common_misconception text;

alter table public.question_explanations
  add column if not exists model_used text;

alter table public.question_explanations
  add column if not exists prompt_version text;

alter table public.question_explanations
  add column if not exists generated_at timestamptz not null default now();

create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('explanation','question','classification','diagnosis','plan','recommendation')),
  provider text,
  model text,
  prompt_version text,
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  cost_estimate_usd numeric(10,6),
  latency_ms integer,
  status text not null default 'success' check (status in ('success','error')),
  error_message text,
  linked_entity_id uuid,
  created_at timestamptz not null default now()
);

alter table public.ai_generations enable row level security;

drop policy if exists "Authenticated can read ai generations" on public.ai_generations;
create policy "Authenticated can read ai generations" on public.ai_generations
  for select to authenticated using (true);

drop policy if exists "Authenticated can insert ai generations" on public.ai_generations;
create policy "Authenticated can insert ai generations" on public.ai_generations
  for insert to authenticated with check (true);

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.question_explanations to authenticated, service_role;
grant select, insert, update, delete on public.ai_generations to authenticated, service_role;

-- Keep remaining phase tables reproducible if this repair migration is applied to a fresh/scratch DB
-- after a partial manual repair.
grant select, insert, update, delete on public.diagnosis_reports to authenticated, service_role;
grant select, insert, update, delete on public.recommendations to authenticated, service_role;
grant select, insert, update, delete on public.study_plans to authenticated, service_role;
grant select, insert, update, delete on public.practice_sessions to authenticated, service_role;
grant select, insert, update, delete on public.session_questions to authenticated, service_role;
grant select, insert, update, delete on public.student_answers to authenticated, service_role;
grant select, insert, update, delete on public.mistake_tags to authenticated, service_role;

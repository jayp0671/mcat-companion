create extension if not exists "pgcrypto";

create table if not exists public.question_explanations (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null unique references public.questions(id) on delete cascade,
  correct_explanation text not null,
  distractor_explanations jsonb not null default '{}'::jsonb,
  key_concept text not null,
  common_misconception text,
  generated_by text not null default 'ai' check (generated_by in ('ai','human')),
  model_used text,
  prompt_version text,
  generated_at timestamptz not null default now()
);

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

create table if not exists public.diagnosis_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generated_at timestamptz not null default now(),
  period_start date not null,
  period_end date not null,
  patterns jsonb not null default '[]'::jsonb,
  summary text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generated_at timestamptz not null default now(),
  items jsonb not null default '[]'::jsonb,
  rationale text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generated_at timestamptz not null default now(),
  valid_from date not null,
  valid_until date not null,
  params jsonb not null default '{}'::jsonb,
  plan_data jsonb not null default '{}'::jsonb,
  is_active bool not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null default 'mixed' check (mode in ('topic','weakness','mixed','diagnostic')),
  params jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  total_questions int not null default 0,
  correct_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.session_questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.practice_sessions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  position int not null,
  served_at timestamptz,
  unique(session_id, question_id)
);

create table if not exists public.student_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.practice_sessions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_choice_id uuid references public.question_choices(id) on delete set null,
  selected_label text,
  is_correct bool not null default false,
  time_spent_ms int,
  confidence int check (confidence between 1 and 5),
  flagged_for_review bool not null default false,
  answered_at timestamptz not null default now()
);

create table if not exists public.mistake_tags (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid references public.student_answers(id) on delete cascade,
  tag_type text not null check (tag_type in ('content_gap','reasoning_error','careless','timing')),
  tag_value text not null,
  source text not null default 'auto' check (source in ('auto','ai','student')),
  created_at timestamptz not null default now()
);

create index if not exists question_explanations_question_idx on public.question_explanations(question_id);
create index if not exists ai_generations_kind_idx on public.ai_generations(kind, created_at desc);
create index if not exists diagnosis_reports_user_idx on public.diagnosis_reports(user_id, generated_at desc);
create index if not exists recommendations_user_idx on public.recommendations(user_id, generated_at desc);
create index if not exists study_plans_user_active_idx on public.study_plans(user_id, is_active);
create index if not exists practice_sessions_user_idx on public.practice_sessions(user_id, started_at desc);
create index if not exists session_questions_session_idx on public.session_questions(session_id, position);
create index if not exists student_answers_user_idx on public.student_answers(user_id, answered_at desc);
create index if not exists student_answers_session_idx on public.student_answers(session_id);

alter table public.question_explanations enable row level security;
alter table public.ai_generations enable row level security;
alter table public.diagnosis_reports enable row level security;
alter table public.recommendations enable row level security;
alter table public.study_plans enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.session_questions enable row level security;
alter table public.student_answers enable row level security;
alter table public.mistake_tags enable row level security;

drop policy if exists "Users can read explanations for visible questions" on public.question_explanations;
create policy "Users can read explanations for visible questions" on public.question_explanations for select to authenticated using (
  exists (select 1 from public.questions q where q.id = question_explanations.question_id and (q.created_by = auth.uid() or q.review_status = 'approved'))
);
drop policy if exists "Users can insert explanations for visible questions" on public.question_explanations;
create policy "Users can insert explanations for visible questions" on public.question_explanations for insert to authenticated with check (
  exists (select 1 from public.questions q where q.id = question_explanations.question_id and (q.created_by = auth.uid() or q.review_status = 'approved'))
);

drop policy if exists "Authenticated can read ai generations" on public.ai_generations;
create policy "Authenticated can read ai generations" on public.ai_generations for select to authenticated using (true);
drop policy if exists "Authenticated can insert ai generations" on public.ai_generations;
create policy "Authenticated can insert ai generations" on public.ai_generations for insert to authenticated with check (true);

drop policy if exists "Users can read own diagnosis reports" on public.diagnosis_reports;
create policy "Users can read own diagnosis reports" on public.diagnosis_reports for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users can insert own diagnosis reports" on public.diagnosis_reports;
create policy "Users can insert own diagnosis reports" on public.diagnosis_reports for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "Users can read own recommendations" on public.recommendations;
create policy "Users can read own recommendations" on public.recommendations for select to authenticated using (user_id = auth.uid());
drop policy if exists "Users can insert own recommendations" on public.recommendations;
create policy "Users can insert own recommendations" on public.recommendations for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "Users can manage own study plans" on public.study_plans;
create policy "Users can manage own study plans" on public.study_plans for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Users can manage own practice sessions" on public.practice_sessions;
create policy "Users can manage own practice sessions" on public.practice_sessions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Users can read own session questions" on public.session_questions;
create policy "Users can read own session questions" on public.session_questions for select to authenticated using (
  exists (select 1 from public.practice_sessions ps where ps.id = session_questions.session_id and ps.user_id = auth.uid())
);
drop policy if exists "Users can insert own session questions" on public.session_questions;
create policy "Users can insert own session questions" on public.session_questions for insert to authenticated with check (
  exists (select 1 from public.practice_sessions ps where ps.id = session_questions.session_id and ps.user_id = auth.uid())
);

drop policy if exists "Users can manage own answers" on public.student_answers;
create policy "Users can manage own answers" on public.student_answers for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Users can read own mistake tags" on public.mistake_tags;
create policy "Users can read own mistake tags" on public.mistake_tags for select to authenticated using (
  exists (select 1 from public.student_answers sa where sa.id = mistake_tags.answer_id and sa.user_id = auth.uid())
);
drop policy if exists "Users can insert own mistake tags" on public.mistake_tags;
create policy "Users can insert own mistake tags" on public.mistake_tags for insert to authenticated with check (
  exists (select 1 from public.student_answers sa where sa.id = mistake_tags.answer_id and sa.user_id = auth.uid())
);

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.question_explanations to authenticated, service_role;
grant select, insert, update, delete on public.ai_generations to authenticated, service_role;
grant select, insert, update, delete on public.diagnosis_reports to authenticated, service_role;
grant select, insert, update, delete on public.recommendations to authenticated, service_role;
grant select, insert, update, delete on public.study_plans to authenticated, service_role;
grant select, insert, update, delete on public.practice_sessions to authenticated, service_role;
grant select, insert, update, delete on public.session_questions to authenticated, service_role;
grant select, insert, update, delete on public.student_answers to authenticated, service_role;
grant select, insert, update, delete on public.mistake_tags to authenticated, service_role;

create extension if not exists "uuid-ossp";
create extension if not exists vector;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  target_test_date date,
  target_score int,
  hours_per_week int default 20,
  prior_attempt bool default false,
  onboarded_at timestamptz,
  role text default 'student' check (role in ('student','admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.taxonomy_nodes (
  id uuid primary key default uuid_generate_v4(),
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
create index if not exists taxonomy_nodes_parent_idx on public.taxonomy_nodes(parent_id);
create index if not exists taxonomy_nodes_code_idx on public.taxonomy_nodes(code);
create index if not exists taxonomy_nodes_section_idx on public.taxonomy_nodes(section);

create table if not exists public.reasoning_skills (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.questions (
  id uuid primary key default uuid_generate_v4(),
  stem text not null,
  passage text,
  format text check (format in ('discrete','passage')) default 'discrete',
  section text not null,
  content_category_id uuid references public.taxonomy_nodes(id),
  topic_id uuid references public.taxonomy_nodes(id),
  subtopic_id uuid references public.taxonomy_nodes(id),
  difficulty int check (difficulty between 1 and 5) default 3,
  source_type text check (source_type in ('mistake_log','ai_generated','hand_written')) not null,
  source_material text,
  review_status text default 'approved' check (review_status in ('pending','approved','rejected')),
  embedding vector(1024),
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists questions_section_review_idx on public.questions(section, review_status);
create index if not exists questions_topic_idx on public.questions(topic_id);
create index if not exists questions_source_type_idx on public.questions(source_type);

create table if not exists public.question_choices (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid references public.questions(id) on delete cascade,
  label text check (label in ('A','B','C','D')),
  text text not null,
  is_correct bool default false,
  position int,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(question_id, label)
);

create table if not exists public.question_skills (
  question_id uuid references public.questions(id) on delete cascade,
  skill_id uuid references public.reasoning_skills(id) on delete cascade,
  primary key (question_id, skill_id)
);

create table if not exists public.question_explanations (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid unique references public.questions(id) on delete cascade,
  correct_explanation text,
  distractor_explanations jsonb,
  key_concept text,
  generated_by text check (generated_by in ('ai','human')) default 'ai',
  model_used text,
  prompt_version text,
  generated_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.mistake_log_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade,
  her_selected_answer text,
  correct_answer text,
  her_confidence int check (her_confidence between 1 and 5),
  time_spent_seconds int,
  notes text,
  logged_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists mistake_log_entries_user_logged_idx on public.mistake_log_entries(user_id, logged_at desc);

create table if not exists public.practice_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  mode text check (mode in ('topic','weakness','mixed','diagnostic')),
  params jsonb,
  started_at timestamptz default now(),
  ended_at timestamptz,
  total_questions int,
  correct_count int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.session_questions (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.practice_sessions(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade,
  position int,
  served_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.student_answers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id uuid references public.practice_sessions(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade,
  selected_choice_id uuid references public.question_choices(id),
  is_correct bool,
  time_spent_ms int,
  confidence int,
  flagged_for_review bool default false,
  answered_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists student_answers_user_answered_idx on public.student_answers(user_id, answered_at desc);
create index if not exists student_answers_user_question_idx on public.student_answers(user_id, question_id);

create table if not exists public.mistake_tags (
  id uuid primary key default uuid_generate_v4(),
  answer_id uuid references public.student_answers(id) on delete cascade,
  tag_type text check (tag_type in ('content_gap','reasoning_error','careless','timing')),
  tag_value text,
  source text check (source in ('auto','ai','student')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.mastery_scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  taxonomy_node_id uuid references public.taxonomy_nodes(id) on delete cascade,
  score float check (score between 0 and 100),
  confidence float check (confidence between 0 and 1),
  attempts_count int,
  last_attempted_at timestamptz,
  updated_at timestamptz default now(),
  unique(user_id, taxonomy_node_id)
);

create table if not exists public.skill_mastery_scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  reasoning_skill_id uuid references public.reasoning_skills(id) on delete cascade,
  score float check (score between 0 and 100),
  confidence float check (confidence between 0 and 1),
  attempts_count int,
  last_attempted_at timestamptz,
  updated_at timestamptz default now(),
  unique(user_id, reasoning_skill_id)
);

create table if not exists public.study_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  generated_at timestamptz default now(),
  valid_from date,
  valid_until date,
  params jsonb,
  plan_data jsonb,
  is_active bool default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.recommendations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  generated_at timestamptz default now(),
  items jsonb,
  rationale text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.diagnosis_reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  generated_at timestamptz default now(),
  period_start date,
  period_end date,
  patterns jsonb,
  summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.ai_generations (
  id uuid primary key default uuid_generate_v4(),
  kind text check (kind in ('explanation','question','classification','diagnosis','plan','recommendation')),
  provider text,
  model text,
  prompt_version text,
  input jsonb,
  output jsonb,
  cost_estimate_usd numeric(10,6),
  latency_ms int,
  status text,
  error_message text,
  linked_entity_id uuid,
  created_at timestamptz default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid,
  action text,
  entity_type text,
  entity_id uuid,
  diff jsonb,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.mistake_log_entries enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.student_answers enable row level security;
alter table public.study_plans enable row level security;
alter table public.recommendations enable row level security;
alter table public.diagnosis_reports enable row level security;

create policy "Users can read their profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert their profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users own mistake logs" on public.mistake_log_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own practice sessions" on public.practice_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own answers" on public.student_answers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own study plans" on public.study_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own recommendations" on public.recommendations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own diagnosis reports" on public.diagnosis_reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

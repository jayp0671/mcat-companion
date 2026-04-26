# MCAT Companion

A personal MCAT prep companion focused on mistake logging, pattern diagnosis, AI explanations, and low-cost reliability.

This scaffold follows the implementation plan: a single Next.js App Router project with Supabase, NVIDIA NIM-ready AI provider abstraction, prompt files, taxonomy files, migrations, tests, and operational docs.

## What this scaffold includes

- Next.js 14 App Router + TypeScript + Tailwind
- Planned app routes for dashboard, mistake logging, practice, plan, diagnose, settings, and admin
- API route placeholders matching the implementation plan
- Supabase server/browser/admin helpers
- Initial SQL migration for the planned schema and RLS policies
- AI provider abstraction with mock, NVIDIA, and Anthropic providers
- Prompt YAML files with guardrails
- MVP taxonomy YAML files
- Pure mastery/recommendation service functions with unit tests
- Playwright smoke tests
- GitHub Actions CI and nightly backup placeholder workflow

## First local run

```powershell
pnpm install
copy .env.example .env.local
pnpm dev
```

Open http://localhost:3000.

## Recommended first commit after unzipping

```powershell
git status
git add .
git commit -m "Scaffold initial MCAT Companion app"
git push -u origin scaffold/initial-app
```

## Build order after scaffold

1. Fill `.env.local` with Supabase values.
2. Run the initial migration in Supabase.
3. Implement magic link auth.
4. Implement profile onboarding.
5. Implement real mistake CRUD.
6. Only then wire NVIDIA explanations.

## Product safety stance

This app complements real MCAT prep materials. It does not replace AAMC, UWorld, Anki, or official explanations. Any AI-generated content should remain clearly labeled and should be cross-checked when possible.

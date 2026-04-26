# Phase 5-9 Smoke Test Notes

## Explanation schema repair

If `/api/mistakes/:id/explain` fails with:

`Could not find the 'common_misconception' column of 'question_explanations' in the schema cache`

run:

```powershell
npx supabase db push
```

The repair migration `0007_repair_remaining_phase_schema.sql` adds the missing column idempotently.

## Admin role setup

Admin pages are role-gated with `profiles.role = 'admin'`. After logging in once, run:

```powershell
npx tsx scripts/make_admin.ts YOUR_EMAIL@example.com
```

Then sign out/sign in or refresh the app.

## Expected behavior with LLM_PROVIDER=mock

- Explain this: returns and caches mock explanation text.
- Diagnose: returns a mock diagnosis report.
- Plan: returns a rules-based plan with mock narrative wording.
- Admin generate: only works after your profile has role `admin`.
- Practice: needs approved AI-generated questions. Generate drafts in Admin, approve them in Admin Queue, then start practice.
- Admin logs: stays empty until an AI action writes to `ai_generations`.

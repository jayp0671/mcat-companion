# Operations Runbook

## App down
1. Check Vercel deployment status.
2. Check Supabase status.
3. Check Sentry errors.
4. Roll back recent Vercel deployment if needed.

## AI down
Use cached explanations. The fallback chain should try Anthropic after NVIDIA errors. If failures persist, switch `LLM_PROVIDER=mock` temporarily.

## Data recovery
Nightly backup workflow is scaffolded. Finish `scripts/backup_db.ts`, store secrets in GitHub, and practice restore before relying on the app for daily prep.

# Live AI cleanup

This branch removes runtime mock AI behavior.

## What changed

- `LLM_PROVIDER` now defaults to `nvidia` instead of `mock`.
- `MockProvider` is test-only. It throws outside `NODE_ENV=test`.
- NVIDIA and Anthropic providers no longer fall back to canned output.
- If an AI key is missing or the provider returns malformed JSON, the route fails gracefully and logs the error.
- Admin logs now show `unknown` instead of pretending missing model data is `mock`.

## Local live AI test

Set `.env.local`:

```env
LLM_PROVIDER=nvidia
NVIDIA_API_KEY=your_key
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=meta/llama-3.3-70b-instruct
```

Then test:

1. `/mistakes/[id]` -> regenerate explanation
2. `/diagnose` -> generate diagnosis
3. `/plan` -> regenerate plan
4. `/admin/generate` -> generate 1 draft
5. `/admin/logs` -> confirm provider/model are live values

## Clean old mock rows

Run after setting Supabase env vars:

```powershell
npx tsx scripts/cleanup_mock_data.ts
```

This deletes generated rows containing old mock/test-only text and mock AI generation logs. It does not delete normal mistake-log questions.

# Architecture

Single Next.js App Router project deployed to Vercel. Supabase handles Postgres, Auth, and optional Storage. AI access is abstracted behind `LLMProvider` so NVIDIA NIM, Anthropic, or mock providers can be swapped by env var.

Core flow: user logs a mistake -> app stores question metadata -> dashboard/recommendations update -> optional AI explanation is generated and cached.

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/config";

function requiredEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function createAdminClient() {
  return createSupabaseClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL", env.NEXT_PUBLIC_SUPABASE_URL),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY", env.SUPABASE_SERVICE_ROLE_KEY),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

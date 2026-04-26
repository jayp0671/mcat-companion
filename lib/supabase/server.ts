import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase server env vars. Copy .env.example to .env.local.");
  }
  const cookieStore = cookies();
  return createServerClient(url, key, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value; },
      set(name: string, value: string, options) { cookieStore.set({ name, value, ...options }); },
      remove(name: string, options) { cookieStore.set({ name, value: "", ...options }); }
    }
  });
}

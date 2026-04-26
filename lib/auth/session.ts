import { createClient } from "@/lib/supabase/server";
export async function getUser() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

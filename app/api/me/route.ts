import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const profilePatchSchema = z.object({
  display_name: z.string().min(1).max(120).optional(),
  target_test_date: z.string().optional(),
  target_score: z.coerce.number().int().min(472).max(528).nullable().optional(),
  hours_per_week: z.coerce.number().int().min(1).max(100).optional(),
  prior_attempt: z.boolean().optional(),
});

async function getAuthedClient() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { supabase, user: null };
  }

  return { supabase, user: data.user };
}

export async function GET() {
  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user, profile });
}

export async function PATCH(request: Request) {
  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = profilePatchSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}

export async function DELETE() {
  const { supabase, user } = await getAuthedClient();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("profiles").delete().eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

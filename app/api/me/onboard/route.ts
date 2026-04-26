import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const onboardSchema = z.object({
  display_name: z.string().min(1).max(120),
  target_test_date: z.string().min(8),
  target_score: z.coerce.number().int().min(472).max(528).nullable().optional(),
  hours_per_week: z.coerce.number().int().min(1).max(100),
  prior_attempt: z.boolean().default(false),
});

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = onboardSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid onboarding payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const payload = {
    id: authData.user.id,
    display_name: parsed.data.display_name,
    target_test_date: parsed.data.target_test_date,
    target_score: parsed.data.target_score ?? null,
    hours_per_week: parsed.data.hours_per_week,
    prior_attempt: parsed.data.prior_attempt,
    onboarded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}

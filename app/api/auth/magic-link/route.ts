import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const magicLinkSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = magicLinkSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const origin = request.nextUrl.origin;
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/auth-callback`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

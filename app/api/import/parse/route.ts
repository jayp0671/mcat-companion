import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getProvider } from "@/lib/ai";
import { getAiProviderMetadata } from "@/lib/ai/metadata";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  raw_text: z.string().trim().min(20, "Paste the full copied question/result text."),
  source_material: z.string().trim().max(255).optional().nullable(),
  default_section: z
    .enum(["chem_phys", "cars", "bio_biochem", "psych_soc"])
    .optional()
    .nullable(),
});

function sanitizeForPrompt(text: string) {
  return text.replace(/\u0000/g, "").slice(0, 15000);
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid import payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const aiMetadata = getAiProviderMetadata();
  const startedAt = Date.now();

  const { data: taxonomyNodes, error: taxonomyError } = await supabase
    .from("taxonomy_nodes")
    .select("id,parent_id,level,code,name,section")
    .order("sort_order", { ascending: true });

  if (taxonomyError) {
    return NextResponse.json(
      { error: "Could not load taxonomy", details: taxonomyError.message },
      { status: 500 },
    );
  }

  const { data: reasoningSkills, error: skillsError } = await supabase
    .from("reasoning_skills")
    .select("id,code,name")
    .order("code", { ascending: true });

  if (skillsError) {
    return NextResponse.json(
      { error: "Could not load reasoning skills", details: skillsError.message },
      { status: 500 },
    );
  }

  const providerInput = {
    rawText: sanitizeForPrompt(input.raw_text),
    sourceMaterial: input.source_material ?? null,
    defaultSection: input.default_section ?? undefined,
    taxonomyNodes: (taxonomyNodes ?? []).slice(0, 500),
    reasoningSkills: reasoningSkills ?? [],
  };

  try {
    const draft = await getProvider().parseImportedMistake(providerInput);

    await supabase.from("ai_generations").insert({
      kind: "classification",
      provider: aiMetadata.provider,
      model: aiMetadata.model,
      prompt_version: "import_parse-1.0.0",
      input: {
        raw_text_length: input.raw_text.length,
        source_material: input.source_material ?? null,
        default_section: input.default_section ?? null,
      },
      output: draft,
      latency_ms: Date.now() - startedAt,
      status: "success",
    });

    return NextResponse.json({ draft });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown import parser error";

    await supabase.from("ai_generations").insert({
      kind: "classification",
      provider: aiMetadata.provider,
      model: aiMetadata.model,
      prompt_version: "import_parse-1.0.0",
      input: {
        raw_text_length: input.raw_text.length,
        source_material: input.source_material ?? null,
        default_section: input.default_section ?? null,
      },
      output: null,
      latency_ms: Date.now() - startedAt,
      status: "error",
      error_message: message,
    });

    return NextResponse.json(
      {
        error: "Could not parse the pasted question right now.",
        details: process.env.NODE_ENV === "development" ? message : undefined,
        provider: aiMetadata.provider,
        model: aiMetadata.model,
      },
      { status: 502 },
    );
  }
}

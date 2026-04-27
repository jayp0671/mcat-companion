import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateQuestionsWithFallback } from "@/lib/ai/retry";
import { getAiProviderMetadata } from "@/lib/ai/metadata";

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  return data?.role === "admin";
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isAdmin(supabase, user.id))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const count = Math.max(1, Math.min(Number(body.count ?? 3), 10));
  const topicName = body.topicName ?? "mixed MCAT fundamentals";
  const section = body.section ?? "bio_biochem";
  const difficulty = Math.max(1, Math.min(Number(body.difficulty ?? 3), 5));
  const aiMetadata = getAiProviderMetadata();
  const startedAt = Date.now();

  try {
    const generated = await generateQuestionsWithFallback({ topicName, difficulty, count });
    const created: any[] = [];

    for (const draft of generated) {
      const { data: question, error } = await supabase.from("questions").insert({
        stem: draft.stem,
        passage: draft.passage ?? null,
        format: draft.format ?? "discrete",
        section: draft.section ?? section,
        difficulty: draft.difficulty ?? difficulty,
        source_type: "ai_generated",
        source_material: `AI generated: ${topicName}`,
        review_status: "pending",
        created_by: user.id,
      }).select("*").single();

      if (error || !question) continue;

      await supabase.from("question_choices").insert(draft.choices.map((choice, index) => ({
        question_id: question.id,
        label: choice.label,
        text: choice.text,
        is_correct: choice.label === draft.correct_label || choice.is_correct === true,
        position: index + 1,
      })));

      await supabase.from("ai_generations").insert({
        kind: "question",
        provider: aiMetadata.provider,
        model: aiMetadata.model,
        prompt_version: "question_generation-1.0.0",
        input: body,
        output: draft,
        latency_ms: Date.now() - startedAt,
        status: "success",
        linked_entity_id: question.id,
      });

      created.push(question);
    }

    return NextResponse.json({ created });
  } catch (err) {
    await supabase.from("ai_generations").insert({
      kind: "question",
      provider: aiMetadata.provider,
      model: aiMetadata.model,
      prompt_version: "question_generation-1.0.0",
      input: body,
      output: null,
      latency_ms: Date.now() - startedAt,
      status: "error",
      error_message: err instanceof Error ? err.message : "Unknown question generation error",
    });

    return NextResponse.json({ error: "Could not generate question drafts right now." }, { status: 502 });
  }
}

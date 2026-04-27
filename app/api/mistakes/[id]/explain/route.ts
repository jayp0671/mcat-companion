import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateExplanationWithFallback } from "@/lib/ai/retry";
import { getAiProviderMetadata } from "@/lib/ai/metadata";


type RouteContext = { params: { id: string } };

export async function POST(_request: NextRequest, { params }: RouteContext) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: mistake, error } = await supabase
    .from("mistake_log_entries")
    .select(`
      id,
      her_selected_answer,
      correct_answer,
      her_confidence,
      question:questions(
        id,
        stem,
        passage,
        section,
        format,
        difficulty,
        topic:taxonomy_nodes!questions_topic_id_fkey(id, name, code),
        choices:question_choices(label, text, is_correct, position),
        explanation:question_explanations(*)
      )
    `)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !mistake) {
    return NextResponse.json({ error: error?.message ?? "Mistake not found" }, { status: 404 });
  }

  const questionRaw = Array.isArray((mistake as any).question) ? (mistake as any).question[0] : (mistake as any).question;
  const existing = Array.isArray(questionRaw?.explanation) ? questionRaw.explanation[0] : questionRaw?.explanation;

  if (existing) {
    return NextResponse.json({ explanation: existing, cached: true });
  }

  const start = Date.now();
  const aiMetadata = getAiProviderMetadata();

  try {
    const choices = Array.isArray(questionRaw?.choices) ? questionRaw.choices : [];
    const generated = await generateExplanationWithFallback({
      stem: questionRaw?.stem,
      passage: questionRaw?.passage,
      choices: choices.map((choice: any) => ({ label: choice.label, text: choice.text })),
      correct_label: ["A", "B", "C", "D"].includes(String(mistake.correct_answer).toUpperCase())
        ? (String(mistake.correct_answer).toUpperCase() as "A" | "B" | "C" | "D")
        : undefined,
      her_answer: mistake.her_selected_answer,
      confidence: mistake.her_confidence ?? undefined,
      topic_context: questionRaw?.topic?.name,
    });

    const { data: explanation, error: insertError } = await supabase
      .from("question_explanations")
      .insert({
        question_id: questionRaw.id,
        correct_explanation: generated.correct_explanation,
        distractor_explanations: generated.distractor_explanations,
        key_concept: generated.key_concept,
        common_misconception: generated.common_misconception ?? null,
        generated_by: "ai",
        model_used: aiMetadata.model,
        prompt_version: "explanation-1.0.0",
      })
      .select("*")
      .single();

    if (insertError || !explanation) {
      return NextResponse.json({ error: insertError?.message ?? "Failed to save explanation" }, { status: 500 });
    }

    await supabase.from("ai_generations").insert({
      kind: "explanation",
      provider: aiMetadata.provider,
      model: aiMetadata.model,
      prompt_version: "explanation-1.0.0",
      input: { mistake_id: params.id, question_id: questionRaw.id },
      output: generated,
      latency_ms: Date.now() - start,
      status: "success",
      linked_entity_id: questionRaw.id,
    });

    return NextResponse.json({ explanation, cached: false });
  } catch (err) {
    await supabase.from("ai_generations").insert({
      kind: "explanation",
      provider: aiMetadata.provider,
      model: aiMetadata.model,
      prompt_version: "explanation-1.0.0",
      input: { mistake_id: params.id, question_id: questionRaw?.id },
      output: null,
      latency_ms: Date.now() - start,
      status: "error",
      error_message: err instanceof Error ? err.message : "Unknown explanation error",
      linked_entity_id: questionRaw?.id,
    });
    return NextResponse.json({ error: "Could not generate explanation right now." }, { status: 502 });
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateExplanationWithFallback } from "@/lib/ai/retry";
import { getAiProviderMetadata } from "@/lib/ai/metadata";
import { getErrorMessage } from "@/lib/ai/errors";

type RouteContext = { params: { id: string } };

type ChoiceRow = {
  label: "A" | "B" | "C" | "D";
  text: string;
  is_correct?: boolean | null;
  position?: number | null;
};

function normalizeOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normalizeChoices(value: unknown): ChoiceRow[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((choice) => choice as Partial<ChoiceRow>)
    .filter((choice): choice is ChoiceRow =>
      ["A", "B", "C", "D"].includes(String(choice.label)) && typeof choice.text === "string" && choice.text.trim().length > 0,
    )
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

function normalizeLabel(value: unknown): "A" | "B" | "C" | "D" | undefined {
  const label = String(value ?? "").trim().toUpperCase();
  return ["A", "B", "C", "D"].includes(label) ? (label as "A" | "B" | "C" | "D") : undefined;
}

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

  const questionRaw = normalizeOne((mistake as any).question);

  if (!questionRaw?.id || !questionRaw?.stem) {
    return NextResponse.json({ error: "Mistake is missing its linked question." }, { status: 422 });
  }

  const existing = normalizeOne(questionRaw.explanation);

  if (existing) {
    return NextResponse.json({ explanation: existing, cached: true });
  }

  const start = Date.now();
  const aiMetadata = getAiProviderMetadata();
  const choices = normalizeChoices(questionRaw.choices);

  const input = {
    stem: questionRaw.stem,
    passage: questionRaw.passage,
    choices: choices.map((choice) => ({ label: choice.label, text: choice.text, is_correct: Boolean(choice.is_correct) })),
    correctLabel: normalizeLabel((mistake as any).correct_answer),
    selectedLabel: normalizeLabel((mistake as any).her_selected_answer),
    topicContext: normalizeOne(questionRaw.topic)?.name ?? undefined,
    confidence: (mistake as any).her_confidence ?? undefined,
  };

  try {
    const generated = await generateExplanationWithFallback(input);

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
      input: { mistake_id: params.id, question_id: questionRaw.id, request: input },
      output: generated,
      latency_ms: Date.now() - start,
      status: "success",
      linked_entity_id: questionRaw.id,
    });

    return NextResponse.json({ explanation, cached: false });
  } catch (err) {
    const message = getErrorMessage(err);
    console.error("Explanation generation failed", {
      mistakeId: params.id,
      questionId: questionRaw.id,
      provider: aiMetadata.provider,
      model: aiMetadata.model,
      error: message,
    });

    await supabase.from("ai_generations").insert({
      kind: "explanation",
      provider: aiMetadata.provider,
      model: aiMetadata.model,
      prompt_version: "explanation-1.0.0",
      input: { mistake_id: params.id, question_id: questionRaw.id, request: input },
      output: null,
      latency_ms: Date.now() - start,
      status: "error",
      error_message: message,
      linked_entity_id: questionRaw.id,
    });

    return NextResponse.json(
      {
        error: "Could not generate explanation right now.",
        details: process.env.NODE_ENV === "development" ? message : undefined,
        provider: process.env.NODE_ENV === "development" ? aiMetadata.provider : undefined,
        model: process.env.NODE_ENV === "development" ? aiMetadata.model : undefined,
      },
      { status: 502 },
    );
  }
}

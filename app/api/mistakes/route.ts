import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const sectionSchema = z.enum(["chem_phys", "cars", "bio_biochem", "psych_soc"]);
const formatSchema = z.enum(["discrete", "passage"]);

const mistakePayloadSchema = z.object({
  stem: z.string().trim().min(1, "Question stem is required."),
  passage: z.string().trim().nullable().optional(),
  section: sectionSchema.default("bio_biochem"),
  format: formatSchema.default("discrete"),
  source_material: z.string().trim().nullable().optional(),
  difficulty: z.coerce.number().int().min(1).max(5).nullable().optional(),
  content_category_id: z.string().uuid().nullable().optional(),
  topic_id: z.string().uuid().nullable().optional(),
  subtopic_id: z.string().uuid().nullable().optional(),
  her_selected_answer: z.string().trim().min(1, "Selected answer is required."),
  correct_answer: z.string().trim().min(1, "Correct answer is required."),
  her_confidence: z.coerce.number().int().min(1).max(5).nullable().optional(),
  time_spent_seconds: z.coerce.number().int().min(0).nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});

type RawMistakePayload = Record<string, unknown>;

function blankToNull(value: unknown) {
  if (typeof value !== "string") return value ?? null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
}

function normalizePayload(raw: RawMistakePayload) {
  // Accept both the canonical API keys and older/frontend-friendly aliases.
  return {
    stem: firstString(raw.stem, raw.questionStem, raw.question_stem, raw.prompt),
    passage: blankToNull(raw.passage),
    section: typeof raw.section === "string" ? raw.section : "bio_biochem",
    format: typeof raw.format === "string" ? raw.format : "discrete",
    source_material: blankToNull(raw.source_material ?? raw.sourceMaterial ?? raw.source),
    difficulty: raw.difficulty ?? 3,
    content_category_id: blankToNull(raw.content_category_id ?? raw.contentCategoryId),
    topic_id: blankToNull(raw.topic_id ?? raw.topicId),
    subtopic_id: blankToNull(raw.subtopic_id ?? raw.subtopicId),
    her_selected_answer: firstString(
      raw.her_selected_answer,
      raw.selectedAnswer,
      raw.selected_answer,
      raw.herAnswer,
      raw.answer,
    ),
    correct_answer: firstString(raw.correct_answer, raw.correctAnswer, raw.correct),
    her_confidence: raw.her_confidence ?? raw.confidence ?? 3,
    time_spent_seconds: blankToNull(raw.time_spent_seconds ?? raw.timeSpentSeconds),
    notes: blankToNull(raw.notes),
  };
}

function normalizeQuestionRelation<T extends { question?: unknown }>(row: T) {
  const question = Array.isArray(row.question) ? row.question[0] ?? null : row.question;
  return { ...row, question };
}

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");
  const topic = searchParams.get("topic");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = supabase
    .from("mistake_log_entries")
    .select(
      `
      id,
      her_selected_answer,
      correct_answer,
      her_confidence,
      time_spent_seconds,
      notes,
      logged_at,
      question:questions(
        id,
        stem,
        passage,
        format,
        section,
        source_material,
        difficulty,
        content_category_id,
        topic_id,
        subtopic_id,
        topic:taxonomy_nodes!questions_topic_id_fkey(id, name, code)
      )
    `,
    )
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false });

  if (from) query = query.gte("logged_at", from);
  if (to) query = query.lte("logged_at", to);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const normalized = (data ?? [])
    .map(normalizeQuestionRelation)
    .filter((row) => {
      const question = row.question as { section?: string; topic_id?: string } | null;
      if (!question) return false;
      if (section && question.section !== section) return false;
      if (topic && question.topic_id !== topic) return false;
      return true;
    });

  return NextResponse.json({ mistakes: normalized });
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

  let rawPayload: RawMistakePayload;

  try {
    rawPayload = (await request.json()) as RawMistakePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = mistakePayloadSchema.safeParse(normalizePayload(rawPayload));

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid mistake payload",
        issues: parsed.error.flatten(),
        received: rawPayload,
      },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  const { data: question, error: questionError } = await supabase
    .from("questions")
    .insert({
      stem: payload.stem,
      passage: payload.passage ?? null,
      format: payload.format,
      section: payload.section,
      content_category_id: payload.content_category_id ?? null,
      topic_id: payload.topic_id ?? null,
      subtopic_id: payload.subtopic_id ?? null,
      difficulty: payload.difficulty ?? 3,
      source_type: "mistake_log",
      source_material: payload.source_material ?? null,
      review_status: "approved",
      created_by: user.id,
    })
    .select("*")
    .single();

  if (questionError || !question) {
    return NextResponse.json(
      { error: "Failed to create question", details: questionError?.message },
      { status: 500 },
    );
  }

  const labels = ["A", "B", "C", "D"] as const;
  const selected = payload.her_selected_answer.toUpperCase();
  const correct = payload.correct_answer.toUpperCase();

  const choiceRows = labels.map((label, index) => ({
    question_id: question.id,
    label,
    text:
      label === selected || label === correct
        ? `Answer choice ${label}`
        : `Unrecorded answer choice ${label}`,
    is_correct: label === correct,
    position: index + 1,
  }));

  const { error: choicesError } = await supabase
    .from("question_choices")
    .insert(choiceRows);

  if (choicesError) {
    await supabase.from("questions").delete().eq("id", question.id);
    return NextResponse.json(
      { error: "Failed to create answer choices", details: choicesError.message },
      { status: 500 },
    );
  }

  const { data: mistake, error: mistakeError } = await supabase
    .from("mistake_log_entries")
    .insert({
      user_id: user.id,
      question_id: question.id,
      her_selected_answer: payload.her_selected_answer,
      correct_answer: payload.correct_answer,
      her_confidence: payload.her_confidence ?? 3,
      time_spent_seconds: payload.time_spent_seconds ?? null,
      notes: payload.notes ?? null,
    })
    .select("*")
    .single();

  if (mistakeError || !mistake) {
    await supabase.from("question_choices").delete().eq("question_id", question.id);
    await supabase.from("questions").delete().eq("id", question.id);
    return NextResponse.json(
      { error: "Failed to create mistake log entry", details: mistakeError?.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ question, mistake }, { status: 201 });
}

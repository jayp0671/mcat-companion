import { createAdminClient } from "../lib/supabase/admin";

async function deleteByIds(table: string, ids: string[]) {
  if (ids.length === 0) return;

  const supabase = createAdminClient();
  const { error } = await supabase.from(table).delete().in("id", ids);
  if (error) throw new Error(`Failed deleting from ${table}: ${error.message}`);
}

async function deleteByQuestionIds(table: string, questionIds: string[]) {
  if (questionIds.length === 0) return;

  const supabase = createAdminClient();
  const { error } = await supabase.from(table).delete().in("question_id", questionIds);
  if (error) throw new Error(`Failed deleting from ${table}: ${error.message}`);
}

async function main() {
  const supabase = createAdminClient();

  const { data: mockQuestions, error: questionError } = await supabase
    .from("questions")
    .select("id, stem, source_type")
    .or(
      [
        "stem.ilike.%Mock%",
        "stem.ilike.%Test-only%",
        "source_material.ilike.%Mock%",
        "source_material.ilike.%Test-only%",
      ].join(","),
    );

  if (questionError) throw new Error(questionError.message);

  const questionIds = (mockQuestions ?? []).map((question) => question.id as string);

  await deleteByQuestionIds("student_answers", questionIds);
  await deleteByQuestionIds("session_questions", questionIds);
  await deleteByQuestionIds("question_explanations", questionIds);
  await deleteByQuestionIds("question_choices", questionIds);
  await deleteByQuestionIds("question_skills", questionIds);

  if (questionIds.length > 0) {
    const { error } = await supabase.from("questions").delete().in("id", questionIds);
    if (error) throw new Error(`Failed deleting mock questions: ${error.message}`);
  }

  const { data: generations, error: generationsError } = await supabase
    .from("ai_generations")
    .select("id, provider, model, input, output, error_message")
    .limit(10000);

  if (generationsError) throw new Error(generationsError.message);

  const generationIds = (generations ?? [])
    .filter((generation) => {
      const serialized = JSON.stringify(generation).toLowerCase();
      return (
        generation.provider === "mock" ||
        generation.provider === "mock-test-only" ||
        generation.model === "mock" ||
        generation.model === "mock-test-only" ||
        serialized.includes("mock mcat-style question") ||
        serialized.includes("mock explanation") ||
        serialized.includes("test-only generated question") ||
        serialized.includes("test-only explanation")
      );
    })
    .map((generation) => generation.id as string);

  await deleteByIds("ai_generations", generationIds);

  console.log(
    JSON.stringify(
      {
        ok: true,
        deleted_questions: questionIds.length,
        deleted_ai_generations: generationIds.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

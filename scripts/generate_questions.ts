import { createAdminClient } from "@/lib/supabase/admin";
import { generateQuestionsWithFallback } from "@/lib/ai/retry";

const topicName = process.argv[2] ?? "mixed MCAT fundamentals";
const count = Number(process.argv[3] ?? 5);
const section = process.argv[4] ?? "bio_biochem";

async function main() {
  const supabase = createAdminClient();
  const drafts = await generateQuestionsWithFallback({ topicName, count, difficulty: 3 });
  let created = 0;

  for (const draft of drafts) {
    const { data: question, error } = await supabase.from("questions").insert({
      stem: draft.stem,
      passage: draft.passage ?? null,
      format: draft.format ?? "discrete",
      section: draft.section ?? section,
      difficulty: draft.difficulty ?? 3,
      source_type: "ai_generated",
      source_material: `AI generated: ${topicName}`,
      review_status: "pending",
    }).select("*").single();
    if (error || !question) {
      console.error(error?.message ?? "Failed to create question");
      continue;
    }
    await supabase.from("question_choices").insert(draft.choices.map((choice, index) => ({ question_id: question.id, label: choice.label, text: choice.text, is_correct: choice.label === draft.correct_label || choice.is_correct === true, position: index + 1 })));
    created += 1;
  }

  console.log(`Created ${created} pending AI-generated question drafts.`);
}

main().catch((error) => { console.error(error); process.exit(1); });

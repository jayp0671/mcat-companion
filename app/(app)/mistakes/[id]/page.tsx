import { notFound, redirect } from "next/navigation";
import { MistakeDetail } from "@/components/mistakes/MistakeDetail";
import { getUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeMistakeListItem } from "@/lib/mistakes/normalize";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function MistakeDetailPage({ params }: PageProps) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
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
      question:questions (
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
        content_category:taxonomy_nodes!questions_content_category_id_fkey(id, name, code),
        topic:taxonomy_nodes!questions_topic_id_fkey(id, name, code),
        subtopic:taxonomy_nodes!questions_subtopic_id_fkey(id, name, code),
        choices:question_choices(id, label, text, is_correct, position),
        skills:question_skills(skill:reasoning_skills(id, code, name))
      )
    `,
    )
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <MistakeDetail mistake={normalizeMistakeListItem(data)} />
    </main>
  );
}

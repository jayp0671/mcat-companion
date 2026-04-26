import Link from "next/link";
import { redirect } from "next/navigation";
import { MistakeList } from "@/components/mistakes/MistakeList";
import { BulkPasteForm } from "@/components/mistakes/BulkPasteForm";
import { getUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeMistakeListItems } from "@/lib/mistakes/normalize";

export default async function LogPage() {
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
        subtopic:taxonomy_nodes!questions_subtopic_id_fkey(id, name, code)
      )
    `,
    )
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  const mistakes = normalizeMistakeListItems(data);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">Mistake history</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Review logged mistakes
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            This is the personal dataset that powers the rest of the app.
          </p>
        </div>
        <Link
          href="/log/new"
          className="rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white"
        >
          Log mistake
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <MistakeList mistakes={mistakes} />
        <BulkPasteForm />
      </div>
    </main>
  );
}

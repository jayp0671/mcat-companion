import { redirect } from "next/navigation";
import { MistakeForm } from "@/components/mistakes/MistakeForm";
import { getUser } from "@/lib/auth/session";
import { loadTaxonomyForUser } from "@/lib/taxonomy/loaders";

export default async function NewMistakePage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const { nodes, skills } = await loadTaxonomyForUser();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <p className="text-sm font-semibold text-slate-500">Mistake log</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Log a missed question
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Capture the mistake quickly now. The app will use these entries later for pattern
          diagnosis, explanations, and recommendations.
        </p>
      </div>
      <MistakeForm taxonomyNodes={nodes} reasoningSkills={skills} />
    </main>
  );
}

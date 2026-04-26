"use client";

import { useEffect, useMemo, useState } from "react";

type TaxonomyNode = {
  id: string;
  parent_id: string | null;
  level: "section" | "foundation" | "category" | "topic" | "subtopic";
  code: string | null;
  name: string;
  section: string | null;
};

type MistakeFormProps = {
  taxonomy?: TaxonomyNode[] | null;
};

type MistakeFormState = {
  stem: string;
  passage: string;
  section: string;
  format: "discrete" | "passage";
  source_material: string;
  difficulty: string;
  content_category_id: string;
  topic_id: string;
  subtopic_id: string;
  her_selected_answer: string;
  correct_answer: string;
  her_confidence: string;
  time_spent_seconds: string;
  notes: string;
};

const DRAFT_KEY = "mcat-companion-mistake-draft";

const initialForm: MistakeFormState = {
  stem: "",
  passage: "",
  section: "bio_biochem",
  format: "discrete",
  source_material: "",
  difficulty: "3",
  content_category_id: "",
  topic_id: "",
  subtopic_id: "",
  her_selected_answer: "",
  correct_answer: "",
  her_confidence: "3",
  time_spent_seconds: "",
  notes: "",
};

const sectionLabels: Record<string, string> = {
  chem_phys: "Chem/Phys",
  cars: "CARS",
  bio_biochem: "Bio/Biochem",
  psych_soc: "Psych/Soc",
};

function coerceNumber(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function MistakeForm({ taxonomy }: MistakeFormProps) {
  const taxonomyNodes = Array.isArray(taxonomy) ? taxonomy : [];

  const [form, setForm] = useState<MistakeFormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedDraft = window.localStorage.getItem(DRAFT_KEY);

    if (!savedDraft) {
      return;
    }

    try {
      const parsed = JSON.parse(savedDraft) as Partial<MistakeFormState>;
      setForm((current) => ({
        ...current,
        ...parsed,
      }));
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [form]);

  const categories = useMemo(() => {
    return taxonomyNodes.filter(
      (node) => node.level === "category" && node.section === form.section,
    );
  }, [taxonomyNodes, form.section]);

  const topics = useMemo(() => {
    if (!form.content_category_id) {
      return [];
    }

    return taxonomyNodes.filter(
      (node) =>
        node.level === "topic" && node.parent_id === form.content_category_id,
    );
  }, [taxonomyNodes, form.content_category_id]);

  const subtopics = useMemo(() => {
    if (!form.topic_id) {
      return [];
    }

    return taxonomyNodes.filter(
      (node) => node.level === "subtopic" && node.parent_id === form.topic_id,
    );
  }, [taxonomyNodes, form.topic_id]);

  function updateField<K extends keyof MistakeFormState>(
    key: K,
    value: MistakeFormState[K],
  ) {
    setForm((current) => {
      const next = {
        ...current,
        [key]: value,
      };

      if (key === "section") {
        next.content_category_id = "";
        next.topic_id = "";
        next.subtopic_id = "";
      }

      if (key === "content_category_id") {
        next.topic_id = "";
        next.subtopic_id = "";
      }

      if (key === "topic_id") {
        next.subtopic_id = "";
      }

      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const payload = {
      stem: form.stem.trim(),
      passage: form.passage.trim() || null,
      section: form.section,
      format: form.format,
      source_material: form.source_material.trim() || null,
      difficulty: coerceNumber(form.difficulty, 3),
      content_category_id: form.content_category_id || null,
      topic_id: form.topic_id || null,
      subtopic_id: form.subtopic_id || null,
      her_selected_answer: form.her_selected_answer.trim(),
      correct_answer: form.correct_answer.trim(),
      her_confidence: coerceNumber(form.her_confidence, 3),
      time_spent_seconds: form.time_spent_seconds
        ? coerceNumber(form.time_spent_seconds, 0)
        : null,
      notes: form.notes.trim() || null,
    };

    if (!payload.stem || !payload.her_selected_answer || !payload.correct_answer) {
      setError("Question stem, your answer, and correct answer are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/mistakes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        console.error("Mistake save failed:", result);
        setError(result?.error ?? "Failed to save mistake.");
        return;
      }

      window.localStorage.removeItem(DRAFT_KEY);
      setForm(initialForm);
      setSuccess("Mistake saved.");
      window.location.href = "/log";
    } catch (err) {
      console.error("Mistake save error:", err);
      setError("Something went wrong while saving the mistake.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-950">
            Question details
          </h2>
          <p className="text-sm text-slate-500">
            Log the question she missed from real prep materials.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Question stem
            </span>
            <textarea
              value={form.stem}
              onChange={(event) => updateField("stem", event.target.value)}
              rows={5}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="Paste or type the question stem here."
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Passage context, optional
            </span>
            <textarea
              value={form.passage}
              onChange={(event) => updateField("passage", event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="Optional passage notes or context."
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Source material
            </span>
            <input
              value={form.source_material}
              onChange={(event) =>
                updateField("source_material", event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="Example: UWorld, AAMC FL1 #23, Anki"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-950">
            Classification
          </h2>
          <p className="text-sm text-slate-500">
            These tags power the dashboard and future recommendations.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Section</span>
            <select
              value={form.section}
              onChange={(event) => updateField("section", event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            >
              {Object.entries(sectionLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Format</span>
            <select
              value={form.format}
              onChange={(event) =>
                updateField(
                  "format",
                  event.target.value as MistakeFormState["format"],
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            >
              <option value="discrete">Discrete</option>
              <option value="passage">Passage-based</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Content category
            </span>
            <select
              value={form.content_category_id}
              onChange={(event) =>
                updateField("content_category_id", event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.code ? `${category.code} · ` : ""}
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Topic</span>
            <select
              value={form.topic_id}
              onChange={(event) => updateField("topic_id", event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            >
              <option value="">Select a topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.code ? `${topic.code} · ` : ""}
                  {topic.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Subtopic, optional
            </span>
            <select
              value={form.subtopic_id}
              onChange={(event) =>
                updateField("subtopic_id", event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            >
              <option value="">Select a subtopic</option>
              {subtopics.map((subtopic) => (
                <option key={subtopic.id} value={subtopic.id}>
                  {subtopic.code ? `${subtopic.code} · ` : ""}
                  {subtopic.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Difficulty
            </span>
            <select
              value={form.difficulty}
              onChange={(event) =>
                updateField("difficulty", event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            >
              <option value="1">1 · Easy</option>
              <option value="2">2</option>
              <option value="3">3 · Medium</option>
              <option value="4">4</option>
              <option value="5">5 · Hard</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-950">
            Answer review
          </h2>
          <p className="text-sm text-slate-500">
            Record what she picked and what the correct answer was.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Her selected answer
            </span>
            <input
              value={form.her_selected_answer}
              onChange={(event) =>
                updateField("her_selected_answer", event.target.value)
              }
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="Example: A"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Correct answer
            </span>
            <input
              value={form.correct_answer}
              onChange={(event) =>
                updateField("correct_answer", event.target.value)
              }
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="Example: B"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Confidence
            </span>
            <select
              value={form.her_confidence}
              onChange={(event) =>
                updateField("her_confidence", event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            >
              <option value="1">1 · Guessed</option>
              <option value="2">2</option>
              <option value="3">3 · Unsure</option>
              <option value="4">4</option>
              <option value="5">5 · Felt confident</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Time spent, optional
            </span>
            <input
              type="number"
              min="0"
              value={form.time_spent_seconds}
              onChange={(event) =>
                updateField("time_spent_seconds", event.target.value)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="Seconds"
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-700">Notes</span>
          <textarea
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            placeholder="Why did she miss it? Content gap, graph issue, careless mistake, etc."
          />
        </label>
      </section>

      <div className="sticky bottom-0 -mx-4 border-t bg-white/95 px-4 py-4 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Draft saves automatically in this browser.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setForm(initialForm);
                window.localStorage.removeItem(DRAFT_KEY);
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-slate-950 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save mistake"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

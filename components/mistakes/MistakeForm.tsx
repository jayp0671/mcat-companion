"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReasoningSkill, TaxonomyNode } from "@/lib/mistakes/types";
import { formatSection } from "@/lib/utils/sections";

type MistakeFormProps = {
  taxonomyNodes?: TaxonomyNode[];
  taxonomy?: TaxonomyNode[];
  reasoningSkills?: ReasoningSkill[];
};

type ChoiceDraft = {
  label: "A" | "B" | "C" | "D";
  text: string;
};

type DraftShape = {
  stem: string;
  passage: string;
  sourceMaterial: string;
  section: string;
  contentCategoryId: string;
  topicId: string;
  subtopicId: string;
  format: "discrete" | "passage";
  difficulty: number;
  selectedAnswer: string;
  correctAnswer: string;
  confidence: string;
  timeSpent: string;
  notes: string;
  choices: ChoiceDraft[];
  skillIds: string[];
};

type ImportedMistakeDraft = {
  stem: string;
  passage?: string | null;
  source_material?: string | null;
  section?: string | null;
  format?: "discrete" | "passage" | null;
  difficulty?: number | null;
  content_category_id?: string | null;
  topic_id?: string | null;
  subtopic_id?: string | null;
  reasoning_skill_ids?: string[];
  choices?: ChoiceDraft[];
  her_selected_answer?: string | null;
  correct_answer?: string | null;
  her_confidence?: number | null;
  time_spent_seconds?: number | null;
  notes?: string | null;
  parser_confidence?: number | null;
  needs_review?: boolean;
  warnings?: string[];
};

const STORAGE_KEY = "mcat-companion:mistake-draft:v1";
const IMPORT_STORAGE_KEY = "mcat-companion:smart-import-raw:v1";

const EMPTY_CHOICES: ChoiceDraft[] = [
  { label: "A", text: "" },
  { label: "B", text: "" },
  { label: "C", text: "" },
  { label: "D", text: "" },
];

const FALLBACK_SECTIONS = [
  { value: "chem_phys", label: "Chem/Phys" },
  { value: "cars", label: "CARS" },
  { value: "bio_biochem", label: "Bio/Biochem" },
  { value: "psych_soc", label: "Psych/Soc" },
];

const VALID_SECTIONS = new Set(FALLBACK_SECTIONS.map((section) => section.value));
const VALID_FORMATS = new Set(["discrete", "passage"]);
const CHOICE_LABELS: ChoiceDraft["label"][] = ["A", "B", "C", "D"];

function coerceChoiceDrafts(choices: ChoiceDraft[] | undefined): ChoiceDraft[] {
  const byLabel = new Map<string, string>();

  for (const choice of choices ?? []) {
    if (!choice?.label || !CHOICE_LABELS.includes(choice.label)) continue;
    byLabel.set(choice.label, choice.text ?? "");
  }

  return CHOICE_LABELS.map((label) => ({ label, text: byLabel.get(label) ?? "" }));
}


export function MistakeForm({
  taxonomyNodes,
  taxonomy,
  reasoningSkills,
}: MistakeFormProps) {
  const router = useRouter();
  const safeTaxonomyNodes = taxonomyNodes ?? taxonomy ?? [];
  const safeReasoningSkills = reasoningSkills ?? [];

  const [stem, setStem] = useState("");
  const [passage, setPassage] = useState("");
  const [sourceMaterial, setSourceMaterial] = useState("");
  const [section, setSection] = useState("bio_biochem");
  const [contentCategoryId, setContentCategoryId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [subtopicId, setSubtopicId] = useState("");
  const [format, setFormat] = useState<"discrete" | "passage">("discrete");
  const [difficulty, setDifficulty] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [confidence, setConfidence] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [notes, setNotes] = useState("");
  const [choices, setChoices] = useState<ChoiceDraft[]>(EMPTY_CHOICES);
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [rawImport, setRawImport] = useState("");
  const [isParsingImport, setIsParsingImport] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sections = useMemo(
    () => safeTaxonomyNodes.filter((node) => node.level === "section"),
    [safeTaxonomyNodes],
  );

  const categories = useMemo(
    () =>
      safeTaxonomyNodes.filter(
        (node) => node.level === "category" && node.section === section,
      ),
    [safeTaxonomyNodes, section],
  );

  const topics = useMemo(
    () =>
      safeTaxonomyNodes.filter(
        (node) => node.level === "topic" && node.parent_id === contentCategoryId,
      ),
    [safeTaxonomyNodes, contentCategoryId],
  );

  const subtopics = useMemo(
    () =>
      safeTaxonomyNodes.filter(
        (node) => node.level === "subtopic" && node.parent_id === topicId,
      ),
    [safeTaxonomyNodes, topicId],
  );

  const validSkillIds = useMemo(
    () => new Set(safeReasoningSkills.map((skill) => skill.id)),
    [safeReasoningSkills],
  );

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const savedImport = window.localStorage.getItem(IMPORT_STORAGE_KEY);

    if (savedImport) setRawImport(savedImport);
    if (!saved) return;

    try {
      const draft = JSON.parse(saved) as Partial<DraftShape>;

      setStem(draft.stem ?? "");
      setPassage(draft.passage ?? "");
      setSourceMaterial(draft.sourceMaterial ?? "");
      setSection(draft.section ?? "bio_biochem");
      setContentCategoryId(draft.contentCategoryId ?? "");
      setTopicId(draft.topicId ?? "");
      setSubtopicId(draft.subtopicId ?? "");
      setFormat(draft.format ?? "discrete");
      setDifficulty(draft.difficulty ?? 3);
      setSelectedAnswer(draft.selectedAnswer ?? "");
      setCorrectAnswer(draft.correctAnswer ?? "");
      setConfidence(draft.confidence ?? "");
      setTimeSpent(draft.timeSpent ?? "");
      setNotes(draft.notes ?? "");
      setChoices(draft.choices ?? EMPTY_CHOICES);
      setSkillIds(draft.skillIds ?? []);
      setMessage("Recovered your unsaved draft.");
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const draft: DraftShape = {
      stem,
      passage,
      sourceMaterial,
      section,
      contentCategoryId,
      topicId,
      subtopicId,
      format,
      difficulty,
      selectedAnswer,
      correctAnswer,
      confidence,
      timeSpent,
      notes,
      choices,
      skillIds,
    };

    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [
    stem,
    passage,
    sourceMaterial,
    section,
    contentCategoryId,
    topicId,
    subtopicId,
    format,
    difficulty,
    selectedAnswer,
    correctAnswer,
    confidence,
    timeSpent,
    notes,
    choices,
    skillIds,
  ]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (rawImport.trim()) {
        window.localStorage.setItem(IMPORT_STORAGE_KEY, rawImport);
      } else {
        window.localStorage.removeItem(IMPORT_STORAGE_KEY);
      }
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [rawImport]);

  function resetForm() {
    setStem("");
    setPassage("");
    setSourceMaterial("");
    setContentCategoryId("");
    setTopicId("");
    setSubtopicId("");
    setFormat("discrete");
    setDifficulty(3);
    setSelectedAnswer("");
    setCorrectAnswer("");
    setConfidence("");
    setTimeSpent("");
    setNotes("");
    setChoices(EMPTY_CHOICES);
    setSkillIds([]);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function applyImportedDraft(draft: ImportedMistakeDraft) {
    setStem(draft.stem ?? "");
    setPassage(draft.passage ?? "");
    setSourceMaterial(draft.source_material ?? sourceMaterial);

    if (draft.section && VALID_SECTIONS.has(draft.section)) {
      setSection(draft.section);
    }

    if (draft.content_category_id) setContentCategoryId(draft.content_category_id);
    if (draft.topic_id) setTopicId(draft.topic_id);
    if (draft.subtopic_id) setSubtopicId(draft.subtopic_id);

    if (draft.format && VALID_FORMATS.has(draft.format)) {
      setFormat(draft.format);
    }

    if (typeof draft.difficulty === "number") {
      setDifficulty(Math.max(1, Math.min(5, Math.round(draft.difficulty))));
    }

    setSelectedAnswer((draft.her_selected_answer ?? "").toUpperCase());
    setCorrectAnswer((draft.correct_answer ?? "").toUpperCase());
    setConfidence(draft.her_confidence ? String(draft.her_confidence) : "");
    setTimeSpent(draft.time_spent_seconds ? String(draft.time_spent_seconds) : "");
    setNotes(draft.notes ?? "");
    setChoices(coerceChoiceDrafts(draft.choices));
    setSkillIds((draft.reasoning_skill_ids ?? []).filter((id) => validSkillIds.has(id)));

    const confidenceLabel =
      typeof draft.parser_confidence === "number"
        ? ` Parser confidence: ${Math.round(draft.parser_confidence * 100)}%.`
        : "";
    const warningLabel = draft.warnings?.length ? ` Review notes: ${draft.warnings.join(" ")}` : "";

    setMessage(`Smart import filled the form. Review everything before saving.${confidenceLabel}${warningLabel}`);
  }

  async function parseSmartImport() {
    const text = rawImport.trim();

    if (text.length < 20) {
      setMessage("Paste the full copied question/result text first.");
      return;
    }

    setIsParsingImport(true);
    setMessage(null);

    try {
      const response = await fetch("/api/import/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_text: text,
          source_material: sourceMaterial.trim() || null,
          default_section: section,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(payload?.details ?? payload?.error ?? "Could not parse the pasted question.");
        return;
      }

      applyImportedDraft(payload.draft as ImportedMistakeDraft);
    } catch (error) {
      console.error("Smart import parse error", error);
      setMessage("Something went wrong while parsing the pasted question.");
    } finally {
      setIsParsingImport(false);
    }
  }

  async function submit(saveAndAnother: boolean) {
    setIsSubmitting(true);
    setMessage(null);

    const trimmedStem = stem.trim();
    const trimmedSelectedAnswer = selectedAnswer.trim();
    const trimmedCorrectAnswer = correctAnswer.trim();

    if (!trimmedStem || !trimmedSelectedAnswer || !trimmedCorrectAnswer) {
      setIsSubmitting(false);
      setMessage("Question stem, your answer, and correct answer are required.");
      return;
    }

    try {
      const response = await fetch("/api/mistakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stem: trimmedStem,
          passage: passage.trim() || null,
          source_material: sourceMaterial.trim() || null,
          section,
          content_category_id: contentCategoryId || null,
          topic_id: topicId || null,
          subtopic_id: subtopicId || null,
          reasoning_skill_ids: skillIds,
          format,
          difficulty,
          her_selected_answer: trimmedSelectedAnswer,
          correct_answer: trimmedCorrectAnswer,
          her_confidence: confidence ? Number(confidence) : null,
          time_spent_seconds: timeSpent ? Number(timeSpent) : null,
          notes: notes.trim() || null,
          choices: choices.filter((choice) => choice.text.trim().length > 0),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(payload?.error ?? "Could not save the mistake.");
        return;
      }

      resetForm();
      setRawImport("");
      window.localStorage.removeItem(IMPORT_STORAGE_KEY);

      if (saveAndAnother) {
        setMessage("Mistake saved. Ready for the next one.");
        return;
      }

      const nextId = payload?.log_entry?.id ?? payload?.mistake?.id;
      router.push(nextId ? `/mistakes/${nextId}` : "/log");
    } catch (error) {
      console.error("Mistake save error", error);
      setMessage("Something went wrong while saving the mistake.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleSkill(skillId: string) {
    setSkillIds((current) =>
      current.includes(skillId)
        ? current.filter((id) => id !== skillId)
        : [...current, skillId],
    );
  }

  return (
    <div className="space-y-6">
      {message ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Smart import</h2>
            <p className="mt-1 text-sm text-slate-600">
              Paste the full copied question, choices, answer result, and explanation. AI will
              prefill the form, but you still review before saving.
            </p>
          </div>
          <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            Review before saving
          </span>
        </div>

        <textarea
          className="mt-4 min-h-44 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          placeholder={[
            "Paste messy copied text here, for example:",
            "Question stem...",
            "A. ...",
            "B. ...",
            "C. ...",
            "D. ...",
            "I chose B. Correct answer: C.",
          ].join("\n")}
          value={rawImport}
          onChange={(event) => setRawImport(event.target.value)}
        />

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-slate-500">
            This sends the pasted text to the configured live AI provider. Do not paste anything
            outside her private study workflow.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRawImport("")}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Clear paste
            </button>
            <button
              type="button"
              onClick={parseSmartImport}
              disabled={isParsingImport || rawImport.trim().length < 20}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isParsingImport ? "Parsing..." : "Parse with AI"}
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Source</span>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            placeholder="AAMC FL1 #23, UWorld Bio QID, Anki, etc."
            value={sourceMaterial}
            onChange={(event) => setSourceMaterial(event.target.value)}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Section</span>
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            value={section}
            onChange={(event) => {
              setSection(event.target.value);
              setContentCategoryId("");
              setTopicId("");
              setSubtopicId("");
            }}
          >
            {sections.map((node) => (
              <option key={node.id} value={node.section ?? node.code ?? node.id}>
                {node.name || formatSection(node.section)}
              </option>
            ))}
            {sections.length === 0
              ? FALLBACK_SECTIONS.map((fallback) => (
                  <option key={fallback.value} value={fallback.value}>
                    {fallback.label}
                  </option>
                ))
              : null}
          </select>
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Question stem</span>
        <textarea
          className="min-h-36 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          placeholder="Paste or type the missed question stem. Keep this private and use it only for personal study."
          value={stem}
          onChange={(event) => setStem(event.target.value)}
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Passage context optional</span>
        <textarea
          className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          placeholder="Only add what you need to understand the mistake later."
          value={passage}
          onChange={(event) => setPassage(event.target.value)}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Content category</span>
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            value={contentCategoryId}
            onChange={(event) => {
              setContentCategoryId(event.target.value);
              setTopicId("");
              setSubtopicId("");
            }}
          >
            <option value="">Select category</option>
            {categories.map((node) => (
              <option key={node.id} value={node.id}>
                {node.code ? `${node.code} - ` : ""}
                {node.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Topic</span>
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            value={topicId}
            onChange={(event) => {
              setTopicId(event.target.value);
              setSubtopicId("");
            }}
            disabled={!contentCategoryId}
          >
            <option value="">Select topic</option>
            {topics.map((node) => (
              <option key={node.id} value={node.id}>
                {node.code ? `${node.code} - ` : ""}
                {node.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Subtopic optional</span>
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            value={subtopicId}
            onChange={(event) => setSubtopicId(event.target.value)}
            disabled={!topicId}
          >
            <option value="">Select subtopic</option>
            {subtopics.map((node) => (
              <option key={node.id} value={node.id}>
                {node.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Format</span>
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            value={format}
            onChange={(event) => setFormat(event.target.value as "discrete" | "passage")}
          >
            <option value="discrete">Discrete</option>
            <option value="passage">Passage-based</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Difficulty</span>
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            value={difficulty}
            onChange={(event) => setDifficulty(Number(event.target.value))}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}/5
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Your answer</span>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            placeholder="A, B, C, D, or text"
            value={selectedAnswer}
            onChange={(event) => setSelectedAnswer(event.target.value.toUpperCase())}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Correct answer</span>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            placeholder="A, B, C, D, or text"
            value={correctAnswer}
            onChange={(event) => setCorrectAnswer(event.target.value.toUpperCase())}
          />
        </label>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Answer choices optional</h2>
        <p className="mt-1 text-xs text-slate-500">
          Add these if you want better explanations later. You can skip them for fast logging.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {choices.map((choice, index) => (
            <label key={choice.label} className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Choice {choice.label}</span>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={choice.text}
                onChange={(event) => {
                  const next = [...choices];
                  next[index] = { ...choice, text: event.target.value };
                  setChoices(next);
                }}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Reasoning skills optional</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {safeReasoningSkills.map((skill) => (
            <button
              key={skill.id}
              type="button"
              onClick={() => toggleSkill(skill.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                skillIds.includes(skill.id)
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {skill.code}: {skill.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Confidence optional</span>
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            value={confidence}
            onChange={(event) => setConfidence(event.target.value)}
          >
            <option value="">Not sure</option>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}/5
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Time spent seconds optional</span>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            type="number"
            min="0"
            value={timeSpent}
            onChange={(event) => setTimeSpent(event.target.value)}
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Notes optional</span>
        <textarea
          className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          placeholder="Why did this one feel hard? What should future you remember?"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </label>

      <div className="sticky bottom-0 -mx-4 border-t border-slate-200 bg-white/95 p-4 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
        <div className="flex flex-col gap-3 md:flex-row md:justify-end">
          <button
            type="button"
            onClick={() => submit(true)}
            disabled={isSubmitting || isParsingImport}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
          >
            Save & log another
          </button>
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={isSubmitting || isParsingImport}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save mistake"}
          </button>
        </div>
      </div>
    </div>
  );
}

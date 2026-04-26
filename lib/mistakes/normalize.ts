import type { MistakeListItem } from "@/lib/mistakes/types";

function firstOrNull<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normalizeQuestion(question: any): MistakeListItem["question"] {
  const q = firstOrNull(question);
  if (!q) return null;

  return {
    ...q,
    content_category: firstOrNull(q.content_category),
    topic: firstOrNull(q.topic),
    subtopic: firstOrNull(q.subtopic),
    choices: Array.isArray(q.choices) ? q.choices : q.choices ? [q.choices] : undefined,
    skills: Array.isArray(q.skills) ? q.skills : q.skills ? [q.skills] : undefined,
  } as MistakeListItem["question"];
}

export function normalizeMistakeListItem(row: any): MistakeListItem {
  return {
    ...row,
    question: normalizeQuestion(row?.question),
  } as MistakeListItem;
}

export function normalizeMistakeListItems(rows: any[] | null | undefined): MistakeListItem[] {
  return (rows ?? []).map(normalizeMistakeListItem);
}

import type { MistakeListItem } from "@/lib/mistakes/types";
import type { DashboardMistakeRow } from "@/lib/services/dashboard";

type MaybeArray<T> = T | T[] | null | undefined;

function firstOrNull<T>(value: MaybeArray<T>): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function normalizeQuestion(question: unknown) {
  const normalized = firstOrNull(question as MaybeArray<Record<string, unknown>>);

  if (!normalized) {
    return null;
  }

  return {
    ...normalized,
    content_category: firstOrNull(
      (normalized.content_category ?? normalized.category) as MaybeArray<Record<string, unknown>>,
    ),
    category: firstOrNull(
      (normalized.category ?? normalized.content_category) as MaybeArray<Record<string, unknown>>,
    ),
    topic: firstOrNull(normalized.topic as MaybeArray<Record<string, unknown>>),
    subtopic: firstOrNull(normalized.subtopic as MaybeArray<Record<string, unknown>>),
  };
}

export function normalizeMistakeRow<T extends { question?: unknown }>(row: T) {
  return {
    ...row,
    question: normalizeQuestion(row.question),
  };
}

export function normalizeMistakeRows<T extends { question?: unknown }>(
  rows: T[] | null | undefined,
) {
  return (rows ?? []).map((row) => normalizeMistakeRow(row));
}

export function normalizeDashboardMistakeRows(
  rows: unknown[] | null | undefined,
): DashboardMistakeRow[] {
  return (rows ?? []).map((row) => 
    normalizeMistakeRow(row as { question?: unknown })
  ) as unknown as DashboardMistakeRow[];
}

export function normalizeMistakeListItem<T extends { question?: unknown }>(
  row: T | null | undefined,
): MistakeListItem | null {
  if (!row) {
    return null;
  }

  return normalizeMistakeRow(row) as unknown as MistakeListItem;
}

export function normalizeMistakeListItems<T extends { question?: unknown }>(
  rows: T[] | null | undefined,
): MistakeListItem[] {
  return normalizeMistakeRows(rows) as unknown as MistakeListItem[];
}

import type { WeakTopic } from "@/lib/services/dashboard";

export type StudyPlanBlock = {
  id: string;
  date: string;
  duration_min: number;
  activity: "review" | "practice" | "full_length" | "catch_up";
  topic_id: string | null;
  topic_name: string | null;
  description: string;
  completed: boolean;
};

export function splitWeeklyHours(hoursPerWeek: number) {
  const fullLengthHours = Math.round(hoursPerWeek * 0.2 * 10) / 10;
  const targetedHours = Math.max(0, hoursPerWeek - fullLengthHours);
  return { fullLengthHours, targetedHours };
}

function isoDateOffset(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function buildWeeklyPlan(input: {
  hoursPerWeek: number;
  weakTopics: WeakTopic[];
  examDate?: string | null;
}): StudyPlanBlock[] {
  const hours = Math.max(3, Math.min(input.hoursPerWeek || 15, 40));
  const targetMinutes = Math.max(30, Math.round((hours * 60) / 6 / 15) * 15);
  const topics = input.weakTopics.length ? input.weakTopics : [{ id: null as any, name: "Mixed review" } as WeakTopic];

  return Array.from({ length: 7 }, (_, day) => {
    const isFullLength = day === 5;
    const topic = topics[day % topics.length];
    return {
      id: `block-${day + 1}`,
      date: isoDateOffset(day),
      duration_min: isFullLength ? Math.max(90, Math.round(targetMinutes * 1.5)) : targetMinutes,
      activity: isFullLength ? "full_length" : day % 2 === 0 ? "review" : "practice",
      topic_id: topic?.id ?? null,
      topic_name: topic?.name ?? "Mixed review",
      description: isFullLength
        ? "Complete a longer timed block, then log every missed question."
        : `${day % 2 === 0 ? "Review" : "Practice"} ${topic?.name ?? "mixed MCAT topics"}, then log anything missed.`,
      completed: false,
    };
  });
}

import { isWeak } from "@/lib/services/mastery";

export type DashboardMistakeRow = {
  id: string;
  logged_at: string;
  her_confidence: number | null;
  time_spent_seconds: number | null;
  question: {
    id: string;
    stem: string;
    section: string;
    difficulty: number | null;
    topic_id: string | null;
    content_category_id: string | null;
    source_material: string | null;
    topic?: {
      id: string;
      name: string;
      code: string | null;
    } | null;
    category?: {
      id: string;
      name: string;
      code: string | null;
    } | null;
  } | null;
};

export type WeakTopic = {
  id: string;
  name: string;
  code: string | null;
  section: string;
  misses: number;
  lastMissedAt: string;
  confidence: number;
  mastery: number;
};

export type SectionSummary = {
  section: string;
  label: string;
  misses: number;
  weakTopicCount: number;
  mastery: number;
};

export type DashboardSummary = {
  totalMistakes: number;
  recentMistakes: DashboardMistakeRow[];
  weakTopics: WeakTopic[];
  sections: SectionSummary[];
  readiness: number;
  todayRecommendation: string;
};

const sectionLabels: Record<string, string> = {
  chem_phys: "Chem/Phys",
  cars: "CARS",
  bio_biochem: "Bio/Biochem",
  psych_soc: "Psych/Soc",
};

const allSections = ["chem_phys", "cars", "bio_biochem", "psych_soc"];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function topicMasteryFromMisses(misses: number): number {
  // Mistake-only signal: more misses means lower mastery.
  // This is directional until practice mode adds correct-answer attempts.
  return clamp(85 - misses * 12, 0, 100);
}

function confidenceFromAttempts(attempts: number): number {
  return 1 - Math.exp(-attempts / 5);
}

export function buildDashboardSummary(rows: DashboardMistakeRow[]): DashboardSummary {
  const topicMap = new Map<string, WeakTopic>();
  const sectionMisses = new Map<string, number>();

  for (const section of allSections) {
    sectionMisses.set(section, 0);
  }

  for (const row of rows) {
    const question = row.question;
    if (!question) continue;

    sectionMisses.set(question.section, (sectionMisses.get(question.section) ?? 0) + 1);

    const topicId = question.topic_id ?? question.content_category_id ?? question.section;
    const topicName =
      question.topic?.name ??
      question.category?.name ??
      sectionLabels[question.section] ??
      "Uncategorized";
    const topicCode = question.topic?.code ?? question.category?.code ?? null;

    const current = topicMap.get(topicId);
    if (!current) {
      topicMap.set(topicId, {
        id: topicId,
        name: topicName,
        code: topicCode,
        section: question.section,
        misses: 1,
        lastMissedAt: row.logged_at,
        confidence: confidenceFromAttempts(1),
        mastery: topicMasteryFromMisses(1),
      });
    } else {
      const misses = current.misses + 1;
      current.misses = misses;
      current.confidence = confidenceFromAttempts(misses);
      current.mastery = topicMasteryFromMisses(misses);
      if (new Date(row.logged_at) > new Date(current.lastMissedAt)) {
        current.lastMissedAt = row.logged_at;
      }
    }
  }

  const weakTopics = [...topicMap.values()]
    .filter((topic) =>
      isWeak(topic.mastery, topic.confidence, topic.misses) || topic.misses >= 2,
    )
    .sort((a, b) => {
      if (b.misses !== a.misses) return b.misses - a.misses;
      return new Date(b.lastMissedAt).getTime() - new Date(a.lastMissedAt).getTime();
    })
    .slice(0, 5);

  const sections: SectionSummary[] = allSections.map((section) => {
    const misses = sectionMisses.get(section) ?? 0;
    const weakTopicCount = weakTopics.filter((topic) => topic.section === section).length;
    const mastery = clamp(90 - misses * 6, 0, 100);

    return {
      section,
      label: sectionLabels[section] ?? section,
      misses,
      weakTopicCount,
      mastery,
    };
  });

  const coveredSections = sections.filter((section) => section.misses > 0).length;
  const coverageRatio = coveredSections / allSections.length;
  const averageSectionMastery =
    sections.reduce((sum, section) => sum + section.mastery, 0) / sections.length;

  const readiness = Math.round(clamp(averageSectionMastery * (0.35 + coverageRatio * 0.65), 0, 100));

  const topWeakTopic = weakTopics[0];
  const todayRecommendation = topWeakTopic
    ? `Spend 30-45 minutes reviewing ${topWeakTopic.name}, then log any missed follow-up questions.`
    : rows.length > 0
      ? "Keep logging missed questions so stronger weakness patterns can emerge."
      : "Start by logging 3-5 missed questions from a real practice set.";

  return {
    totalMistakes: rows.length,
    recentMistakes: rows.slice(0, 7),
    weakTopics,
    sections,
    readiness,
    todayRecommendation,
  };
}

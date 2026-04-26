import { describe, expect, it } from "vitest";
import { buildDashboardSummary } from "@/lib/services/dashboard";

describe("dashboard summary", () => {
  it("builds a recommendation from repeated weak topic misses", () => {
    const rows = [
      {
        id: "1",
        logged_at: "2026-04-01T00:00:00.000Z",
        her_confidence: 3,
        time_spent_seconds: 90,
        question: {
          id: "q1",
          stem: "Question 1",
          section: "bio_biochem",
          difficulty: 3,
          topic_id: "topic-enzymes",
          content_category_id: "cat",
          source_material: "UWorld",
          topic: { id: "topic-enzymes", name: "Enzyme kinetics", code: "1A.1" },
          category: { id: "cat", name: "Proteins", code: "1A" },
        },
      },
      {
        id: "2",
        logged_at: "2026-04-02T00:00:00.000Z",
        her_confidence: 4,
        time_spent_seconds: 90,
        question: {
          id: "q2",
          stem: "Question 2",
          section: "bio_biochem",
          difficulty: 3,
          topic_id: "topic-enzymes",
          content_category_id: "cat",
          source_material: "UWorld",
          topic: { id: "topic-enzymes", name: "Enzyme kinetics", code: "1A.1" },
          category: { id: "cat", name: "Proteins", code: "1A" },
        },
      },
    ];

    const summary = buildDashboardSummary(rows);

    expect(summary.totalMistakes).toBe(2);
    expect(summary.weakTopics[0].name).toBe("Enzyme kinetics");
    expect(summary.todayRecommendation).toContain("Enzyme kinetics");
  });
});

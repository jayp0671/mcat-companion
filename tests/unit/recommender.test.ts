import { describe, expect, it } from "vitest";
import { rankTopics } from "@/lib/services/recommender";

describe("recommender", () => {
  it("prioritizes weaker topics", () => {
    const ranked = rankTopics([
      { id: "strong", mastery: 80, attempts: 6, daysSincePracticed: 2 },
      { id: "weak", mastery: 35, attempts: 4, daysSincePracticed: 2 }
    ]);
    expect(ranked[0].id).toBe("weak");
  });
});

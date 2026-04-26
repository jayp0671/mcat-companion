import { describe, expect, it } from "vitest";
import { masteryScore, isWeak } from "@/lib/services/mastery";

describe("mastery service", () => {
  it("returns zero confidence with no attempts", () => {
    expect(masteryScore([])).toEqual({ score: 0, confidence: 0, attempts: 0 });
  });
  it("flags weak topics only after enough signal", () => {
    expect(isWeak(40, 0.5, 3)).toBe(true);
    expect(isWeak(40, 0.2, 3)).toBe(false);
    expect(isWeak(70, 0.8, 8)).toBe(false);
  });
});

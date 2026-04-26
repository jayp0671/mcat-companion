import { describe, expect, it } from "vitest";
import { createMistakeSchema } from "@/lib/mistakes/validators";

describe("createMistakeSchema", () => {
  it("accepts a valid mistake log payload", () => {
    const parsed = createMistakeSchema.parse({
      stem: "Which amino acid side chain is most likely to be positively charged at physiological pH?",
      section: "bio_biochem",
      format: "discrete",
      difficulty: 3,
      her_selected_answer: "B",
      correct_answer: "D",
    });

    expect(parsed.section).toBe("bio_biochem");
    expect(parsed.difficulty).toBe(3);
  });

  it("rejects a too-short stem", () => {
    const result = createMistakeSchema.safeParse({
      stem: "short",
      section: "bio_biochem",
      her_selected_answer: "A",
      correct_answer: "B",
    });

    expect(result.success).toBe(false);
  });
});

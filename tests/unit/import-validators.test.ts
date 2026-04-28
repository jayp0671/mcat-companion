import { describe, expect, it } from "vitest";
import { importedMistakeDraftSchema } from "@/lib/ai/validators";

describe("importedMistakeDraftSchema", () => {
  it("accepts a parsed mistake draft", () => {
    const parsed = importedMistakeDraftSchema.parse({
      stem: "A protein mutation replaces lysine with glutamate. What happens to substrate binding?",
      passage: null,
      source_material: "Copied test text",
      section: "bio_biochem",
      format: "discrete",
      difficulty: 3,
      content_category_id: null,
      topic_id: null,
      subtopic_id: null,
      reasoning_skill_ids: [],
      choices: [
        { label: "A", text: "Choice A" },
        { label: "B", text: "Choice B" },
        { label: "C", text: "Choice C" },
        { label: "D", text: "Choice D" },
      ],
      her_selected_answer: "B",
      correct_answer: "C",
      parser_confidence: 0.8,
      needs_review: true,
      warnings: [],
    });

    expect(parsed.choices).toHaveLength(4);
    expect(parsed.correct_answer).toBe("C");
  });
});

import { describe, expect, it } from "vitest";
import { explanationSchema } from "@/lib/ai/validators";

describe("ai validators", () => {
  it("accepts a valid explanation", () => {
    const parsed = explanationSchema.parse({ correct_explanation: "Because...", distractor_explanations: { A: "x" }, key_concept: "Enzymes" });
    expect(parsed.key_concept).toBe("Enzymes");
  });
});

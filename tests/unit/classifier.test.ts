import { describe, expect, it } from "vitest";
import { MockProvider } from "@/lib/ai/mock";

describe("mock classifier", () => {
  it("returns nulls when uncertain", async () => {
    const result = await new MockProvider().classifyQuestion({ stem: "x", taxonomy: {} });
    expect(result.section).toBeNull();
  });
});

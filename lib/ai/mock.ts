import type { LLMProvider } from "./types";
export class MockProvider implements LLMProvider {
  async generateExplanation() { return { correct_explanation: "Mock explanation. Configure NVIDIA or Anthropic for real output.", distractor_explanations: { A: "Mock", B: "Mock", C: "Mock", D: "Mock" }, key_concept: "Mock concept" }; }
  async generateQuestion() { return [{ stem: "Mock MCAT-style question stem.", choices: [{ label: "A", text: "Choice A" }, { label: "B", text: "Choice B" }, { label: "C", text: "Choice C" }, { label: "D", text: "Choice D" }], correct_label: "A", brief_rationale: "Mock rationale.", suggested_tags: ["mock"] }]; }
  async classifyQuestion() { return { section: null, content_category_id: null, topic_id: null, reasoning_skills: [], difficulty: null, format: null }; }
  async diagnoseMistakes() { return { patterns: [], summary: "Log more mistakes to generate a useful pattern diagnosis." }; }
  async generatePlanNarrative(input: { blocks: unknown[] }) { return { blocks: input.blocks }; }
}

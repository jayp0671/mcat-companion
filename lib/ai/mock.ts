import type { LLMProvider, PlanInput } from "./types";

function assertTestOnly() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error(
      "MockProvider is test-only. Use LLM_PROVIDER=nvidia or LLM_PROVIDER=anthropic for live app usage.",
    );
  }
}

export class MockProvider implements LLMProvider {
  async generateExplanation() {
    assertTestOnly();
    return {
      correct_explanation: "Test-only explanation output.",
      distractor_explanations: {
        A: "Test-only distractor explanation A.",
        B: "Test-only distractor explanation B.",
        C: "Test-only distractor explanation C.",
        D: "Test-only distractor explanation D.",
      },
      key_concept: "Test-only key concept",
      common_misconception: "Test-only misconception",
    };
  }

  async generateQuestion() {
    assertTestOnly();
    return [
      {
        stem: "Test-only generated question stem.",
        choices: [
          { label: "A" as const, text: "Choice A", is_correct: true },
          { label: "B" as const, text: "Choice B" },
          { label: "C" as const, text: "Choice C" },
          { label: "D" as const, text: "Choice D" },
        ],
        correct_label: "A" as const,
        brief_rationale: "Test-only rationale.",
        suggested_tags: ["test-only"],
      },
    ];
  }


  async parseImportedMistake() {
    assertTestOnly();
    return {
      stem: "Test-only imported stem.",
      passage: null,
      source_material: "Test-only source",
      section: "bio_biochem" as const,
      format: "discrete" as const,
      difficulty: 3,
      content_category_id: null,
      topic_id: null,
      subtopic_id: null,
      reasoning_skill_ids: [],
      choices: [
        { label: "A" as const, text: "Choice A" },
        { label: "B" as const, text: "Choice B" },
        { label: "C" as const, text: "Choice C" },
        { label: "D" as const, text: "Choice D" },
      ],
      her_selected_answer: "B",
      correct_answer: "C",
      her_confidence: 3,
      time_spent_seconds: null,
      notes: "Test-only parsed notes.",
      parser_confidence: 0.9,
      needs_review: true,
      warnings: [],
    };
  }

  async classifyQuestion() {
    assertTestOnly();
    return {
      section: null,
      content_category_id: null,
      topic_id: null,
      subtopic_id: null,
      reasoning_skills: [],
      difficulty: null,
      format: null,
    };
  }

  async diagnoseMistakes() {
    assertTestOnly();
    return {
      patterns: [],
      summary: "Test-only diagnosis output.",
    };
  }

  async generatePlanNarrative(input: PlanInput) {
    assertTestOnly();
    return {
      narrative: "Test-only plan narrative.",
      blocks: input.blocks,
    };
  }
}

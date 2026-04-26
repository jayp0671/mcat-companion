"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Explanation = {
  correct_explanation: string;
  distractor_explanations?: Record<string, string>;
  key_concept: string;
  common_misconception?: string | null;
};

export function ExplainButton({ id, initialExplanation }: { id: string; initialExplanation?: Explanation | null }) {
  const [explanation, setExplanation] = useState<Explanation | null>(initialExplanation ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function explain() {
    setLoading(true);
    setError(null);
    const response = await fetch(`/api/mistakes/${id}/explain`, { method: "POST" });
    const result = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      setError(result?.error ?? "Could not generate explanation.");
      return;
    }

    setExplanation(result.explanation);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">AI explanation</h2>
          <p className="mt-1 text-sm text-slate-500">AI-generated. Cross-check with the official explanation when available.</p>
        </div>
        <Button type="button" onClick={explain} disabled={loading}>
          {loading ? "Explaining..." : explanation ? "Regenerate/check" : "Explain this"}
        </Button>
      </div>

      {error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {explanation ? (
        <div className="mt-5 space-y-4 text-sm text-slate-700">
          <div>
            <h3 className="font-semibold text-slate-950">Why the correct answer works</h3>
            <p className="mt-1 whitespace-pre-wrap">{explanation.correct_explanation}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-950">Key concept</h3>
            <p className="mt-1">{explanation.key_concept}</p>
          </div>
          {explanation.common_misconception ? (
            <div>
              <h3 className="font-semibold text-slate-950">Likely misconception</h3>
              <p className="mt-1">{explanation.common_misconception}</p>
            </div>
          ) : null}
          {explanation.distractor_explanations && Object.keys(explanation.distractor_explanations).length ? (
            <div>
              <h3 className="font-semibold text-slate-950">Distractor notes</h3>
              <ul className="mt-2 space-y-2">
                {Object.entries(explanation.distractor_explanations).map(([label, text]) => (
                  <li key={label} className="rounded-xl bg-slate-50 p-3"><span className="font-semibold">{label}.</span> {text}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

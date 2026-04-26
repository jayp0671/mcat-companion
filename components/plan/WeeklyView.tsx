"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

type Block = {
  id: string;
  date: string;
  duration_min: number;
  activity: string;
  topic_name?: string | null;
  description: string;
  completed?: boolean;
};

export function WeeklyView({ plan }: { plan?: any }) {
  const [currentPlan, setCurrentPlan] = useState(plan ?? null);
  const [loading, setLoading] = useState(false);
  const blocks: Block[] = currentPlan?.plan_data?.blocks ?? [];

  async function generate() {
    setLoading(true);
    const response = await fetch("/api/plan/generate", { method: "POST" });
    const result = await response.json();
    setLoading(false);
    if (response.ok) setCurrentPlan(result.plan);
  }

  async function toggle(block: Block) {
    if (!currentPlan) return;
    const next = !block.completed;
    setCurrentPlan({
      ...currentPlan,
      plan_data: { ...currentPlan.plan_data, blocks: blocks.map((b) => b.id === block.id ? { ...b, completed: next } : b) },
    });
    await fetch("/api/plan/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: currentPlan.id, block_id: block.id, completed: next }),
    });
  }

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>This week</CardTitle>
          <CardContent className="p-0">A rules-based plan generated from logged mistakes and weak topics.</CardContent>
        </div>
        <Button onClick={generate} disabled={loading}>{loading ? "Generating..." : currentPlan ? "Regenerate" : "Generate plan"}</Button>
      </div>

      {currentPlan?.plan_data?.narrative ? <p className="mt-4 text-sm text-slate-600">{currentPlan.plan_data.narrative}</p> : null}

      {blocks.length ? (
        <div className="mt-5 grid gap-3">
          {blocks.map((block) => (
            <button key={block.id} onClick={() => toggle(block)} className="rounded-xl border border-slate-200 bg-white p-4 text-left hover:bg-slate-50">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{block.date} · {block.topic_name ?? block.activity}</p>
                  <p className="mt-1 text-sm text-slate-600">{block.description}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${block.completed ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                  {block.completed ? "Done" : `${block.duration_min} min`}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          No plan yet. Generate one after logging a few mistakes.
        </div>
      )}
    </Card>
  );
}

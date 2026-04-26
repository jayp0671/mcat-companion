"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

export function ModePicker() {
  const router = useRouter();
  const [mode, setMode] = useState("mixed");
  const [count, setCount] = useState("10");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, count: Number(count) }),
    });
    const result = await response.json().catch(() => null);
    setLoading(false);
    if (!response.ok) {
      setError(result?.error ?? "Could not start practice session.");
      return;
    }
    router.push(`/practice/${result.session.id}`);
  }

  return (
    <Card>
      <CardTitle>Choose practice mode</CardTitle>
      <CardContent className="mt-2">AI-generated practice is supplementary. Use this only after real AAMC/UWorld review.</CardContent>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Mode
          <Select value={mode} onChange={(event) => setMode(event.target.value)} className="mt-2">
            <option value="mixed">Mixed approved questions</option>
            <option value="weakness">Weakness-focused</option>
            <option value="topic">Topic-specific</option>
            <option value="diagnostic">Diagnostic</option>
          </Select>
        </label>
        <label className="text-sm font-medium text-slate-700">Count
          <Select value={count} onChange={(event) => setCount(event.target.value)} className="mt-2">
            <option value="5">5</option><option value="10">10</option><option value="15">15</option>
          </Select>
        </label>
      </div>
      {error ? <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error}</p> : null}
      <Button className="mt-5" onClick={start} disabled={loading}>{loading ? "Starting..." : "Start practice"}</Button>
    </Card>
  );
}

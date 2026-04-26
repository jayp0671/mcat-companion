"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function OnboardingForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [priorAttempt, setPriorAttempt] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = {
      display_name: String(form.get("display_name") ?? "").trim(),
      target_test_date: String(form.get("target_test_date") ?? ""),
      target_score: form.get("target_score") ? Number(form.get("target_score")) : null,
      hours_per_week: Number(form.get("hours_per_week") ?? 20),
      prior_attempt: priorAttempt,
    };

    const response = await fetch("/api/me/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setLoading(false);
      setError(body.error ?? "Could not save onboarding details.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardTitle>Set up MCAT Companion</CardTitle>
      <CardContent className="mt-4">
        <form className="space-y-5" onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Name
            <Input className="mt-2" name="display_name" placeholder="Suhani" required />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Target test date
              <Input className="mt-2" name="target_test_date" type="date" required />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Target score
              <Input className="mt-2" name="target_score" type="number" min="472" max="528" placeholder="515" />
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Study hours per week
            <Input className="mt-2" name="hours_per_week" type="number" min="1" max="100" defaultValue="20" required />
          </label>

          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
              checked={priorAttempt}
              onChange={(event) => setPriorAttempt(event.target.checked)}
            />
            This is a retake attempt
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Finish setup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

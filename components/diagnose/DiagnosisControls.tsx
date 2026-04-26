"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DiagnosisControls() {
  const [loading, setLoading] = useState(false);
  async function run() {
    setLoading(true);
    const response = await fetch("/api/diagnose", { method: "POST" });
    setLoading(false);
    if (response.ok) window.location.reload();
  }
  return <Button onClick={run} disabled={loading}>{loading ? "Analyzing..." : "Generate diagnosis report"}</Button>;
}

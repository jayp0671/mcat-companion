"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function GenerationForm() {
  const [topicName, setTopicName] = useState("amino acids");
  const [section, setSection] = useState("bio_biochem");
  const [difficulty, setDifficulty] = useState("3");
  const [count, setCount] = useState("3");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function generate() {
    setLoading(true); setMessage(null);
    const response = await fetch("/api/admin/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topicName, section, difficulty: Number(difficulty), count: Number(count) }) });
    const result = await response.json().catch(() => null);
    setLoading(false);
    setMessage(response.ok ? `Created ${result.created?.length ?? 0} pending questions.` : result?.error ?? "Generation failed.");
  }
  return <Card><CardTitle>Generate AI question drafts</CardTitle><CardContent className="mt-2">Drafts are pending until approved. They are supplementary and unverified.</CardContent><div className="mt-5 grid gap-3 sm:grid-cols-2"><Input value={topicName} onChange={(e)=>setTopicName(e.target.value)} /><Select value={section} onChange={(e)=>setSection(e.target.value)}><option value="bio_biochem">Bio/Biochem</option><option value="chem_phys">Chem/Phys</option><option value="psych_soc">Psych/Soc</option><option value="cars">CARS</option></Select><Select value={difficulty} onChange={(e)=>setDifficulty(e.target.value)}><option value="1">Difficulty 1</option><option value="2">Difficulty 2</option><option value="3">Difficulty 3</option><option value="4">Difficulty 4</option><option value="5">Difficulty 5</option></Select><Select value={count} onChange={(e)=>setCount(e.target.value)}><option value="1">1 question</option><option value="3">3 questions</option><option value="5">5 questions</option></Select></div><Button className="mt-5" onClick={generate} disabled={loading}>{loading ? "Generating..." : "Generate drafts"}</Button>{message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}</Card>;
}

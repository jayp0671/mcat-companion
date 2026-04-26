"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DifficultySelector } from "@/components/shared/DifficultySelector";
import { mcatSections } from "@/lib/constants";

const draftKey = "mcat-companion:mistake-draft";

export function MistakeForm() {
  const [stem, setStem] = useState("");
  useEffect(() => { const saved = localStorage.getItem(draftKey); if (saved) setStem(saved); }, []);
  useEffect(() => { const t = setTimeout(() => localStorage.setItem(draftKey, stem), 500); return () => clearTimeout(t); }, [stem]);
  return <Card><CardContent><form className="space-y-4">
    <label className="block text-sm font-medium">Question stem<Textarea value={stem} onChange={(e) => setStem(e.target.value)} name="stem" placeholder="Paste or summarize the missed question..." /></label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Your answer<Input name="her_answer" placeholder="A" /></label><label className="text-sm font-medium">Correct answer<Input name="correct_answer" placeholder="C" /></label></div>
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Source<Input name="source_material" placeholder="AAMC FL1 #23" /></label><label className="text-sm font-medium">Section<Select name="section">{mcatSections.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</Select></label></div>
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Topic<Input name="topic" placeholder="e.g. Amino acids" /></label><label className="text-sm font-medium">Difficulty<DifficultySelector /></label></div>
    <label className="block text-sm font-medium">Notes<Textarea name="notes" placeholder="Why do you think you missed it?" /></label>
    <div className="sticky bottom-3 flex gap-2 rounded-2xl bg-white/90 p-2 backdrop-blur"><Button type="button">Save mistake</Button><Button type="button" variant="outline">Save and log another</Button></div>
  </form></CardContent></Card>;
}

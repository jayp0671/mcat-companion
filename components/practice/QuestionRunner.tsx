"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { AiBadge } from "@/components/practice/AiBadge";

type Choice = { id: string; label: string; text: string; is_correct?: boolean; position: number };
type Item = { question: { id: string; stem: string; passage?: string | null; choices: Choice[] } };

export function QuestionRunner({ sessionId }: { sessionId: string }) {
  const [item, setItem] = useState<Item | null>(null);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function loadNext() {
    setFeedback(null);
    const response = await fetch(`/api/sessions/${sessionId}/next`);
    const result = await response.json();
    if (result.done) { setDone(true); setItem(null); return; }
    setItem(result.item);
  }

  useEffect(() => { loadNext(); }, []);

  async function answer(choice: Choice) {
    const response = await fetch("/api/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, choice_id: choice.id, confidence: 3 }),
    });
    const result = await response.json();
    setFeedback(result.is_correct ? "Correct" : "Not quite. Review the explanation and log it if needed.");
    setTimeout(loadNext, 800);
  }

  if (done) return <Card><CardTitle>Session complete</CardTitle><CardContent>Nice work. Review any misses and log patterns you notice.</CardContent></Card>;
  if (!item) return <Card><CardContent>Loading question...</CardContent></Card>;
  const choices = [...(item.question.choices ?? [])].sort((a, b) => a.position - b.position);

  return (
    <Card>
      <div className="flex items-center justify-between gap-3"><CardTitle>Practice question</CardTitle><AiBadge /></div>
      {item.question.passage ? <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">{item.question.passage}</p> : null}
      <p className="mt-4 whitespace-pre-wrap text-sm text-slate-800">{item.question.stem}</p>
      <div className="mt-5 grid gap-3">
        {choices.map((choice) => <Button key={choice.id} variant="outline" className="justify-start text-left" onClick={() => answer(choice)}>{choice.label}. {choice.text}</Button>)}
      </div>
      {feedback ? <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{feedback}</p> : null}
    </Card>
  );
}

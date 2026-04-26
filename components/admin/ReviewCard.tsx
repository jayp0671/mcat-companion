"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ReviewCard({ question }: { question: any }) {
  const [status, setStatus] = useState(question.review_status);
  async function update(review_status: string) {
    const response = await fetch(`/api/admin/queue/${question.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ review_status }) });
    if (response.ok) setStatus(review_status);
  }
  return <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{status}</span><span className="text-xs text-slate-500">{question.section}</span></div><p className="mt-4 whitespace-pre-wrap text-sm text-slate-800">{question.stem}</p><div className="mt-4 space-y-2">{(question.choices ?? []).sort((a:any,b:any)=>a.position-b.position).map((choice:any)=><div key={choice.id} className="rounded-xl bg-slate-50 p-2 text-sm"><strong>{choice.label}.</strong> {choice.text}{choice.is_correct ? " ✓" : ""}</div>)}</div><div className="mt-4 flex gap-2"><Button onClick={()=>update("approved")}>Approve</Button><Button variant="outline" onClick={()=>update("rejected")}>Reject</Button></div></div>;
}

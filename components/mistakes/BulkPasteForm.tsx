"use client";

import { useState } from "react";

export function BulkPasteForm() {
  const [rawText, setRawText] = useState("");
  const [previews, setPreviews] = useState<Array<{ id: string; raw: string }>>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function preview() {
    const response = await fetch("/api/mistakes/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_text: rawText }),
    });

    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Could not parse bulk paste.");
      return;
    }

    setPreviews(payload.previews ?? []);
    setMessage(payload.message ?? null);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Bulk paste preview</h2>
      <p className="mt-2 text-sm text-slate-500">
        Phase 3 keeps bulk parsing conservative. Paste a line per missed question and review the
        preview before turning them into full entries.
      </p>
      <textarea
        className="mt-4 min-h-32 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        value={rawText}
        onChange={(event) => setRawText(event.target.value)}
        placeholder="Example: AAMC FL1 #23 - missed amino acid charge question, chose B, correct D"
      />
      <button
        type="button"
        onClick={preview}
        className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Preview bulk paste
      </button>
      {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
      {previews.length > 0 ? (
        <div className="mt-4 space-y-2">
          {previews.map((previewItem) => (
            <div key={previewItem.id} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
              {previewItem.raw}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

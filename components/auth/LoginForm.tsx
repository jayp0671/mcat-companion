"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error ?? "Could not send magic link.");
      return;
    }

    setStatus("sent");
    setMessage("Check your email for the login link.");
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <label className="block text-sm font-medium text-slate-700">
        Email
        <Input
          className="mt-2"
          name="email"
          type="email"
          placeholder="student@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <Button type="submit" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : "Send magic link"}
      </Button>
      {message ? (
        <p className={status === "error" ? "text-sm text-red-600" : "text-sm text-emerald-700"}>
          {message}
        </p>
      ) : null}
    </form>
  );
}

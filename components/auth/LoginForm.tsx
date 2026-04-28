"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const REMEMBERED_EMAIL_KEY = "mcat-companion-remembered-email";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [rememberEmail, setRememberEmail] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const rememberedEmail = window.localStorage.getItem(REMEMBERED_EMAIL_KEY);

    if (rememberedEmail) {
      setEmail(rememberedEmail);
    }
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (rememberEmail) {
      window.localStorage.setItem(REMEMBERED_EMAIL_KEY, normalizedEmail);
    } else {
      window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }

    const response = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error ?? "Could not send magic link.");
      return;
    }

    setStatus("sent");
    setMessage("Check your email for the login link. After login, this browser should stay signed in.");
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

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={rememberEmail}
          onChange={(event) => setRememberEmail(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        Remember this email on this browser
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

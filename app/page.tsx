import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <div className="max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-600">MCAT Companion</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Track mistakes, find patterns, and know what to study next.
        </h1>
        <p className="mt-6 text-lg text-slate-600">
          A reliability-first personal prep dashboard that complements AAMC, UWorld, and Anki. It is not a replacement for official prep materials.
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild><Link href="/login">Login</Link></Button>
          <Button asChild variant="outline"><Link href="/dashboard">Preview dashboard</Link></Button>
        </div>
      </div>
    </main>
  );
}

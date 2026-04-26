import Link from "next/link";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const nav = [
  ["/dashboard", "Dashboard"],
  ["/log/new", "Log mistake"],
  ["/log", "Mistakes"],
  ["/practice", "Practice"],
  ["/plan", "Plan"],
  ["/diagnose", "Diagnose"],
  ["/settings", "Settings"],
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4">
          <Link href="/dashboard" className="mr-4 font-bold text-slate-950">
            MCAT Companion
          </Link>
          {nav.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              {label}
            </Link>
          ))}
        </div>
      </aside>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}

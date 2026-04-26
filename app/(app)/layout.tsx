import Link from "next/link";

const nav = [
  ["/dashboard", "Dashboard"],
  ["/log/new", "Log mistake"],
  ["/log", "Mistakes"],
  ["/practice", "Practice"],
  ["/plan", "Plan"],
  ["/diagnose", "Diagnose"],
  ["/settings", "Settings"]
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <aside className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4">
          <Link href="/dashboard" className="mr-4 font-bold">MCAT Companion</Link>
          {nav.map(([href, label]) => <Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">{label}</Link>)}
        </div>
      </aside>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}

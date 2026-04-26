import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-sm font-bold tracking-tight text-slate-950">
            MCAT Companion
          </Link>
          <nav className="flex items-center gap-3 text-sm font-medium text-slate-600">
            <Link href="/dashboard" className="hover:text-slate-950">
              Dashboard
            </Link>
            <Link href="/log" className="hover:text-slate-950">
              Mistakes
            </Link>
            <Link href="/practice" className="hover:text-slate-950">
              Practice
            </Link>
            <Link href="/diagnose" className="hover:text-slate-950">
              Diagnose
            </Link>
            <Link href="/plan" className="hover:text-slate-950">
              Plan
            </Link>
            <Link href="/settings" className="hover:text-slate-950">
              Settings
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

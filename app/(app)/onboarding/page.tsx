import { redirect } from "next/navigation";
import { getProfile, requireUser } from "@/lib/auth/session";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  if (profile?.onboarded_at) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Phase 2</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">One quick setup</h1>
        <p className="mt-2 text-slate-600">
          These details power the dashboard, days-to-exam card, and future recommendations.
        </p>
      </div>
      <OnboardingForm />
    </div>
  );
}

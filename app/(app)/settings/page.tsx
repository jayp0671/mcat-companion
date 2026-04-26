import { getProfile, requireUser } from "@/lib/auth/session";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-600">Profile and privacy controls will expand here.</p>
      </div>
      <Card>
        <CardTitle>Current profile</CardTitle>
        <CardContent className="mt-4 space-y-2 text-sm text-slate-600">
          <p>Email: {user.email}</p>
          <p>Name: {profile?.display_name ?? "Not set"}</p>
          <p>Target date: {profile?.target_test_date ?? "Not set"}</p>
          <p>Target score: {profile?.target_score ?? "Not set"}</p>
          <p>Hours/week: {profile?.hours_per_week ?? "Not set"}</p>
        </CardContent>
      </Card>
    </div>
  );
}

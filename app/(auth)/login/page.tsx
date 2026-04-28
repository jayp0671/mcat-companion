import { redirect } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { getUser } from "@/lib/auth/session";

export default async function LoginPage() {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full">
        <CardTitle>Login</CardTitle>
        <CardContent className="mt-4">
          <LoginForm />
          <p className="mt-4 text-xs text-slate-500">
            You should stay signed in on this browser. If your session expires, Supabase will refresh it automatically.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

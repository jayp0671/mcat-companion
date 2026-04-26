import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full">
        <CardTitle>Login</CardTitle>
        <CardContent className="mt-4">
          <LoginForm />
          <p className="mt-4 text-xs text-slate-500">
            Use the email account that should have access to MCAT Companion. Supabase will send a magic link.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

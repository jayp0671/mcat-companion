import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full"><CardTitle>Login</CardTitle><CardContent className="mt-4">
        <form className="space-y-4" action="/api/auth/magic-link" method="post">
          <label className="block text-sm font-medium">Email<Input name="email" type="email" placeholder="student@example.com" required /></label>
          <Button type="submit" className="w-full">Send magic link</Button>
        </form>
        <p className="mt-4 text-xs text-slate-500">Supabase magic link wiring is scaffolded. Add credentials before using auth.</p>
      </CardContent></Card>
    </main>
  );
}

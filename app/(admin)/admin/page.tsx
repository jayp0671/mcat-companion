import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <Card>
      <CardTitle>Admin</CardTitle>
      <CardContent className="mt-3 space-y-3">
        <p>Admin tools for AI-generated practice drafts and generation logs.</p>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-xl border px-4 py-2 text-sm font-medium" href="/admin/queue">Review queue</Link>
          <Link className="rounded-xl border px-4 py-2 text-sm font-medium" href="/admin/generate">Generate drafts</Link>
          <Link className="rounded-xl border px-4 py-2 text-sm font-medium" href="/admin/logs">AI logs</Link>
        </div>
      </CardContent>
    </Card>
  );
}

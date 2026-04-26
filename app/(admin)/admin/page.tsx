import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
export default function AdminPage() { return <Card><CardTitle>Admin</CardTitle><CardContent className="space-y-2"><p>Password-gated admin scaffold.</p><Link className="text-blue-600" href="/admin/queue">Review queue</Link></CardContent></Card>; }

import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
export function MistakeList() { return <Card><CardTitle>Logged mistakes</CardTitle><CardContent><p>No mistakes yet.</p><Link href="/log/new" className="mt-3 inline-block text-blue-600">Log your first mistake</Link></CardContent></Card>; }

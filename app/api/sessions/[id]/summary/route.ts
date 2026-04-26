import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ ok: true, route: "/api/sessions/[id]/summary", id: params.id, status: "scaffolded" });
}
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ ok: true, route: "/api/sessions/[id]/summary", id: params.id, status: "scaffolded", body });
}
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ ok: true, route: "/api/sessions/[id]/summary", id: params.id, status: "scaffolded", body });
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ ok: true, route: "/api/sessions/[id]/summary", id: params.id, status: "scaffolded" });
}

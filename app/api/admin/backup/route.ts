import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/admin/backup", status: "scaffolded" });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ ok: true, route: "/api/admin/backup", status: "scaffolded", body });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ ok: true, route: "/api/admin/backup", status: "scaffolded", body });
}

export async function DELETE() {
  return NextResponse.json({ ok: true, route: "/api/admin/backup", status: "scaffolded" });
}

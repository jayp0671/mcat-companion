import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ ok: true, message: "Manual backup hook placeholder. Use GitHub Actions nightly backup for production." });
}

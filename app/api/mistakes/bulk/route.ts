import { NextResponse, type NextRequest } from "next/server";
import { bulkMistakePreviewSchema } from "@/lib/mistakes/validators";

export async function POST(request: NextRequest) {
  const json = await request.json();
  const parsed = bulkMistakePreviewSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Paste text is required.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const lines = parsed.data.raw_text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const previews = lines.map((line, index) => ({
    id: `preview-${index + 1}`,
    raw: line,
    suggested_source_material: "",
    suggested_stem: line,
    needs_review: true,
  }));

  return NextResponse.json({
    previews,
    message:
      "Bulk parsing is intentionally conservative for Phase 3. Review each preview before saving.",
  });
}

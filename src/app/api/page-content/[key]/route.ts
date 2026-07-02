import { db } from "@/lib/db";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/session";

// PUT /api/page-content/[key] - admin upsert content by key
export async function PUT(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { key } = await params;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return errorResponse("بدنه نامعتبر", 400);
  }

  const value = typeof body.value === "string" ? body.value.slice(0, 50000) : "";
  if (!key || key.length > 100) return errorResponse("کلید نامعتبر", 400);

  const record = await db.pageContent.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  return jsonResponse(record);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { key } = await params;
  try {
    await db.pageContent.delete({ where: { key } });
    return jsonResponse({ success: true });
  } catch (e: any) {
    if (e?.code === "P2025") return errorResponse("یافت نشد", 404);
    return errorResponse("خطا در حذف", 500);
  }
}

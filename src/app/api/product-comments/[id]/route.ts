import { db } from "@/lib/db";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/session";

// PUT /api/product-comments/[id] - admin update status
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("بدنه نامعتبر", 400); }

  const data: any = {};
  if (body.status && ["PENDING", "APPROVED", "REJECTED"].includes(body.status)) {
    data.status = body.status;
    data.active = body.status === "APPROVED";
  }
  try {
    const c = await db.productComment.update({ where: { id }, data });
    return jsonResponse(c);
  } catch (e: any) {
    if (e?.code === "P2025") return errorResponse("نظر یافت نشد", 404);
    return errorResponse("خطا", 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    await db.productComment.delete({ where: { id } });
    return jsonResponse({ success: true });
  } catch (e: any) {
    if (e?.code === "P2025") return errorResponse("نظر یافت نشد", 404);
    return errorResponse("خطا در حذف", 500);
  }
}

import { db } from "@/lib/db";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/session";

// PUT /api/testimonials/[id] - admin update status (approve/reject) or toggle active
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return errorResponse("بدنه نامعتبر", 400);
  }

  const data: any = {};
  if (body.status && ["PENDING", "APPROVED", "REJECTED"].includes(body.status)) {
    data.status = body.status;
    data.active = body.status === "APPROVED";
  }
  if (typeof body.active === "boolean") data.active = body.active;
  if (typeof body.rating === "number" && body.rating >= 1 && body.rating <= 5) data.rating = body.rating;
  if (typeof body.comment === "string" && body.comment.length <= 1000) data.comment = body.comment.trim();
  if (typeof body.name === "string" && body.name.length <= 100) data.name = body.name.trim();

  try {
    const t = await db.testimonial.update({ where: { id }, data });
    return jsonResponse(t);
  } catch (e: any) {
    if (e?.code === "P2025") return errorResponse("نظر یافت نشد", 404);
    return errorResponse("خطا در به‌روزرسانی", 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    await db.testimonial.delete({ where: { id } });
    return jsonResponse({ success: true });
  } catch (e: any) {
    if (e?.code === "P2025") return errorResponse("نظر یافت نشد", 404);
    return errorResponse("خطا در حذف", 500);
  }
}

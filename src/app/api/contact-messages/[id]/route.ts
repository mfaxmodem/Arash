import { db } from "@/lib/db";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/session";

// PUT /api/contact-messages/[id] - update status
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
  if (body.status && ["NEW", "READ", "REPLIED"].includes(body.status)) data.status = body.status;

  try {
    const msg = await db.contactMessage.update({ where: { id }, data });
    return jsonResponse(msg);
  } catch (e: any) {
    if (e?.code === "P2025") return errorResponse("پیام یافت نشد", 404);
    return errorResponse("خطا", 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    await db.contactMessage.delete({ where: { id } });
    return jsonResponse({ success: true });
  } catch (e: any) {
    if (e?.code === "P2025") return errorResponse("پیام یافت نشد", 404);
    return errorResponse("خطا در حذف", 500);
  }
}

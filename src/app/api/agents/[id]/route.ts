import { db } from "@/lib/db";
import { requireAdmin, validateBody, jsonResponse, errorResponse } from "@/lib/session";
import { agentSchema } from "@/lib/validations";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = await validateBody(req, agentSchema);
  if (!body.ok) return body.response;
  try {
    const agent = await db.agent.update({ where: { id }, data: body.data });
    return jsonResponse(agent);
  } catch (e: any) {
    if (e?.code === "P2025") return errorResponse("نماینده یافت نشد", 404);
    return errorResponse("خطا در به‌روزرسانی", 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    await db.agent.delete({ where: { id } });
    return jsonResponse({ success: true });
  } catch (e: any) {
    if (e?.code === "P2025") return errorResponse("نماینده یافت نشد", 404);
    return errorResponse("خطا در حذف", 500);
  }
}

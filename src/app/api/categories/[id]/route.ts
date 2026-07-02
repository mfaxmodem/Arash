import { db } from "@/lib/db";
import { requireAdmin, validateBody, jsonResponse, errorResponse } from "@/lib/session";
import { categorySchema } from "@/lib/validations";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = await validateBody(req, categorySchema);
  if (!body.ok) return body.response;
  try {
    const cat = await db.category.update({ where: { id }, data: body.data });
    return jsonResponse(cat);
  } catch (e: any) {
    if (e?.code === "P2025") return errorResponse("دسته یافت نشد", 404);
    return errorResponse("خطا در به‌روزرسانی", 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const count = await db.product.count({ where: { categoryId: id } });
  if (count > 0) return errorResponse("این دسته دارای محصول است و قابل حذف نیست", 409);
  try {
    await db.category.delete({ where: { id } });
    return jsonResponse({ success: true });
  } catch (e: any) {
    if (e?.code === "P2025") return errorResponse("دسته یافت نشد", 404);
    return errorResponse("خطا در حذف", 500);
  }
}

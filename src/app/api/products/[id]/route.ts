import { db } from "@/lib/db";
import { requireAdmin, validateBody, jsonResponse, errorResponse } from "@/lib/session";
import { productSchema } from "@/lib/validations";
import { localizeItem, LOCALIZABLE } from "@/lib/localize";
import type { Locale } from "@/i18n";

// GET /api/products/[id]
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const lang = (searchParams.get("lang") || "fa") as Locale;

  const product = await db.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) return errorResponse("محصول یافت نشد", 404);

  // Apply localization
  let result = localizeItem(product, LOCALIZABLE.product, lang);
  if (result.category) {
    result = { ...result, category: localizeItem(result.category, LOCALIZABLE.category, lang) };
  }

  return jsonResponse(result);
}

// PUT /api/products/[id] - admin update
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await validateBody(req, productSchema);
  if (!body.ok) return body.response;

  try {
    const product = await db.product.update({ where: { id }, data: body.data });
    return jsonResponse(product);
  } catch (e: any) {
    if (e?.code === "P2002") return errorResponse("این اسلاگ قبلاً استفاده شده است", 409);
    if (e?.code === "P2025") return errorResponse("محصول یافت نشد", 404);
    return errorResponse("خطا در به‌روزرسانی", 500);
  }
}

// DELETE /api/products/[id] - admin delete
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  try {
    await db.product.delete({ where: { id } });
    return jsonResponse({ success: true });
  } catch (e: any) {
    if (e?.code === "P2025") return errorResponse("محصول یافت نشد", 404);
    return errorResponse("خطا در حذف", 500);
  }
}

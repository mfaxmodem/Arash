import { db } from "@/lib/db";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/session";

// GET /api/product-comments - admin list (all or by product)
export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;

  const where: any = {};
  if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) where.status = status;

  const items = await db.productComment.findMany({
    where,
    include: { product: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return jsonResponse({ items });
}

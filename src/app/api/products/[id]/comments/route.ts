import { db } from "@/lib/db";
import { validateBody, jsonResponse, errorResponse } from "@/lib/session";
import { productCommentSchema } from "@/lib/validations";

// GET /api/products/[id]/comments - approved comments for a product
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product) return errorResponse("محصول یافت نشد", 404);
  const items = await db.productComment.findMany({
    where: { productId: id, status: "APPROVED", active: true },
    orderBy: { createdAt: "desc" },
  });
  return jsonResponse({ items });
}

// POST /api/products/[id]/comments - public submit (pending approval)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product) return errorResponse("محصول یافت نشد", 404);

  const body = await validateBody(req, productCommentSchema);
  if (!body.ok) return body.response;

  const c = await db.productComment.create({
    data: {
      productId: id,
      name: body.data.name,
      rating: body.data.rating,
      comment: body.data.comment,
      status: "PENDING",
      active: false,
    },
  });
  return jsonResponse(
    { success: true, message: "نظر شما ثبت شد و پس از تایید نمایش داده می‌شود", id: c.id },
    201
  );
}

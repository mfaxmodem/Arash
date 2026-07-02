import { db } from "@/lib/db";
import { requireAdmin, validateBody, jsonResponse, errorResponse } from "@/lib/session";
import { blogPostSchema } from "@/lib/validations";

// GET /api/blog/[id] - public single post (by id or slug)
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let post = await db.blogPost.findUnique({ where: { id } });
  if (!post) {
    // try by slug
    post = await db.blogPost.findUnique({ where: { slug: id } });
  }
  if (!post) return errorResponse("مقاله یافت نشد", 404);
  if (!post.published) {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
  }
  return jsonResponse(post);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = await validateBody(req, blogPostSchema);
  if (!body.ok) return body.response;
  try {
    const post = await db.blogPost.update({ where: { id }, data: body.data });
    return jsonResponse(post);
  } catch (e: any) {
    if (e?.code === "P2002") return errorResponse("این اسلاگ قبلاً استفاده شده است", 409);
    if (e?.code === "P2025") return errorResponse("مقاله یافت نشد", 404);
    return errorResponse("خطا در به‌روزرسانی", 500);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    await db.blogPost.delete({ where: { id } });
    return jsonResponse({ success: true });
  } catch (e: any) {
    if (e?.code === "P2025") return errorResponse("مقاله یافت نشد", 404);
    return errorResponse("خطا در حذف", 500);
  }
}

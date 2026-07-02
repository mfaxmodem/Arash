import { db } from "@/lib/db";
import { requireAdmin, validateBody, jsonResponse, errorResponse } from "@/lib/session";
import { blogPostSchema } from "@/lib/validations";

// GET /api/blog - public published posts (or all for admin with ?all=true)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";

  if (all) {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    const items = await db.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });
    return jsonResponse({ items });
  }

  const items = await db.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });
  return jsonResponse({ items });
}

// POST /api/blog - admin create
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const body = await validateBody(req, blogPostSchema);
  if (!body.ok) return body.response;
  try {
    const post = await db.blogPost.create({ data: body.data });
    return jsonResponse(post, 201);
  } catch (e: any) {
    if (e?.code === "P2002") return errorResponse("این اسلاگ قبلاً استفاده شده است", 409);
    return errorResponse("خطا در ایجاد مقاله", 500);
  }
}

import { db } from "@/lib/db";
import { requireAdmin, validateBody, jsonResponse, errorResponse } from "@/lib/session";
import { categorySchema } from "@/lib/validations";

// GET /api/categories - public list (all, including inactive for nav)
export async function GET() {
  const items = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: { where: { active: true } } } } },
  });
  return jsonResponse({ items });
}

// POST /api/categories - admin create
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await validateBody(req, categorySchema);
  if (!body.ok) return body.response;

  try {
    const cat = await db.category.create({ data: body.data });
    return jsonResponse(cat, 201);
  } catch (e: any) {
    if (e?.code === "P2002") return errorResponse("این اسلاگ قبلاً استفاده شده است", 409);
    return errorResponse("خطا در ایجاد دسته", 500);
  }
}

import { db } from "@/lib/db";
import { requireAdmin, validateBody, jsonResponse, errorResponse } from "@/lib/session";
import { testimonialSchema } from "@/lib/validations";

// GET /api/testimonials - public approved testimonials (or all for admin with ?all=true)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";

  if (all) {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    const items = await db.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    });
    return jsonResponse({ items });
  }

  const items = await db.testimonial.findMany({
    where: { status: "APPROVED", active: true },
    orderBy: { createdAt: "desc" },
  });
  return jsonResponse({ items });
}

// POST /api/testimonials - public submit (pending approval)
export async function POST(req: Request) {
  const body = await validateBody(req, testimonialSchema);
  if (!body.ok) return body.response;

  const t = await db.testimonial.create({
    data: { ...body.data, status: "PENDING", active: false },
  });
  return jsonResponse(
    { success: true, message: "نظر شما ثبت شد و پس از تایید نمایش داده می‌شود", id: t.id },
    201
  );
}

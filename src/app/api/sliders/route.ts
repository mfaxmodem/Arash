import { db } from "@/lib/db";
import { requireAdmin, validateBody, jsonResponse, errorResponse } from "@/lib/session";
import { sliderSchema } from "@/lib/validations";

// GET /api/sliders - public active sliders
export async function GET() {
  const items = await db.slider.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return jsonResponse({ items });
}

// POST /api/sliders - admin create
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const body = await validateBody(req, sliderSchema);
  if (!body.ok) return body.response;
  const slider = await db.slider.create({ data: body.data });
  return jsonResponse(slider, 201);
}

import { db } from "@/lib/db";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/session";

// GET /api/contact-messages - admin list
export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;

  const where: any = {};
  if (status && ["NEW", "READ", "REPLIED"].includes(status)) where.status = status;

  const items = await db.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return jsonResponse({ items });
}

import { db } from "@/lib/db";
import { requireAdmin, jsonResponse, errorResponse } from "@/lib/session";

// GET /api/page-content - public: returns all content as key->value map
// admin (?all=true) returns full records
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";

  if (all) {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    const items = await db.pageContent.findMany({ orderBy: { key: "asc" } });
    return jsonResponse({ items });
  }

  const items = await db.pageContent.findMany();
  const map: Record<string, string> = {};
  for (const it of items) map[it.key] = it.value;
  return jsonResponse({ content: map });
}

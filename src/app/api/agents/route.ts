import { db } from "@/lib/db";
import { requireAdmin, validateBody, jsonResponse, errorResponse } from "@/lib/session";
import { agentSchema } from "@/lib/validations";

// GET /api/agents - public active agents
export async function GET() {
  const items = await db.agent.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return jsonResponse({ items });
}

// POST /api/agents - admin create
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const body = await validateBody(req, agentSchema);
  if (!body.ok) return body.response;
  const agent = await db.agent.create({ data: body.data });
  return jsonResponse(agent, 201);
}

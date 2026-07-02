import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { jsonResponse } from "@/lib/session";

// GET /api/me - current session status
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return jsonResponse({ authenticated: false });
  }
  return jsonResponse({
    authenticated: true,
    user: {
      email: session.user.email,
      name: session.user.name,
      role: (session.user as any).role,
    },
  });
}

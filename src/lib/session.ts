import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// ===== Role-Based Access Control (OWASP A01 - Broken Access Control) =====

export async function getAuthSession() {
  return getServerSession(authOptions);
}

/** Require an authenticated admin/editor; returns 401 JSON if not. */
export async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "احراز هویت نشده‌اید" },
        { status: 401 }
      ),
    };
  }
  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "EDITOR") {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      ),
    };
  }
  return { ok: true as const, session, role: role as string };
}

/** Parse & validate JSON body with a zod schema. */
export async function validateBody<T>(
  req: Request,
  schema: { safeParse: (d: unknown) => { success: boolean; data?: T; error?: any } }
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues?.[0];
      return {
        ok: false,
        response: NextResponse.json(
          {
            error: firstError?.message || "داده ورودی نامعتبر است",
            details: result.error.issues.map((i: any) => ({
              path: i.path.join("."),
              message: i.message,
            })),
          },
          { status: 400 }
        ),
      };
    }
    return { ok: true, data: result.data as T };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "بدنه درخواست نامعتبر است" },
        { status: 400 }
      ),
    };
  }
}

/** Standard JSON response with security headers. */
export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Cache-Control": "no-store",
    },
  });
}

/** Standard error response. */
export function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
      },
    }
  );
}

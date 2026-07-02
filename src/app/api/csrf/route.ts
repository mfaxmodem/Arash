import { generateCsrfToken, CSRF_COOKIE_NAME } from "@/lib/csrf";
import { jsonResponse } from "@/lib/session";

// GET /api/csrf - issue a CSRF token via cookie
export async function GET() {
  const token = generateCsrfToken();
  const res = jsonResponse({ token });
  res.headers.set(
    "Set-Cookie",
    `${CSRF_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`
  );
  return res;
}

import crypto from "crypto";

// ===== CSRF Token Utilities (OWASP A01 - Broken Access Control) =====
// Double-submit cookie pattern for CSRF protection.
// NextAuth already protects auth endpoints; this protects our custom mutations.

const CSRF_COOKIE = "csrf_token";
const TOKEN_BYTES = 32;

export function generateCsrfToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex");
}

export const CSRF_COOKIE_NAME = CSRF_COOKIE;

/** Verify that the submitted token matches the cookie token (constant-time). */
export function verifyCsrfToken(cookieToken: string | null, headerToken: string | null): boolean {
  if (!cookieToken || !headerToken) return false;
  if (cookieToken.length !== headerToken.length) return false;
  return crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));
}

/** Set CSRF cookie on a response. */
export function setCsrfCookie(token: string): string {
  return `${CSRF_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

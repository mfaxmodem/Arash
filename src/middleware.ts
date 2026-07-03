import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["fa", "en", "ar"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip: API, admin, static files, uploads, images, _next
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/uploads/") ||
    pathname.startsWith("/images/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if pathname already has a locale prefix
  const segments = pathname.split("/");
  const firstSegment = segments[1];

  if (LOCALES.includes(firstSegment)) {
    // Already has locale — continue
    return NextResponse.next();
  }

  // No locale prefix — ALWAYS redirect to /fa (ignore Accept-Language)
  const newUrl = new URL(`/fa${pathname}`, request.url);
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: ["/((?!api/|_next/|admin|uploads/|images/|.*\\..*).*)"],
};

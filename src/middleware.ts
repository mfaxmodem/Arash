import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["fa", "en", "ar"] as const;
const DEFAULT_LOCALE = "fa";

function getPreferredLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language");
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const preferred = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, q] = lang.trim().split(";");
      const quality = q ? parseFloat(q.split("=")[1]) : 1;
      return { code: code.split("-")[0].toLowerCase(), quality };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { code } of preferred) {
    if (LOCALES.includes(code as any)) {
      return code;
    }
  }

  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip: API, admin, static files, uploads, images, _next, robots.txt, sitemap.xml
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/uploads/") ||
    pathname.startsWith("/images/") ||
    pathname.includes(".") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Check if pathname already has a locale prefix
  const segments = pathname.split("/");
  const firstSegment = segments[1];

  if (LOCALES.includes(firstSegment as any)) {
    return NextResponse.next();
  }

  // No locale prefix — redirect based on Accept-Language (301 permanent)
  const preferredLocale = getPreferredLocale(request);
  const newUrl = new URL(`/${preferredLocale}${pathname}`, request.url);
  return NextResponse.redirect(newUrl, 301);
}

export const config = {
  matcher: ["/((?!api/|_next/|admin|uploads/|images/|.*\\..*).*)"],
};

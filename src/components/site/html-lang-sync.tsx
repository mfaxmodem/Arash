"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_DIRS, DEFAULT_LOCALE, type Locale } from "@/i18n";

export function HtmlLangSync() {
  const pathname = usePathname();

  useEffect(() => {
    const segments = pathname.split("/");
    const lang = segments[1];
    const locale: Locale = LOCALES.includes(lang as Locale)
      ? (lang as Locale)
      : DEFAULT_LOCALE;

    document.documentElement.lang = locale;
    document.documentElement.dir = LOCALE_DIRS[locale];
  }, [pathname]);

  return null;
}

import { LOCALES, type Locale } from "@/i18n";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://savers-chovil.ir";

/**
 * Generate hreflang alternates for a given path across all locales.
 * @param path - The path without locale prefix, e.g. "/products/shoes" or "/" for home
 * @returns Object suitable for metadata.alternates.languages
 *
 * Example output:
 * { "fa": "/fa/products/shoes", "en": "/en/products/shoes", "ar": "/ar/products/shoes", "x-default": "/fa/products/shoes" }
 */
export function generateAlternates(path: string): Record<string, string> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const entries: Record<string, string> = {};

  for (const locale of LOCALES) {
    entries[locale] = `/${locale}${cleanPath}`;
  }

  // x-default points to the default language (Farsi)
  entries["x-default"] = `/fa${cleanPath}`;

  return entries;
}

/**
 * Generate canonical URL for a given locale and path.
 * @param locale - Current locale
 * @param path - Path without locale prefix
 * @returns Full canonical URL
 */
export function generateCanonical(locale: Locale, path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}/${locale}${cleanPath}`;
}

/**
 * Generate full alternate URLs (absolute) for sitemap or other uses.
 * @param path - Path without locale prefix
 * @returns Record of locale → full URL
 */
export function generateFullAlternates(path: string): Record<string, string> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const entries: Record<string, string> = {};

  for (const locale of LOCALES) {
    entries[locale] = `${BASE_URL}/${locale}${cleanPath}`;
  }

  return entries;
}

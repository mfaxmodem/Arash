import type { Locale } from "@/i18n";

/**
 * Returns the localized value for a field, falling back to the base (Farsi) value.
 * Usage: localizeField(product, "name", "en") → product.nameEn || product.name
 */
export function localizeField<
  T extends Record<string, any>,
  K extends keyof T,
>(item: T, field: K, locale: Locale): T[K] {
  if (locale === "fa") return item[field];
  const suffix = locale === "en" ? "En" : "Ar";
  const localizedKey = `${String(field)}${suffix}` as keyof T;
  return (item[localizedKey] ?? item[field]) as T[K];
}

/**
 * Returns a new object with all localized fields resolved for the given locale.
 * Fields without a translation fall back to the base (Farsi) value.
 */
export function localizeItem<
  T extends Record<string, any>,
>(item: T, fields: readonly string[], locale: Locale): T {
  if (locale === "fa") return item;
  const result = { ...item };
  for (const field of fields) {
    const suffix = locale === "en" ? "En" : "Ar";
    const localizedKey = `${field}${suffix}`;
    if (localizedKey in item && item[localizedKey]) {
      (result as any)[field] = item[localizedKey];
    }
  }
  return result;
}

/**
 * Localizable field names for each model.
 */
export const LOCALIZABLE = {
  category: ["name", "description"],
  product: ["name", "description", "content"],
  blogPost: ["title", "excerpt", "content"],
} as const;

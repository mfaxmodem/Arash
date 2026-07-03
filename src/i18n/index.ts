export type Locale = "fa" | "en" | "ar";

export const LOCALES: Locale[] = ["fa", "en", "ar"];
export const DEFAULT_LOCALE: Locale = "fa";

export const LOCALE_LABELS: Record<Locale, string> = {
  fa: "فارسی",
  en: "English",
  ar: "العربية",
};

export const LOCALE_DIRS: Record<Locale, "rtl" | "ltr"> = {
  fa: "rtl",
  ar: "rtl",
  en: "ltr",
};

export const LOCALE_OG: Record<Locale, string> = {
  fa: "fa_IR",
  en: "en_US",
  ar: "ar_SA",
};

// Server-side dictionary loader (for Server Components / generateMetadata)
export async function getDictionary(locale: Locale) {
  switch (locale) {
    case "en":
      return (await import("./en.json")).default;
    case "ar":
      return (await import("./ar.json")).default;
    default:
      return (await import("./fa.json")).default;
  }
}

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

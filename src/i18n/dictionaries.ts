import { type Locale, getDictionary } from "./index";

// Re-export for convenience in Server Components / generateMetadata
export { getDictionary, type Locale, type Dictionary } from "./index";

export async function getServerDictionary(locale: string) {
  const valid = (["fa", "en", "ar"].includes(locale) ? locale : "fa") as Locale;
  return getDictionary(valid);
}

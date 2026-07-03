"use client";

import { createContext, useContext, type ReactNode } from "react";
import { type Locale, LOCALE_DIRS, type Dictionary } from "@/i18n";
import faDict from "@/i18n/fa.json";
import enDict from "@/i18n/en.json";
import arDict from "@/i18n/ar.json";

const DICTS: Record<Locale, Dictionary> = {
  fa: faDict as Dictionary,
  en: enDict as Dictionary,
  ar: arDict as Dictionary,
};

interface LanguageContextType {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "fa",
  dir: "rtl",
  t: faDict as Dictionary,
});

export function LanguageProvider({
  children,
  lang,
}: {
  children: ReactNode;
  lang?: Locale;
}) {
  const locale = lang && lang in DICTS ? lang : "fa";

  return (
    <LanguageContext.Provider
      value={{
        locale,
        dir: LOCALE_DIRS[locale],
        t: DICTS[locale],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}

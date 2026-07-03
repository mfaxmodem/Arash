import type { Metadata } from "next";
import { LOCALES, LOCALE_OG, type Locale, getDictionary } from "@/i18n";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { generateAlternates } from "@/lib/seo";

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { lang } = await params;
  const locale = (LOCALES.includes(lang as Locale) ? lang : "fa") as Locale;
  const t = await getDictionary(locale);
  const brand = t.meta.title.split("|")[1]?.trim() || "ساورز و چویل";

  return {
    title: {
      template: `%s | ${brand}`,
      default: t.meta.title,
    },
    description: t.meta.description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://savers-chovil.ir"),
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      type: "website",
      locale: LOCALE_OG[locale],
      siteName: "Savers & Chovil",
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: `/${locale}/`,
      languages: generateAlternates("/"),
    },
  };
}

export default async function LangLayout({ children, params }: any) {
  const { lang } = await params;
  const locale = (LOCALES.includes(lang as Locale) ? lang : "fa") as Locale;

  return (
    <Providers lang={locale}>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </Providers>
  );
}

import type { Metadata } from "next";
import { LOCALES, LOCALE_OG, LOCALE_DIRS, type Locale, getDictionary } from "@/i18n";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { generateAlternates } from "@/lib/seo";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://savers-chovil.ir";

const themeScript = `
  (function() {
    try {
      if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } catch(e) {}
  })()
`;

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
    metadataBase: new URL(BASE_URL),
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      type: "website",
      locale: LOCALE_OG[locale],
      siteName: "Savers & Chovil",
      url: `${BASE_URL}/${locale}`,
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
      canonical: `${BASE_URL}/${locale}/`,
      languages: generateAlternates("/"),
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    },
  };
}

export default async function LangLayout({ children, params }: any) {
  const { lang } = await params;
  const locale = (LOCALES.includes(lang as Locale) ? lang : "fa") as Locale;
  const dir = LOCALE_DIRS[locale];

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#5a6e28" />
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
        />
      </head>
      <body className="font-vazir antialiased bg-background text-foreground" suppressHydrationWarning>
        <Providers lang={locale}>
          <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

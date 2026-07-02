import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toasters } from "@/components/toasters";

export const metadata: Metadata = {
  title: "ساورز و چویل | خشکبار، ادویه‌جات، قند و شکر",
  description:
    "معرفی محصولات خشکبار، ادویه‌جات، قند و شکر با دو برند اختصاصی ساورز و چویل. کیفیت تضمینی.",
  keywords: [
    "خشکبار",
    "ادویه‌جات",
    "قند و شکر",
    "ساورز",
    "چویل",
    "آجیل",
    "زعفران",
    "پسته",
  ],
  authors: [{ name: "ساورز و چویل" }],
  openGraph: {
    title: "ساورز و چویل | خشکبار و ادویه‌جات",
    description: "کیفیت تضمینی خشکبار و ادویه‌جات",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Vazirmatn font from reliable CDN */}
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
      <body className="font-vazir antialiased bg-background text-foreground">
        <Providers>
          {children}
          <Toasters />
        </Providers>
      </body>
    </html>
  );
}

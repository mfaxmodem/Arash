import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ساورز و چویل | خشکبار، ادویه‌جات، قند و شکر",
  description:
    "فروش و بسته‌بندی خشکبار، ادویه‌جات، قند و شکر با دو برند اختصاصی ساورز و چویل. کیفیت تضمینی، ارسال به سراسر کشور.",
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
      <body
        className={`${vazirmatn.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}

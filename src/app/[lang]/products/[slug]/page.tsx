import type { Metadata } from "next";
import { LOCALES, type Locale, getDictionary } from "@/i18n";
import { generateAlternates } from "@/lib/seo";
import { db } from "@/lib/db";
import { localizeItem, LOCALIZABLE } from "@/lib/localize";
import { notFound } from "next/navigation";
import { ProductPageClient } from "./product-page-client";

export async function generateStaticParams() {
  const products = await db.product.findMany({
    where: { active: true },
    select: { slug: true },
  });
  return products.flatMap((p) =>
    LOCALES.map((lang) => ({ lang, slug: p.slug }))
  );
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = (LOCALES.includes(lang as Locale) ? lang : "fa") as Locale;

  const product = await db.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) return {};

  const localized = localizeItem(product, LOCALIZABLE.product, locale);
  const t = await getDictionary(locale);
  const brand = t.meta.title.split("|")[1]?.trim() || "ساورز و چویل";
  const path = `/products/${slug}`;

  return {
    title: `${localized.name} | ${brand}`,
    description: localized.description?.slice(0, 160) || undefined,
    openGraph: {
      title: localized.name,
      description: localized.description?.slice(0, 160),
      images: product.image ? [product.image] : undefined,
      type: "website",
    },
    alternates: {
      canonical: `/${locale}${path}`,
      languages: generateAlternates(path),
    },
  };
}

export default async function ProductPage({ params }: any) {
  const { lang, slug } = await params;
  const locale = (LOCALES.includes(lang as Locale) ? lang : "fa") as Locale;

  const product = await db.product.findUnique({
    where: { slug, active: true },
    include: { category: true },
  });

  if (!product) notFound();

  const localized = localizeItem(product, LOCALIZABLE.product, locale);

  return <ProductPageClient product={localized} />;
}

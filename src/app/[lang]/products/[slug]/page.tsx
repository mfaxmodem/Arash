import type { Metadata } from "next";
import { LOCALES, type Locale, getDictionary } from "@/i18n";
import { generateAlternates } from "@/lib/seo";
import { db } from "@/lib/db";
import { localizeItem, LOCALIZABLE } from "@/lib/localize";
import { notFound } from "next/navigation";
import { ProductPageClient } from "./product-page-client";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://savers-chovil.ir";

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
  const absoluteUrl = `${BASE_URL}/${locale}${path}`;

  return {
    title: `${localized.name} | ${brand}`,
    description: localized.description?.slice(0, 160) || undefined,
    openGraph: {
      title: localized.name,
      description: localized.description?.slice(0, 160),
      images: product.image ? [{ url: product.image, width: 800, height: 800, alt: product.name }] : undefined,
      type: "website",
      url: absoluteUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: localized.name,
      description: localized.description?.slice(0, 160),
      images: product.image ? [product.image] : undefined,
    },
    alternates: {
      canonical: absoluteUrl,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: localized.name,
    description: localized.description || undefined,
    image: product.image || undefined,
    brand: {
      "@type": "Brand",
      name: product.brand === "SAVERS" ? "ساورز" : "چویل",
    },
    category: product.category?.name || undefined,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "IRR",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${BASE_URL}/${locale}/products/${slug}`,
    },
    sku: product.slug,
    url: `${BASE_URL}/${locale}/products/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient product={localized} />
    </>
  );
}

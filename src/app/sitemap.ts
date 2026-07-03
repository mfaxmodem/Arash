import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://savers-chovil.ir";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/agents`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/testimonials`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${BASE_URL}/api/products?limit=100`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      productPages = (data.items ?? []).map((p: any) => ({
        url: `${BASE_URL}/products/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
  } catch { /* skip */ }

  // Dynamic blog pages
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${BASE_URL}/api/blog`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      blogPages = (data.items ?? []).map((b: any) => ({
        url: `${BASE_URL}/blog/${b.slug}`,
        lastModified: new Date(b.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    }
  } catch { /* skip */ }

  return [...staticPages, ...productPages, ...blogPages];
}

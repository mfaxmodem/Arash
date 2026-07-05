import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://savers-chovil.ir";
const LOCALES = ["fa", "en", "ar"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ["/", "/products", "/agents", "/blog", "/testimonials", "/about", "/contact"];
  const staticPagesConfig: Record<string, { changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"]; priority: number }> = {
    "/": { changeFrequency: "daily", priority: 1 },
    "/products": { changeFrequency: "daily", priority: 0.9 },
    "/agents": { changeFrequency: "monthly", priority: 0.6 },
    "/blog": { changeFrequency: "weekly", priority: 0.8 },
    "/testimonials": { changeFrequency: "weekly", priority: 0.5 },
    "/about": { changeFrequency: "monthly", priority: 0.5 },
    "/contact": { changeFrequency: "monthly", priority: 0.5 },
  };

  const allPages: MetadataRoute.Sitemap = [];

  // Generate all static pages for all locales
  for (const page of staticPages) {
    const config = staticPagesConfig[page];
    for (const locale of LOCALES) {
      const url = page === "/" ? `${BASE_URL}/${locale}` : `${BASE_URL}/${locale}${page}`;
      allPages.push({
        url,
        lastModified: new Date(),
        changeFrequency: config.changeFrequency,
        priority: config.priority,
      });
    }
  }

  // Dynamic product pages for all locales
  try {
    const res = await fetch(`${BASE_URL}/api/products?limit=200&admin=true`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      for (const p of data.items ?? []) {
        for (const locale of LOCALES) {
          allPages.push({
            url: `${BASE_URL}/${locale}/products/${p.slug}`,
            lastModified: new Date(p.updatedAt),
            changeFrequency: "weekly",
            priority: 0.8,
          });
        }
      }
    }
  } catch { /* skip */ }

  // Dynamic blog pages for all locales
  try {
    const res = await fetch(`${BASE_URL}/api/blog`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      for (const b of data.items ?? []) {
        for (const locale of LOCALES) {
          allPages.push({
            url: `${BASE_URL}/${locale}/blog/${b.slug}`,
            lastModified: new Date(b.updatedAt),
            changeFrequency: "monthly",
            priority: 0.7,
          });
        }
      }
    }
  } catch { /* skip */ }

  return allPages;
}

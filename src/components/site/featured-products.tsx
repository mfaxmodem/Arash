"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Product, Paginated } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useNav } from "@/store/nav-store";
import { useTranslation } from "@/contexts/language-context";
import { Leaf, Sparkles, Package } from "lucide-react";
import { AutoCarousel } from "@/components/site/auto-carousel";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function FeaturedProducts() {
  const { openProduct } = useNav();
  const { locale } = useTranslation();

  // Fetch a larger pool and shuffle client-side for randomness on each load
  const { data, isLoading } = useQuery({
    queryKey: ["products-featured-pool", locale],
    queryFn: () => api.get<Paginated<Product>>(`/api/products?limit=100&lang=${locale}`),
  });
  const all = data?.items ?? [];
  const savers = all.filter((p) => p.brand === "SAVERS");
  const chovil = all.filter((p) => p.brand === "CHOVIL");

  const randomAll = shuffle(all).slice(0, 12);
  const randomChovil = shuffle(chovil).slice(0, 12);
  const randomSavers = shuffle(savers).slice(0, 12);

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 space-y-16">
        {/* Section 1: all random */}
        <div>
          <SectionHeader
            badge="منتخب"
            title="محصولات منتخب"
            subtitle="گزیده‌ای از بهترین محصولات ما"
            icon={Package}
          />
          {isLoading ? (
            <ProductGridSkeleton />
          ) : (
            <AutoCarousel threshold={6}>
              {randomAll.map((p) => (
                <ProductMiniCard key={p.id} product={p} onClick={() => openProduct(p.id)} />
              ))}
            </AutoCarousel>
          )}
        </div>

        {/* Section 2: Chovil random */}
        <div>
          <SectionHeader
            badge="چویل"
            title="محصولات برند چویل"
            subtitle="ادویه‌جات خالص و قند و شکر مرغوب"
            icon={Sparkles}
            badgeClass="brand-chovil"
          />
          {isLoading ? (
            <ProductGridSkeleton />
          ) : (
            <AutoCarousel threshold={6}>
              {randomChovil.map((p) => (
                <ProductMiniCard key={p.id} product={p} onClick={() => openProduct(p.id)} />
              ))}
            </AutoCarousel>
          )}
        </div>

        {/* Section 3: Savers random */}
        <div>
          <SectionHeader
            badge="ساورز"
            title="محصولات برند ساورز"
            subtitle="خشکبار و آجیل تازه و باکیفیت"
            icon={Leaf}
            badgeClass="brand-savers"
          />
          {isLoading ? (
            <ProductGridSkeleton />
          ) : (
            <AutoCarousel threshold={6}>
              {randomSavers.map((p) => (
                <ProductMiniCard key={p.id} product={p} onClick={() => openProduct(p.id)} />
              ))}
            </AutoCarousel>
          )}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  badge,
  title,
  subtitle,
  icon: Icon,
  badgeClass,
}: {
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badgeClass?: string;
}) {
  return (
    <div className="mb-6 md:mb-8 text-center">
      <span
        className={cn(
          "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm mb-3 font-bold",
          badgeClass || "bg-primary/10 text-primary"
        )}
      >
        <Icon className="w-4 h-4" />
        {badge}
      </span>
      <h2 className="text-2xl md:text-4xl font-black text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function ProductMiniCard({
  product,
  onClick,
}: {
  product: Product;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 text-right w-full"
    >
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Package className="w-12 h-12" />
          </div>
        )}
        <span
          className={cn(
            "absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold",
            product.brand === "SAVERS" ? "brand-savers" : "brand-chovil"
          )}
        >
          {product.brand === "SAVERS" ? (
            <span className="inline-flex items-center gap-0.5">
              <Leaf className="w-2.5 h-2.5" /> ساورز
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> چویل
            </span>
          )}
        </span>
      </div>
      <div className="p-2.5 md:p-3">
        {product.category && (
          <span className="text-[10px] text-muted-foreground block mb-0.5">
            {product.category.name}
          </span>
        )}
        <h3 className="font-bold text-xs md:text-sm text-foreground line-clamp-1 mb-1">
          {product.name}
        </h3>
        <span className="inline-flex items-center gap-1 text-[10px] text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          مشاهده جزئیات
        </span>
      </div>
    </button>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-2xl" />
      ))}
    </div>
  );
}

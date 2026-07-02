"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Product, Paginated } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useNav } from "@/store/nav-store";
import { Leaf, Sparkles, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FeaturedProducts() {
  const { setView } = useNav();
  const { data, isLoading } = useQuery({
    queryKey: ["products-featured"],
    queryFn: () =>
      api.get<Paginated<Product>>("/api/products?featured=true&limit=6"),
  });
  const products = data?.items ?? [];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-3">
              <Package className="w-4 h-4" />
              پیشنهاد ویژه
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">
              محصولات منتخب
            </h2>
          </div>
          <Button
            variant="outline"
            onClick={() => setView("products")}
            className="gap-2"
          >
            مشاهده همه محصولات
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
                onClick={() => setView("products")}
              >
                <div className="relative aspect-square overflow-hidden bg-muted/30">
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <span
                    className={cn(
                      "absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold",
                      p.brand === "SAVERS" ? "brand-savers" : "brand-chovil"
                    )}
                  >
                    {p.brand === "SAVERS" ? (
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
                <div className="p-3">
                  <h3 className="font-bold text-sm text-foreground line-clamp-1 mb-1">
                    {p.name}
                  </h3>
                  <div className="text-primary font-black text-sm">
                    {formatPrice(p.price)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Product, Category, Paginated } from "@/lib/types";
import { toPersianDigits, cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNav } from "@/store/nav-store";
import { Search, Package, Leaf, Sparkles, AlertCircle, ArrowLeft } from "lucide-react";

const PAGE_SIZE = 12;

export function ProductsSection() {
  const { openProduct } = useNav();
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<{ items: Category[] }>("/api/categories"),
  });
  const categories = catData?.items ?? [];

  const queryKey = useMemo(
    () => ["products", page, categoryId, brand, search],
    [page, categoryId, brand, search]
  );

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (categoryId) params.set("categoryId", categoryId);
      if (brand) params.set("brand", brand);
      if (search) params.set("search", search);
      return api.get<Paginated<Product>>(`/api/products?${params}`);
    },
  });

  const products = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const changeFilter = (fn: () => void) => {
    fn();
    setPage(1);
  };

  return (
    <section id="products" className="pt-28 pb-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3 gap-1">
            <Package className="w-3.5 h-3.5" />
            محصولات ما
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-3">
            معرفی محصولات
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            بهترین کیفیت خشکبار، ادویه‌جات و قند و شکر با برند ساورز و چویل
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="جستجوی محصول..."
                className="pr-10"
              />
            </div>
            <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90">
              جستجو
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <FilterChip active={categoryId === ""} onClick={() => changeFilter(() => setCategoryId(""))}>
              همه دسته‌ها
            </FilterChip>
            {categories.map((cat) => (
              <FilterChip
                key={cat.id}
                active={categoryId === cat.id}
                onClick={() => changeFilter(() => setCategoryId(cat.id))}
              >
                {cat.name}
              </FilterChip>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <FilterChip active={brand === ""} onClick={() => changeFilter(() => setBrand(""))}>
              هر دو برند
            </FilterChip>
            <FilterChip
              active={brand === "SAVERS"}
              onClick={() => changeFilter(() => setBrand("SAVERS"))}
              className="gap-1.5"
            >
              <Leaf className="w-3.5 h-3.5 text-savers" />
              ساورز
            </FilterChip>
            <FilterChip
              active={brand === "CHOVIL"}
              onClick={() => changeFilter(() => setBrand("CHOVIL"))}
              className="gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-chovil" />
              چویل
            </FilterChip>
          </div>
        </div>

        {/* Products grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">محصولی یافت نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onClick={() => openProduct(p.id)} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              قبلی
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? "default" : "outline"}
                size="sm"
                className="w-10"
                onClick={() => setPage(i + 1)}
              >
                {toPersianDigits(i + 1)}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              بعدی
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-all border",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-md"
          : "bg-card text-foreground/70 border-border hover:border-primary/50 hover:text-primary",
        className
      )}
    >
      {children}
    </button>
  );
}

function ProductCard({
  product,
  onClick,
}: {
  product: Product;
  onClick: () => void;
}) {
  const outOfStock = product.stock <= 0;

  return (
    <article
      onClick={onClick}
      className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer"
    >
      {/* Image */}
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
            <Package className="w-16 h-16" />
          </div>
        )}
        {/* Brand badge */}
        <div className="absolute top-3 right-3">
          {product.brand === "SAVERS" ? (
            <span className="brand-savers inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
              <Leaf className="w-3 h-3" />
              ساورز
            </span>
          ) : (
            <span className="brand-chovil inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              چویل
            </span>
          )}
        </div>
        {product.featured && (
          <div className="absolute bottom-3 right-3">
            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow">
              ویژه
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {product.category && (
          <span className="text-xs text-muted-foreground mb-1">{product.category.name}</span>
        )}
        <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
            {product.description}
          </p>
        )}

        {product.weight && (
          <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
            <span className="px-2 py-0.5 rounded bg-muted">{product.weight}</span>
            {outOfStock && (
              <span className="px-2 py-0.5 rounded bg-destructive/10 text-destructive">
                ناموجود
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-border/50">
          <div className="flex items-center justify-center gap-1 text-primary font-medium text-sm group-hover:gap-2 transition-all">
            مشاهده جزئیات
            <ArrowLeft className="w-4 h-4" />
          </div>
        </div>
      </div>
    </article>
  );
}

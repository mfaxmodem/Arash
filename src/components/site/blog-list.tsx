"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BlogPost } from "@/lib/types";
import { formatPersianDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useNav } from "@/store/nav-store";
import { useTranslation } from "@/contexts/language-context";
import { Newspaper, ArrowLeft, Calendar, User, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function BlogList() {
  const { openBlog } = useNav();
  const { locale } = useTranslation();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["blog-public", locale],
    queryFn: () => api.get<{ items: BlogPost[] }>(`/api/blog?lang=${locale}`),
  });
  const posts = data?.items ?? [];
  const filtered = search
    ? posts.filter(
        (p) => p.title.includes(search) || (p.excerpt || "").includes(search)
      )
    : posts;

  return (
    <section className="pt-28 pb-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-3 font-bold">
            <Newspaper className="w-4 h-4" />
            مجله و بلاگ
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-foreground mb-3">
            مقالات و مطالب
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            مطالب مفید درباره خشکبار، ادویه‌جات و سبک زندگی سالم
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-10">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی مقاله..."
            className="pr-10"
          />
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">مقاله‌ای یافت نشد</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <article
                key={post.id}
                onClick={() => openBlog(post.id)}
                className="group bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col"
              >
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Newspaper className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatPersianDate(post.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-3 group-hover:gap-2 transition-all">
                    ادامه مطلب
                    <ArrowLeft className="w-4 h-4" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

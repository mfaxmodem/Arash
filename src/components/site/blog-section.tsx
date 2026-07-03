"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BlogPost } from "@/lib/types";
import { formatPersianDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useNav } from "@/store/nav-store";
import { useTranslation } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Newspaper, ArrowLeft, Calendar, User } from "lucide-react";

export function BlogSection() {
  const { openBlog, setView } = useNav();
  const { locale } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ["blog-public", locale],
    queryFn: () => api.get<{ items: BlogPost[] }>(`/api/blog?lang=${locale}`),
  });
  const posts = (data?.items ?? []).slice(0, 3);

  if (!isLoading && posts.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-spice-gradient">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/60 text-foreground text-sm mb-3 font-bold">
              <Newspaper className="w-4 h-4" />
              مجله و بلاگ
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">
              آخرین مقالات
            </h2>
          </div>
          <Button
            variant="outline"
            onClick={() => setView("blog")}
            className="gap-2 bg-white/70"
          >
            همه مقالات
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                onClick={() => openBlog(post.id)}
                className="group bg-white rounded-2xl overflow-hidden shadow-md border border-white hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col"
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
                    <p className="text-sm text-foreground/70 line-clamp-2 flex-1">
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

"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BlogPost } from "@/lib/types";
import { formatPersianDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useNav } from "@/store/nav-store";
import { useTranslation } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, User, Newspaper, AlertCircle, Tag } from "lucide-react";

export function BlogDetail() {
  const { selectedBlogId, setView, openBlog } = useNav();
  const { locale } = useTranslation();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", selectedBlogId, locale],
    queryFn: () => api.get<BlogPost>(`/api/blog/${selectedBlogId}?lang=${locale}`),
    enabled: !!selectedBlogId,
  });

  const { data: allData } = useQuery({
    queryKey: ["blog-public", locale],
    queryFn: () => api.get<{ items: BlogPost[] }>(`/api/blog?lang=${locale}`),
  });
  const related = (allData?.items ?? [])
    .filter((p) => p.id !== selectedBlogId)
    .slice(0, 3);

  if (!selectedBlogId) {
    return (
      <div className="pt-28 pb-20 text-center container mx-auto px-4">
        <p className="text-muted-foreground">مقاله‌ای انتخاب نشده است</p>
        <Button onClick={() => setView("blog")} className="mt-4">
          بازگشت به بلاگ
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pt-28 pb-20 container mx-auto px-4 max-w-3xl">
        <Skeleton className="h-8 w-1/3 mb-6" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="aspect-video w-full mb-6 rounded-2xl" />
        <Skeleton className="h-40 w-full mb-4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-28 pb-20 text-center container mx-auto px-4">
        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">مقاله یافت نشد</p>
        <Button onClick={() => setView("blog")} className="mt-4 gap-2">
          <ArrowRight className="w-4 h-4" />
          بازگشت
        </Button>
      </div>
    );
  }

  const tags = (post.tags || "").split(",").filter(Boolean);

  return (
    <article className="pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Breadcrumb */}
        <button
          onClick={() => setView("blog")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت به بلاگ
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatPersianDate(post.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <User className="w-4 h-4" />
              {post.author}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-3 leading-tight text-balance">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                >
                  <Tag className="w-3 h-3" />
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Cover image */}
        {post.image && (
          <div className="rounded-3xl overflow-hidden shadow-xl mb-8 aspect-video bg-muted">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="text-foreground/80 leading-loose whitespace-pre-line text-lg">
            {post.content}
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-16 pt-8 border-t border-border">
            <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-primary" />
              مقالات مرتبط
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <button
                  key={r.id}
                  onClick={() => openBlog(r.id)}
                  className="group bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all text-right flex flex-col"
                >
                  <div className="aspect-video overflow-hidden bg-muted">
                    {r.image && (
                      <img
                        src={r.image}
                        alt={r.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {r.title}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

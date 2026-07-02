"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Product, ProductComment } from "@/lib/types";
import { cn, toPersianDigits, formatPersianDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useNav } from "@/store/nav-store";
import { toast } from "sonner";
import {
  ArrowRight,
  Leaf,
  Sparkles,
  Package,
  Star,
  User,
  MessageSquare,
  Send,
  AlertCircle,
} from "lucide-react";

export function ProductDetail() {
  const { selectedProductId, setView, openProduct } = useNav();
  const qc = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", selectedProductId],
    queryFn: () => api.get<Product>(`/api/products/${selectedProductId}`),
    enabled: !!selectedProductId,
  });

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ["product-comments", selectedProductId],
    queryFn: () =>
      api.get<{ items: ProductComment[] }>(
        `/api/products/${selectedProductId}/comments`
      ),
    enabled: !!selectedProductId,
  });

  const comments = commentsData?.items ?? [];

  const [form, setForm] = useState({ name: "", rating: 5, comment: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () =>
      api.post(`/api/products/${selectedProductId}/comments`, form),
    onSuccess: () => {
      toast.success("نظر شما ثبت شد و پس از تایید نمایش داده خواهد شد");
      qc.invalidateQueries({ queryKey: ["product-comments", selectedProductId] });
      setForm({ name: "", rating: 5, comment: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = () => {
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "نام را وارد کنید";
    if (form.comment.trim().length < 5) errs.comment = "حداقل ۵ کاراکتر بنویسید";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    mutation.mutate();
  };

  if (!selectedProductId) {
    return (
      <div className="pt-28 pb-20 text-center">
        <p className="text-muted-foreground">محصولی انتخاب نشده است</p>
        <Button onClick={() => setView("products")} className="mt-4">
          بازگشت به محصولات
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pt-28 pb-20 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-28 pb-20 text-center container mx-auto px-4">
        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">محصول یافت نشد</p>
        <Button onClick={() => setView("products")} className="mt-4 gap-2">
          <ArrowRight className="w-4 h-4" />
          بازگشت
        </Button>
      </div>
    );
  }

  // Related products (same brand or category)
  const related: Product[] = [];

  return (
    <div className="pt-24 pb-20">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 mb-6">
        <button
          onClick={() => setView("products")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت به محصولات
        </button>
      </div>

      {/* Product detail */}
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl bg-muted/30 aspect-square">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Package className="w-24 h-24" />
              </div>
            )}
            <span
              className={cn(
                "absolute top-4 right-4 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-sm",
                product.brand === "SAVERS" ? "brand-savers" : "brand-chovil"
              )}
            >
              {product.brand === "SAVERS" ? (
                <>
                  <Leaf className="w-4 h-4" /> ساورز
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> چویل
                </>
              )}
            </span>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {product.category && (
              <span className="text-sm text-primary font-medium mb-2">
                {product.category.name}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-black text-foreground mb-3">
              {product.name}
            </h1>

            {product.weight && (
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-muted text-sm text-foreground/70">
                  {product.weight}
                </span>
                <span className="px-3 py-1 rounded-full bg-muted text-sm text-foreground/70">
                  واحد: {product.unit}
                </span>
              </div>
            )}

            {product.description && (
              <p className="text-foreground/80 leading-relaxed mb-4 text-lg">
                {product.description}
              </p>
            )}

            {product.content && (
              <div className="prose prose-lg max-w-none text-foreground/70 leading-relaxed whitespace-pre-line bg-muted/30 rounded-2xl p-5 mb-6">
                {product.content}
              </div>
            )}

            <div className="mt-auto flex flex-wrap gap-3 pt-4 border-t border-border/50">
              <Button
                variant="outline"
                onClick={() => setView("contact")}
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                استعلام قیمت و خرید
              </Button>
            </div>
          </div>
        </div>

        {/* Comments section */}
        <div className="bg-card rounded-3xl border border-border p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-black text-foreground mb-6 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            نظرات کاربران
            {comments.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({toPersianDigits(comments.length)} نظر)
              </span>
            )}
          </h2>

          {/* Comments list */}
          {commentsLoading ? (
            <div className="space-y-3 mb-8">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10 mb-8 bg-muted/30 rounded-2xl">
              <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground text-sm">
                هنوز نظری برای این محصول ثبت نشده است. اولین نفری باشید که نظر می‌دهد!
              </p>
            </div>
          ) : (
            <div className="space-y-4 mb-8 max-h-[480px] overflow-y-auto custom-scroll pl-2">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="bg-muted/30 rounded-2xl p-4 border border-border/50"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-sm">{c.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatPersianDate(c.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3.5 h-3.5",
                            i < c.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-foreground/80 leading-relaxed text-sm">{c.comment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Comment form */}
          <div className="border-t border-border/50 pt-6">
            <h3 className="font-bold text-foreground mb-4">ثبت نظر شما</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="pc-name">نام و نام خانوادگی *</Label>
                <Input
                  id="pc-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={100}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>امتیاز شما</Label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setForm({ ...form, rating: i + 1 })}
                      aria-label={`${toPersianDigits(i + 1)} ستاره`}
                    >
                      <Star
                        className={cn(
                          "w-8 h-8 transition-colors",
                          i < form.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/40 hover:text-amber-300"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pc-comment">نظر شما *</Label>
                <Textarea
                  id="pc-comment"
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  maxLength={1000}
                  rows={4}
                />
                {errors.comment && (
                  <p className="text-xs text-destructive">{errors.comment}</p>
                )}
              </div>
              <Button
                onClick={submit}
                disabled={mutation.isPending}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                {mutation.isPending ? "در حال ارسال..." : "ارسال نظر"}
                <Send className="w-4 h-4" />
              </Button>
              <p className="text-xs text-muted-foreground">
                نظر شما پس از تایید مدیر سایت نمایش داده خواهد شد.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

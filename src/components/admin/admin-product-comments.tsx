"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ProductComment } from "@/lib/types";
import { cn, toPersianDigits, formatPersianDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { MessageSquare, Check, X, Trash2, Star, Clock, CheckCircle, XCircle, Package } from "lucide-react";

export function AdminProductComments() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("PENDING");

  const { data, isLoading } = useQuery({
    queryKey: ["product-comments-admin", filter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filter) params.set("status", filter);
      return api.get<{ items: (ProductComment & { product?: { id: string; name: string; image?: string | null } })[] }>(
        `/api/product-comments?${params}`
      );
    },
  });
  const comments = data?.items ?? [];

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/api/product-comments/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-comments-admin"] });
      toast.success("به‌روزرسانی شد");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => api.del(`/api/product-comments/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-comments-admin"] });
      toast.success("حذف شد");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setStatus = (id: string, status: "APPROVED" | "REJECTED") =>
    updateMut.mutate({ id, status });

  const pending = comments.filter((c) => c.status === "PENDING").length;

  const STATUS = {
    PENDING: { label: "در انتظار", icon: Clock, cls: "bg-amber-100 text-amber-700" },
    APPROVED: { label: "تایید شده", icon: CheckCircle, cls: "bg-green-100 text-green-700" },
    REJECTED: { label: "رد شده", icon: XCircle, cls: "bg-red-100 text-red-700" },
  };

  const FILTERS = [
    { value: "PENDING", label: "در انتظار" },
    { value: "APPROVED", label: "تایید شده" },
    { value: "REJECTED", label: "رد شده" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          نظرات محصولات
        </h1>
        <p className="text-muted-foreground text-sm">
          مدیریت نظرات کاربران روی محصولات {pending > 0 && `(${toPersianDigits(pending)} نظر در انتظار)`}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground/70 hover:bg-muted/70"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : comments.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground bg-card rounded-xl border border-border">
          نظری در این دسته وجود ندارد
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => {
            const badge = STATUS[c.status];
            return (
              <div key={c.id} className="bg-card rounded-xl border border-border p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    {c.product?.image ? (
                      <img src={c.product.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-foreground text-sm">{c.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        روی: <span className="font-medium text-foreground/70">{c.product?.name || "—"}</span>
                      </div>
                    </div>
                  </div>
                  <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shrink-0", badge.cls)}>
                    <badge.icon className="w-3 h-3" />
                    {badge.label}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("w-3.5 h-3.5", i < c.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                  ))}
                  <span className="text-xs text-muted-foreground mr-2">{formatPersianDateTime(c.createdAt)}</span>
                </div>
                <p className="text-sm text-foreground/80 bg-muted/40 rounded-lg p-3 mb-3">{c.comment}</p>
                <div className="flex flex-wrap gap-2">
                  {c.status !== "APPROVED" && (
                    <Button size="sm" onClick={() => setStatus(c.id, "APPROVED")} className="gap-1.5 bg-green-600 hover:bg-green-700 h-8">
                      <Check className="w-3.5 h-3.5" /> تایید
                    </Button>
                  )}
                  {c.status !== "REJECTED" && (
                    <Button size="sm" variant="outline" onClick={() => setStatus(c.id, "REJECTED")} className="gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50 h-8">
                      <X className="w-3.5 h-3.5" /> رد
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => delMut.mutate(c.id)} className="gap-1.5 text-destructive h-8">
                    <Trash2 className="w-3.5 h-3.5" /> حذف
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

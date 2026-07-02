"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Testimonial } from "@/lib/types";
import { toPersianDigits, formatPersianDate, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Check, X, Trash2, MessageSquareQuote, Star, Clock, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

export function AdminTestimonials() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState({ name: "", comment: "", rating: 5 });

  const { data, isLoading } = useQuery({
    queryKey: ["testimonials-all"],
    queryFn: () => api.get<{ items: Testimonial[] }>("/api/testimonials?all=true"),
  });
  const testimonials = data?.items ?? [];

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.put(`/api/testimonials/${id}`, payload),
    onSuccess: () => { toast.success("به‌روزرسانی شد"); qc.invalidateQueries({ queryKey: ["testimonials-all"] }); qc.invalidateQueries({ queryKey: ["testimonials-public"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => api.del(`/api/testimonials/${id}`),
    onSuccess: () => { toast.success("حذف شد"); qc.invalidateQueries({ queryKey: ["testimonials-all"] }); qc.invalidateQueries({ queryKey: ["testimonials-public"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const setStatus = (id: string, status: "APPROVED" | "REJECTED") => updateMut.mutate({ id, payload: { status } });

  const openEdit = (t: Testimonial) => { setEditing(t); setForm({ name: t.name, comment: t.comment, rating: t.rating }); };
  const saveEdit = () => {
    if (!editing) return;
    updateMut.mutate({ id: editing.id, payload: { name: form.name.trim(), comment: form.comment.trim(), rating: form.rating } }, {
      onSuccess: () => setEditing(null),
    });
  };

  const pending = testimonials.filter((t) => t.status === "PENDING");
  const approved = testimonials.filter((t) => t.status === "APPROVED");
  const rejected = testimonials.filter((t) => t.status === "REJECTED");

  const STATUS_BADGE = {
    PENDING: { label: "در انتظار", icon: Clock, cls: "bg-amber-100 text-amber-700" },
    APPROVED: { label: "تایید شده", icon: CheckCircle, cls: "bg-green-100 text-green-700" },
    REJECTED: { label: "رد شده", icon: XCircle, cls: "bg-red-100 text-red-700" },
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><MessageSquareQuote className="w-6 h-6" /> مدیریت نظرات</h1>
        <p className="text-muted-foreground text-sm">بررسی و تایید نظرات مشتریان</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <div className="text-2xl font-black text-amber-600">{toPersianDigits(pending.length)}</div>
          <div className="text-xs text-muted-foreground">در انتظار</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <div className="text-2xl font-black text-green-600">{toPersianDigits(approved.length)}</div>
          <div className="text-xs text-muted-foreground">تایید شده</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <div className="text-2xl font-black text-red-600">{toPersianDigits(rejected.length)}</div>
          <div className="text-xs text-muted-foreground">رد شده</div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => {
            const badge = STATUS_BADGE[t.status];
            return (
              <div key={t.id} className="bg-card rounded-xl border border-border p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.city} • {formatPersianDate(t.createdAt)}</div>
                    </div>
                  </div>
                  <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shrink-0", badge.cls)}>
                    <badge.icon className="w-3 h-3" />{badge.label}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("w-3.5 h-3.5", i < t.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 mb-3 bg-muted/40 rounded-lg p-3">{t.comment}</p>
                <div className="flex flex-wrap gap-2">
                  {t.status !== "APPROVED" && (
                    <Button size="sm" onClick={() => setStatus(t.id, "APPROVED")} className="gap-1.5 bg-green-600 hover:bg-green-700">
                      <Check className="w-3.5 h-3.5" /> تایید
                    </Button>
                  )}
                  {t.status !== "REJECTED" && (
                    <Button size="sm" variant="outline" onClick={() => setStatus(t.id, "REJECTED")} className="gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50">
                      <X className="w-3.5 h-3.5" /> رد
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => openEdit(t)} className="gap-1.5">ویرایش متن</Button>
                  <Button size="sm" variant="ghost" onClick={() => delMut.mutate(t.id)} className="gap-1.5 text-destructive">
                    <Trash2 className="w-3.5 h-3.5" /> حذف
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>ویرایش نظر</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">نام</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">امتیاز</label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} type="button" onClick={() => setForm({ ...form, rating: i + 1 })}>
                    <Star className={cn("w-7 h-7", i < form.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">متن نظر</label>
              <Textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} rows={4} maxLength={1000} />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveEdit} disabled={updateMut.isPending} className="flex-1">ذخیره</Button>
              <Button variant="outline" onClick={() => setEditing(null)}>انصراف</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

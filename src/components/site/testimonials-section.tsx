"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Testimonial } from "@/lib/types";
import { cn, toPersianDigits } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { Star, MessageSquareQuote, Quote, User } from "lucide-react";

export function TestimonialsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["testimonials-public"],
    queryFn: () => api.get<{ items: Testimonial[] }>("/api/testimonials"),
  });
  const testimonials = data?.items ?? [];

  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-3">
            <MessageSquareQuote className="w-4 h-4" />
            نظرات خریداران
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-3">
            مشتریان ما چه می‌گویند؟
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            رضایت شما، اعتبار ماست. نظرات برخی از مشتریان عزیز را بخوانید
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} t={t} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <SubmitTestimonial />
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <article className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow relative overflow-hidden">
      <Quote className="absolute -top-2 left-4 w-20 h-20 text-primary/5 rotate-180" />
      <div className="relative">
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-4 h-4",
                i < t.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
              )}
            />
          ))}
        </div>
        <p className="text-foreground/80 leading-relaxed mb-5 line-clamp-4">{t.comment}</p>
        <div className="flex items-center gap-3 pt-4 border-t border-border/50">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-foreground">{t.name}</div>
            {t.city && <div className="text-xs text-muted-foreground">{t.city}</div>}
          </div>
        </div>
      </div>
    </article>
  );
}

function SubmitTestimonial() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", rating: 5, comment: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.post("/api/testimonials", form),
    onSuccess: () => {
      toast.success("نظر شما ثبت شد و پس از تایید نمایش داده خواهد شد");
      qc.invalidateQueries({ queryKey: ["testimonials-public"] });
      setForm({ name: "", city: "", rating: 5, comment: "" });
      setOpen(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
          <MessageSquareQuote className="w-5 h-5" />
          ثبت نظر شما
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ثبت نظر</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="t-name">نام و نام خانوادگی *</Label>
            <Input
              id="t-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={100}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-city">شهر</Label>
            <Input
              id="t-city"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              maxLength={100}
            />
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
            <Label htmlFor="t-comment">نظر شما *</Label>
            <Textarea
              id="t-comment"
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              maxLength={1000}
              rows={4}
            />
            {errors.comment && <p className="text-xs text-destructive">{errors.comment}</p>}
          </div>
          <Button
            onClick={submit}
            disabled={mutation.isPending}
            className="w-full gap-2"
          >
            {mutation.isPending ? "در حال ارسال..." : "ارسال نظر"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

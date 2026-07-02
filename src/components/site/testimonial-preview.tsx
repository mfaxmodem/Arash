"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Testimonial } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useNav } from "@/store/nav-store";
import { Button } from "@/components/ui/button";
import { Star, Quote, User, MessageSquareQuote, ArrowLeft } from "lucide-react";

export function TestimonialPreview() {
  const { setView } = useNav();
  const { data } = useQuery({
    queryKey: ["testimonials-public"],
    queryFn: () => api.get<{ items: Testimonial[] }>("/api/testimonials"),
  });
  const testimonials = (data?.items ?? []).slice(0, 3);

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 bg-spice-gradient">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/60 text-foreground text-sm mb-3">
              <MessageSquareQuote className="w-4 h-4" />
              رضایت مشتریان
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">
              نظرات مشتریان ما
            </h2>
          </div>
          <Button variant="outline" onClick={() => setView("testimonials")} className="gap-2 bg-white/70">
            همه نظرات
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <article
              key={t.id}
              className="bg-white rounded-2xl p-6 shadow-md border border-white relative overflow-hidden"
            >
              <Quote className="absolute -top-2 left-4 w-16 h-16 text-primary/5 rotate-180" />
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
                <p className="text-foreground/80 leading-relaxed mb-5 line-clamp-3">{t.comment}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm">{t.name}</div>
                    {t.city && <div className="text-xs text-muted-foreground">{t.city}</div>}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

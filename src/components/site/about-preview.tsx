"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useNav } from "@/store/nav-store";
import { Button } from "@/components/ui/button";
import { Leaf, Sparkles, ArrowLeft, Award, ShieldCheck, Truck, HeartHandshake } from "lucide-react";

export function AboutPreview() {
  const { setView } = useNav();
  const { data } = useQuery({
    queryKey: ["page-content"],
    queryFn: () => api.get<{ content: Record<string, string> }>("/api/page-content"),
  });
  const content = data?.content ?? {};
  const aboutBody = content.about_body || "";

  const features = [
    { icon: ShieldCheck, title: "کیفیت تضمینی", desc: "کنترل کیفیت در تمام مراحل" },
    { icon: Award, title: "برندهای معتبر", desc: "ساورز و چویل" },
    { icon: Truck, title: "ارسال سراسری", desc: "به تمام نقاط کشور" },
    { icon: HeartHandshake, title: "پشتیبانی", desc: "همراه شما هستیم" },
  ];

  return (
    <section className="py-20 bg-spice-gradient">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
              <img
                src="/images/about-company.png"
                alt="کارخانه بسته‌بندی"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/60 text-foreground text-sm mb-4">
              <Award className="w-4 h-4" />
              درباره ما
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6 text-balance">
              {content.about_title || "درباره ساورز و چویل"}
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-8 line-clamp-4">
              {aboutBody}
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((f) => (
                <div key={f.title} className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                  <f.icon className="w-6 h-6 text-primary mb-2" />
                  <div className="font-bold text-foreground text-sm">{f.title}</div>
                  <div className="text-xs text-foreground/60">{f.desc}</div>
                </div>
              ))}
            </div>
            <Button onClick={() => setView("about")} className="gap-2 bg-primary hover:bg-primary/90">
              بیشتر بدانید
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

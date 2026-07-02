"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toPersianDigits } from "@/lib/utils";
import { Leaf, Sparkles, Award, Truck, ShieldCheck, HeartHandshake } from "lucide-react";

export function AboutSection() {
  const { data } = useQuery({
    queryKey: ["page-content"],
    queryFn: () => api.get<{ content: Record<string, string> }>("/api/page-content"),
  });
  const content = data?.content ?? {};
  const aboutTitle = content.about_title || "درباره ساورز و چویل";
  const aboutBody = content.about_body || "";

  const stats = [
    { icon: Award, value: "۲۰+", label: "سال تجربه" },
    { icon: Truck, value: "۳۰+", label: "نمایندگی فعال" },
    { icon: ShieldCheck, value: "۱۰۰٪", label: "کیفیت تضمینی" },
    { icon: HeartHandshake, value: "۵۰هزار+", label: "مشتری راضی" },
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
              <img
                src="/images/about-company.png"
                alt="کارخانه بسته‌بندی ساورز و چویل"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 bg-card rounded-2xl shadow-xl p-5 border border-border hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-savers text-savers-foreground">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-black text-foreground">کیفیت تضمینی</div>
                  <div className="text-xs text-muted-foreground">استاندارد ملی سلامت</div>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
              <Award className="w-4 h-4" />
              درباره ما
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6 text-balance">
              {aboutTitle}
            </h2>
            <div className="prose prose-lg max-w-none text-foreground/80 leading-relaxed whitespace-pre-line mb-8">
              {aboutBody}
            </div>

            {/* Brand showcase */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-savers/10 rounded-2xl p-5 border border-savers/20">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-6 h-6 text-savers" />
                  <span className="font-black text-lg text-savers">برند ساورز</span>
                </div>
                <p className="text-sm text-foreground/70">
                  تخصص در خشکبار و آجیل تازه با کیفیتی ممتاز
                </p>
              </div>
              <div className="bg-chovil/10 rounded-2xl p-5 border border-chovil/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-chovil" />
                  <span className="font-black text-lg text-chovil">برند چویل</span>
                </div>
                <p className="text-sm text-foreground/70">
                  ادویه‌جات خالص و قند و شکر مرغوب
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          {stats.map((s) => (
            <div
              key={s.label}
              className="text-center bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-3">
                <s.icon className="w-7 h-7" />
              </div>
              <div className="text-3xl font-black text-foreground mb-1">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

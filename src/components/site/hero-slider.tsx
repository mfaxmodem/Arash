"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Slider } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroSlider() {
  const { data } = useQuery({
    queryKey: ["sliders"],
    queryFn: () => api.get<{ items: Slider[] }>("/api/sliders"),
  });
  const sliders = data?.items ?? [];

  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (sliders.length ? (c + 1) % sliders.length : 0));
  }, [sliders.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (sliders.length ? (c - 1 + sliders.length) % sliders.length : 0));
  }, [sliders.length]);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [next, sliders.length]);

  if (sliders.length === 0) {
    return (
      <section className="relative h-[70vh] min-h-[480px] bg-spice-gradient flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-4xl md:text-6xl font-black text-foreground mb-4">
            ساورز و چویل
          </h1>
          <p className="text-lg text-foreground/70">خشکبار، ادویه‌جات، قند و شکر</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative h-[78vh] min-h-[500px] max-h-[760px] overflow-hidden bg-muted"
      aria-label="اسلایدر اصلی"
    >
      {sliders.map((slide, idx) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-out",
            idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
          aria-hidden={idx !== current}
        >
          {/* Background image as <img> for SEO */}
          <img
            src={slide.image}
            alt={slide.title}
            className={cn(
              "absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-[6000ms] ease-out",
              idx === current ? "scale-100" : "scale-105"
            )}
          />
          {/* RTL-aware overlay: darker on right side where text sits */}
          <div className="absolute inset-0 bg-hero-overlay-rtl" />

          {/* Content */}
          <div className="relative h-full container mx-auto px-4 flex items-center">
            <div
              className={cn(
                "max-w-2xl transition-all duration-700",
                idx === current ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              )}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm mb-5">
                <span className="w-2 h-2 rounded-full bg-chovil animate-pulse" />
                کیفیت تضمینی
              </div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 text-balance leading-tight drop-shadow-lg">
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p className="text-lg md:text-2xl text-white/90 mb-8 font-medium drop-shadow">
                  {slide.subtitle}
                </p>
              )}
              {slide.buttonText && (
                <a href={slide.link || "#products"}>
                  <Button
                    size="lg"
                    className="bg-chovil hover:bg-chovil/90 text-chovil-foreground text-base h-12 px-8 gap-2 shadow-xl"
                  >
                    {slide.buttonText}
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="قبلی"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/40 transition-colors flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            aria-label="بعدی"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/40 transition-colors flex items-center justify-center"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 inset-x-0 z-20 flex items-center justify-center gap-2">
            {sliders.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                aria-label={`اسلاید ${idx + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all",
                  idx === current ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AutoCarouselProps {
  children: React.ReactNode[];
  /** If children.length <= threshold, render as static grid instead of carousel */
  threshold?: number;
  /** Auto-play interval in ms (default 5000) */
  interval?: number;
  /** Grid class applied when items <= threshold (static mode) */
  gridClass?: string;
  /** Slide width class, e.g. "w-1/2 md:w-1/3 lg:w-1/6" */
  slideClass?: string;
  /** Gap class for the flex container */
  gapClass?: string;
  className?: string;
}

export function AutoCarousel({
  children,
  threshold = 6,
  interval = 5000,
  gridClass = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4",
  slideClass = "flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_16.667%]",
  gapClass = "gap-3 md:gap-4",
  className,
}: AutoCarouselProps) {
  const isStatic = children.length <= threshold;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    direction: "rtl",
    align: "start",
  });
  const [isHovered, setIsHovered] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoplay = useCallback(() => {
    if (isStatic || !emblaApi) return;
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      emblaApi.scrollNext();
    }, interval);
  }, [emblaApi, interval, isStatic]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isStatic || !emblaApi) return;
    if (isHovered) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
    return () => stopAutoplay();
  }, [emblaApi, isHovered, isStatic, startAutoplay, stopAutoplay]);

  useEffect(() => {
    return () => stopAutoplay();
  }, [stopAutoplay]);

  if (isStatic) {
    return <div className={gridClass}>{children}</div>;
  }

  return (
    <div
      className={cn("relative group/carousel w-full", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="overflow-hidden w-full" ref={emblaRef}>
        <div className={cn("flex items-stretch", gapClass)}>
          {children.map((child, i) => (
            <div
              key={i}
              className={cn("h-auto", slideClass)}
            >
              <div className="h-full">{child}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav arrows */}
      <button
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 shadow-md border border-border text-foreground opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-white"
        aria-label="قبلی"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      <button
        onClick={() => emblaApi?.scrollNext()}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 shadow-md border border-border text-foreground opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-white"
        aria-label="بعدی"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useNav, type View } from "@/store/nav-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, Leaf, Sparkles } from "lucide-react";
import { useBrandIcons } from "@/hooks/use-brand-icons";

const NAV_ITEMS: { label: string; view: View }[] = [
  { label: "خانه", view: "home" },
  { label: "محصولات", view: "products" },
  { label: "نمایندگان", view: "agents" },
  { label: "بلاگ", view: "blog" },
  { label: "نظرات", view: "testimonials" },
  { label: "درباره ما", view: "about" },
  { label: "تماس", view: "contact" },
];

export function Navbar() {
  const { view, setView } = useNav();
  const { saversIcon, chovilIcon } = useBrandIcons();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (v: View) => {
    setView(v);
    setMobileOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-md shadow-md border-b border-border/50"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => handleNav("home")}
            className="flex items-center gap-2 group"
            aria-label="صفحه اصلی"
          >
            <div className="flex items-center gap-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-savers text-savers-foreground shadow-md group-hover:scale-105 transition-transform overflow-hidden">
                {saversIcon ? <img src={saversIcon} alt="ساورز" className="w-full h-full object-cover" /> : <Leaf className="w-5 h-5" />}
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-chovil text-chovil-foreground shadow-md group-hover:scale-105 transition-transform -mr-3 overflow-hidden">
                {chovilIcon ? <img src={chovilIcon} alt="چویل" className="w-full h-full object-cover" /> : <Sparkles className="w-5 h-5" />}
              </div>
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="font-extrabold text-lg text-foreground">
                ساورز <span className="text-chovil">و</span> چویل
              </span>
              <span
                className={cn(
                  "text-[10px] tracking-wide",
                  scrolled ? "text-muted-foreground" : "text-foreground/70"
                )}
              >
                خشکبار و ادویه‌جات
              </span>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.view}
                onClick={() => handleNav(item.view)}
                className={cn(
                  "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors relative",
                  view === item.view || (item.view === "blog" && view === "blogDetail")
                    ? scrolled
                      ? "bg-primary/10 text-primary"
                      : "bg-white/20 text-white"
                    : scrolled
                      ? "text-foreground/70 hover:text-primary hover:bg-primary/5"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant={scrolled ? "outline" : "secondary"}
                size="icon"
                className={cn("lg:hidden", !scrolled && "bg-white/90")}
                aria-label="منو"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b">
                  <div className="font-extrabold text-lg">
                    ساورز <span className="text-chovil">و</span> چویل
                  </div>
                </div>
                <nav className="flex flex-col p-4 gap-1">
                  {NAV_ITEMS.map((item) => (
                    <SheetClose asChild key={item.view}>
                      <button
                        onClick={() => handleNav(item.view)}
                        className={cn(
                          "px-4 py-3 rounded-lg text-right font-medium transition-colors",
                          view === item.view
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        )}
                      >
                        {item.label}
                      </button>
                    </SheetClose>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

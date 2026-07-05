"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useNav, type View } from "@/store/nav-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, Leaf, Sparkles, Moon, Sun } from "lucide-react";
import { useBrandIcons } from "@/hooks/use-brand-icons";
import { useTranslation } from "@/contexts/language-context";
import { useTheme } from "@/components/theme-provider";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { LOCALES, type Locale } from "@/i18n";

function getViewPath(view: View, locale: string): string {
  const paths: Record<View, string> = {
    home: `/${locale}`,
    products: `/${locale}#products`,
    agents: `/${locale}#agents`,
    blog: `/${locale}#blog`,
    testimonials: `/${locale}#testimonials`,
    about: `/${locale}#about`,
    contact: `/${locale}#contact`,
    blogDetail: `/${locale}#blog`,
    productDetail: `/${locale}#products`,
  };
  return paths[view];
}

export function Navbar() {
  const { view, setView } = useNav();
  const { saversIcon, chovilIcon } = useBrandIcons();
  const { t, locale } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = LOCALES.some((l) => pathname === `/${l}`) || pathname === "/";
  const isDark = isHome && !scrolled;

  const NAV_ITEMS: { label: string; view: View }[] = [
    { label: t.nav.home, view: "home" },
    { label: t.nav.products, view: "products" },
    { label: t.nav.agents, view: "agents" },
    { label: t.nav.blog, view: "blog" },
    { label: t.nav.testimonials, view: "testimonials" },
    { label: t.nav.about, view: "about" },
    { label: t.nav.contact, view: "contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (e: React.MouseEvent, v: View) => {
    e.preventDefault();
    setView(v);
    setMobileOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        isDark
          ? "bg-transparent"
          : "bg-white/90 backdrop-blur-md shadow-sm border-b border-border/50"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href={getViewPath("home", locale)}
            onClick={(e) => handleNav(e, "home")}
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
              <span className={cn("font-extrabold text-lg", isDark ? "text-white" : "text-foreground")}>
                ساورز <span className="text-chovil">و</span> چویل
              </span>
              <span
                className={cn(
                  "text-[10px] tracking-wide",
                  isDark ? "text-white/70" : "text-muted-foreground"
                )}
              >
                خشکبار و ادویه‌جات
              </span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="منوی اصلی">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.view}
                href={getViewPath(item.view, locale)}
                onClick={(e) => handleNav(e, item.view)}
                className={cn(
                  "px-3.5 py-2 rounded-lg text-sm font-medium transition-colors relative",
                  view === item.view || (item.view === "blog" && view === "blogDetail")
                    ? isDark
                      ? "bg-white/20 text-white"
                      : "bg-primary/10 text-primary"
                    : isDark
                      ? "text-white/90 hover:text-white hover:bg-white/10"
                      : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Language switcher + Theme toggle + Mobile menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-md transition-colors",
                isDark
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-muted text-foreground hover:bg-muted/80"
              )}
              aria-label="تغییر تم"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <LanguageSwitcher scrolled={!isDark} />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant={!isDark ? "outline" : "secondary"}
                  size="icon"
                  className={cn("lg:hidden", isDark && "bg-white/90")}
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
                <nav className="flex flex-col p-4 gap-1" aria-label="منوی موبایل">
                  {NAV_ITEMS.map((item) => (
                    <SheetClose asChild key={item.view}>
                      <a
                        href={getViewPath(item.view, locale)}
                        onClick={(e) => handleNav(e, item.view)}
                        className={cn(
                          "px-4 py-3 rounded-lg text-right font-medium transition-colors",
                          view === item.view
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        )}
                      >
                        {item.label}
                      </a>
                    </SheetClose>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

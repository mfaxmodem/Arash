"use client";

import { useNav, type View } from "@/store/nav-store";
import { Leaf, Sparkles, Phone, Mail, MapPin, Instagram, Send } from "lucide-react";
import { useBrandIcons } from "@/hooks/use-brand-icons";
import { useTranslation } from "@/contexts/language-context";

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

const NAV_ITEMS: { label: string; view: View }[] = [
  { label: "خانه", view: "home" },
  { label: "محصولات", view: "products" },
  { label: "نمایندگان", view: "agents" },
  { label: "بلاگ", view: "blog" },
  { label: "نظرات", view: "testimonials" },
  { label: "درباره ما", view: "about" },
  { label: "تماس", view: "contact" },
];

export function Footer() {
  const { setView } = useNav();
  const { saversIcon, chovilIcon } = useBrandIcons();
  const { locale } = useTranslation();
  const year = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date());

  const handleNav = (e: React.MouseEvent, v: View) => {
    e.preventDefault();
    setView(v);
  };

  return (
    <footer className="mt-auto bg-foreground text-background" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-savers text-savers-foreground overflow-hidden">
                {saversIcon ? <img src={saversIcon} alt="ساورز" className="w-full h-full object-cover" /> : <Leaf className="w-5 h-5" />}
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-chovil text-chovil-foreground -mr-3 overflow-hidden">
                {chovilIcon ? <img src={chovilIcon} alt="چویل" className="w-full h-full object-cover" /> : <Sparkles className="w-5 h-5" />}
              </div>
            </div>
            <h3 className="font-extrabold text-lg mb-2">
              ساورز <span className="text-chovil">و</span> چویل
            </h3>
            <p className="text-sm text-background/70 leading-relaxed">
              فروش و بسته‌بندی خشکبار، ادویه‌جات، قند و شکر با کیفیت تضمینی و ارسال به سراسر کشور.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold mb-4">دسترسی سریع</h4>
            <ul className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.view}>
                  <a
                    href={getViewPath(item.view, locale)}
                    onClick={(e) => handleNav(e, item.view)}
                    className="text-sm text-background/70 hover:text-chovil transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h4 className="font-bold mb-4">برندهای ما</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                {saversIcon ? <img src={saversIcon} alt="ساورز" className="w-4 h-4 rounded object-cover" /> : <Leaf className="w-4 h-4 text-savers" />}
                <span className="text-background/80">ساورز - خشکبار و آجیل</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                {chovilIcon ? <img src={chovilIcon} alt="چویل" className="w-4 h-4 rounded object-cover" /> : <Sparkles className="w-4 h-4 text-chovil" />}
                <span className="text-background/80">چویل - ادویه‌جات و قند و شکر</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">اطلاعات تماس</h4>
            <address className="not-italic space-y-3 text-sm text-background/70">
              <li className="flex items-start gap-2 list-none">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-chovil" />
                <span>تهران، خیابان ولیعصر، پلاک ۱۲۳۴</span>
              </li>
              <li className="flex items-center gap-2 list-none">
                <Phone className="w-4 h-4 shrink-0 text-chovil" />
                <a href="tel:+982188880000" dir="ltr">۰۲۱-۸۸۸۸۰۰۰۰</a>
              </li>
              <li className="flex items-center gap-2 list-none">
                <Mail className="w-4 h-4 shrink-0 text-chovil" />
                <a href="mailto:info@savers-chovil.ir" dir="ltr">info@savers-chovil.ir</a>
              </li>
            </address>
            <div className="flex items-center gap-2 mt-4">
              <a
                href="https://instagram.com/saverschovil"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="اینستاگرام"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-background/10 hover:bg-chovil transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://t.me/saverschovil"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="تلگرام"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-background/10 hover:bg-chovil transition-colors"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-background/60">
          <p>&copy; {year} تمامی حقوق برای شرکت ساورز و چویل محفوظ است.</p>
          <p className="flex items-center gap-1">
            ساخته شده با <span className="text-chovil">&hearts;</span> برای مشتریان عزیز
          </p>
        </div>
      </div>
    </footer>
  );
}

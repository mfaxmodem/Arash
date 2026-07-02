"use client";

import { useNav, type View } from "@/store/nav-store";
import { Leaf, Sparkles, Phone, Mail, MapPin, Instagram, Send } from "lucide-react";

const NAV_ITEMS: { label: string; view: View }[] = [
  { label: "خانه", view: "home" },
  { label: "محصولات", view: "products" },
  { label: "نمایندگان", view: "agents" },
  { label: "نظرات", view: "testimonials" },
  { label: "درباره ما", view: "about" },
  { label: "تماس", view: "contact" },
];

export function Footer() {
  const { setView } = useNav();
  const year = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date());

  return (
    <footer className="mt-auto bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-savers text-savers-foreground">
                <Leaf className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-chovil text-chovil-foreground -mr-3">
                <Sparkles className="w-5 h-5" />
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
                  <button
                    onClick={() => setView(item.view)}
                    className="text-sm text-background/70 hover:text-chovil transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h4 className="font-bold mb-4">برندهای ما</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Leaf className="w-4 h-4 text-savers" />
                <span className="text-background/80">ساورز - خشکبار و آجیل</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-chovil" />
                <span className="text-background/80">چویل - ادویه‌جات و قند و شکر</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">اطلاعات تماس</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-chovil" />
                <span>تهران، خیابان ولیعصر، پلاک ۱۲۳۴</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-chovil" />
                <span dir="ltr">۰۲۱-۸۸۸۸۰۰۰۰</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-chovil" />
                <span dir="ltr">info@savers-chovil.ir</span>
              </li>
            </ul>
            <div className="flex items-center gap-2 mt-4">
              <a
                href="#"
                aria-label="اینستاگرام"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-background/10 hover:bg-chovil transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="تلگرام"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-background/10 hover:bg-chovil transition-colors"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-background/60">
          <p>© {year} تمامی حقوق برای شرکت ساورز و چویل محفوظ است.</p>
          <p className="flex items-center gap-1">
            ساخته شده با <span className="text-chovil">♥</span> برای مشتریان عزیز
          </p>
        </div>
      </div>
    </footer>
  );
}

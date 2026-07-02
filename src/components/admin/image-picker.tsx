"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Upload, Link2, Image as ImageIcon } from "lucide-react";

const PRESET_IMAGES = [
  { url: "/images/pistachio.png", label: "پسته" },
  { url: "/images/almond.png", label: "بادام" },
  { url: "/images/walnut.png", label: "گردو" },
  { url: "/images/cashew.png", label: "بادام هندی" },
  { url: "/images/mixed-nuts.png", label: "آجیل مخلوط" },
  { url: "/images/dried-apricot.png", label: "زردآلو" },
  { url: "/images/saffron.png", label: "زعفران" },
  { url: "/images/turmeric.png", label: "زردچوبه" },
  { url: "/images/cinnamon.png", label: "دارچین" },
  { url: "/images/sugar.png", label: "شکر" },
  { url: "/images/hero-1.png", label: "بنر ۱" },
  { url: "/images/hero-2.png", label: "بنر ۲" },
  { url: "/images/hero-3.png", label: "بنر ۳" },
  { url: "/images/about-company.png", label: "کارخانه" },
  { url: "/images/brand-savers.png", label: "لوگو ساورز" },
  { url: "/images/brand-chovil.png", label: "لوگو چویل" },
];

export function ImagePicker({
  value,
  onChange,
  label = "تصویر",
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const [mode, setMode] = useState<"preset" | "url">("preset");

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode("preset")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium gap-1.5 inline-flex items-center",
            mode === "preset" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"
          )}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          انتخاب از گالری
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium gap-1.5 inline-flex items-center",
            mode === "url" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"
          )}
        >
          <Link2 className="w-3.5 h-3.5" />
          آدرس URL
        </button>
      </div>

      {mode === "preset" ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 custom-scroll">
          {PRESET_IMAGES.map((img) => (
            <button
              key={img.url}
              type="button"
              onClick={() => onChange(img.url)}
              className={cn(
                "aspect-square rounded-lg overflow-hidden border-2 transition-all",
                value === img.url
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-primary/40"
              )}
              title={img.label}
            >
              <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/images/... یا https://..."
          dir="ltr"
        />
      )}

      {value && (
        <div className="flex items-center gap-2 mt-2">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted border border-border shrink-0">
            <img src={value} alt="preview" className="w-full h-full object-cover" />
          </div>
          <span className="text-xs text-muted-foreground truncate" dir="ltr">{value}</span>
        </div>
      )}
    </div>
  );
}

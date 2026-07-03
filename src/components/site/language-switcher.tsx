"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "@/contexts/language-context";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher({ scrolled }: { scrolled?: boolean }) {
  const { locale } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: Locale) => {
    // Replace the current locale segment in the pathname
    const segments = pathname.split("/");
    // pathname is like /fa/ or /fa/products — segments[1] is the locale
    segments[1] = newLocale;
    const newPath = segments.join("/") || `/${newLocale}/`;
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={scrolled ? "outline" : "secondary"}
          size="icon"
          className={cn(!scrolled && "bg-white/90")}
          aria-label="Change language"
        >
          <Globe className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => switchLocale(l)}
            className={cn(locale === l && "bg-primary/10 text-primary font-bold")}
          >
            {LOCALE_LABELS[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

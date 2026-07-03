"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface LanguageTabsProps {
  fa: React.ReactNode;
  en: React.ReactNode;
  ar: React.ReactNode;
}

export function LanguageTabs({ fa, en, ar }: LanguageTabsProps) {
  return (
    <Tabs defaultValue="fa" className="w-full">
      <TabsList className="mb-3">
        <TabsTrigger value="fa">🇮🇷 فارسی</TabsTrigger>
        <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
        <TabsTrigger value="ar">🇸🇦 العربية</TabsTrigger>
      </TabsList>
      <TabsContent value="fa" className="space-y-4 mt-0">{fa}</TabsContent>
      <TabsContent value="en" className="space-y-4 mt-0">{en}</TabsContent>
      <TabsContent value="ar" className="space-y-4 mt-0">{ar}</TabsContent>
    </Tabs>
  );
}

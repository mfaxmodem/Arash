"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Product, Paginated } from "@/lib/types";
import { toPersianDigits, formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, FolderTree, Store, MessageSquareQuote, Mail, AlertTriangle, TrendingUp } from "lucide-react";

export function AdminDashboard() {
  const { data: productsData } = useQuery({
    queryKey: ["admin-products-all"],
    queryFn: () => api.get<Paginated<Product>>("/api/products?limit=1000"),
  });
  const products = productsData?.items ?? [];

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<{ items: any[] }>("/api/categories"),
  });
  const { data: agentData } = useQuery({
    queryKey: ["agents"],
    queryFn: () => api.get<{ items: any[] }>("/api/agents"),
  });
  const { data: testimonialData } = useQuery({
    queryKey: ["testimonials-all"],
    queryFn: () => api.get<{ items: any[] }>("/api/testimonials?all=true"),
  });
  const { data: messageData } = useQuery({
    queryKey: ["messages"],
    queryFn: () => api.get<{ items: any[] }>("/api/contact-messages"),
  });

  const lowStockProducts = products.filter((p) => p.stock <= p.lowStock);
  const pendingTestimonials = (testimonialData?.items ?? []).filter((t: any) => t.status === "PENDING");
  const newMessages = (messageData?.items ?? []).filter((m: any) => m.status === "NEW");

  const stats = [
    { label: "محصولات", value: products.length, icon: Package, color: "bg-primary" },
    { label: "دسته‌بندی‌ها", value: catData?.items.length ?? 0, icon: FolderTree, color: "bg-savers" },
    { label: "نمایندگان", value: agentData?.items.length ?? 0, icon: Store, color: "bg-chovil" },
    { label: "نظرات", value: testimonialData?.items.length ?? 0, icon: MessageSquareQuote, color: "bg-amber-500" },
    { label: "پیام‌ها", value: messageData?.items.length ?? 0, icon: Mail, color: "bg-blue-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">داشبورد مدیریت</h1>
        <p className="text-muted-foreground text-sm">نمای کلی از وضعیت سایت</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="overflow-hidden">
            <CardContent className="p-5">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${s.color} text-white mb-3`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-foreground">{toPersianDigits(s.value)}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-700 text-base">
              <AlertTriangle className="w-4 h-4" />
              موجودی کم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-700 mb-2">
              {toPersianDigits(lowStockProducts.length)} محصول
            </div>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-1 max-h-32 overflow-y-auto custom-scroll">
                {lowStockProducts.slice(0, 5).map((p) => (
                  <div key={p.id} className="text-xs text-foreground/70 flex justify-between">
                    <span className="truncate">{p.name}</span>
                    <span className="text-amber-600 font-bold shrink-0">{toPersianDigits(p.stock)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">موجودی همه محصولات مناسب است</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary text-base">
              <MessageSquareQuote className="w-4 h-4" />
              نظرات در انتظار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary mb-2">
              {toPersianDigits(pendingTestimonials.length)} نظر
            </div>
            <p className="text-xs text-muted-foreground">
              نیازمند بررسی و تایید شما
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700 text-base">
              <Mail className="w-4 h-4" />
              پیام‌های جدید
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-blue-700 mb-2">
              {toPersianDigits(newMessages.length)} پیام
            </div>
            <p className="text-xs text-muted-foreground">پاسخ‌دهی به مشتریان</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4" />
            آخرین محصولات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {products.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                  {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">موجودی: {toPersianDigits(p.stock)}</div>
                </div>
                <div className="text-sm font-bold text-primary shrink-0">{formatPrice(p.price)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

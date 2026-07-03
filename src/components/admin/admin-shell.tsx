"use client";

import { useNav } from "@/store/nav-store";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Images,
  Store,
  MessageSquareQuote,
  FileText,
  Mail,
  LogOut,
  Leaf,
  Sparkles,
  Newspaper,
  MessageSquare,
  ShieldCheck,
  Film,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminProducts } from "@/components/admin/admin-products";
import { AdminCategories } from "@/components/admin/admin-categories";
import { AdminSliders } from "@/components/admin/admin-sliders";
import { AdminAgents } from "@/components/admin/admin-agents";
import { AdminTestimonials } from "@/components/admin/admin-testimonials";
import { AdminBlog } from "@/components/admin/admin-blog";
import { AdminProductComments } from "@/components/admin/admin-product-comments";
import { AdminContent } from "@/components/admin/admin-content";
import { AdminMessages } from "@/components/admin/admin-messages";
import { AdminPassword } from "@/components/admin/admin-password";
import { AdminGallery } from "@/components/admin/admin-gallery";
import { toast } from "@/lib/toast";

const TABS = [
  { id: "dashboard", label: "داشبورد", icon: LayoutDashboard },
  { id: "products", label: "محصولات", icon: Package },
  { id: "categories", label: "دسته‌بندی‌ها", icon: FolderTree },
  { id: "sliders", label: "اسلایدر", icon: Images },
  { id: "agents", label: "نمایندگان", icon: Store },
  { id: "testimonials", label: "نظرات خریداران", icon: MessageSquareQuote },
  { id: "productComments", label: "نظرات محصولات", icon: MessageSquare },
  { id: "blog", label: "بلاگ", icon: Newspaper },
  { id: "content", label: "محتوای صفحات", icon: FileText },
  { id: "messages", label: "پیام‌ها", icon: Mail },
  { id: "password", label: "تغییر رمز عبور", icon: ShieldCheck },
  { id: "gallery", label: "گالری رسانه", icon: Film },
] as const;

export function AdminShell({ user }: { user: { email: string; name: string; role: string } }) {
  const { adminTab, setAdminTab, closeAdmin } = useNav();
  const qc = useQueryClient();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    // Critical: clear cached session so next open requires login again
    qc.removeQueries({ queryKey: ["me"] });
    toast.success("از پنل خارج شدید");
    if (typeof window !== "undefined" && window.location.hash === "#admin") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    closeAdmin();
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-l border-border flex flex-col shrink-0 hidden md:flex">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-savers text-savers-foreground">
              <Leaf className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-chovil text-chovil-foreground -mr-2">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="font-bold text-sm text-foreground">{user.name}</div>
          <div className="text-xs text-muted-foreground" dir="ltr">{user.email}</div>
          <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
            {user.role === "ADMIN" ? "مدیر کل" : "ویراستار"}
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scroll">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-right",
                adminTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            size="sm"
          >
            <LogOut className="w-4 h-4" />
            خروج از حساب
          </Button>
        </div>
      </aside>

      {/* Mobile tabs */}
      <div className="md:hidden border-b border-border bg-card overflow-x-auto">
        <div className="flex gap-1 p-2 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap",
                adminTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-muted"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-destructive gap-1.5 shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            خروج
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-background custom-scroll">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className={cn(adminTab === "dashboard" ? "block" : "hidden")}><AdminDashboard /></div>
          <div className={cn(adminTab === "products" ? "block" : "hidden")}><AdminProducts /></div>
          <div className={cn(adminTab === "categories" ? "block" : "hidden")}><AdminCategories /></div>
          <div className={cn(adminTab === "sliders" ? "block" : "hidden")}><AdminSliders /></div>
          <div className={cn(adminTab === "agents" ? "block" : "hidden")}><AdminAgents /></div>
          <div className={cn(adminTab === "testimonials" ? "block" : "hidden")}><AdminTestimonials /></div>
          <div className={cn(adminTab === "productComments" ? "block" : "hidden")}><AdminProductComments /></div>
          <div className={cn(adminTab === "blog" ? "block" : "hidden")}><AdminBlog /></div>
          <div className={cn(adminTab === "content" ? "block" : "hidden")}><AdminContent /></div>
          <div className={cn(adminTab === "messages" ? "block" : "hidden")}><AdminMessages /></div>
          <div className={cn(adminTab === "password" ? "block" : "hidden")}><AdminPassword /></div>
          <div className={cn(adminTab === "gallery" ? "block" : "hidden")}><AdminGallery /></div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useNav } from "@/store/nav-store";
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
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminProducts } from "@/components/admin/admin-products";
import { AdminCategories } from "@/components/admin/admin-categories";
import { AdminSliders } from "@/components/admin/admin-sliders";
import { AdminAgents } from "@/components/admin/admin-agents";
import { AdminTestimonials } from "@/components/admin/admin-testimonials";
import { AdminContent } from "@/components/admin/admin-content";
import { AdminMessages } from "@/components/admin/admin-messages";
import { toast } from "sonner";

const TABS = [
  { id: "dashboard", label: "داشبورد", icon: LayoutDashboard },
  { id: "products", label: "محصولات", icon: Package },
  { id: "categories", label: "دسته‌بندی‌ها", icon: FolderTree },
  { id: "sliders", label: "اسلایدر", icon: Images },
  { id: "agents", label: "نمایندگان", icon: Store },
  { id: "testimonials", label: "نظرات", icon: MessageSquareQuote },
  { id: "content", label: "محتوای صفحات", icon: FileText },
  { id: "messages", label: "پیام‌ها", icon: Mail },
] as const;

export function AdminShell({ user }: { user: { email: string; name: string; role: string } }) {
  const { adminTab, setAdminTab, closeAdmin } = useNav();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success("از پنل خارج شدید");
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
          {adminTab === "dashboard" && <AdminDashboard />}
          {adminTab === "products" && <AdminProducts />}
          {adminTab === "categories" && <AdminCategories />}
          {adminTab === "sliders" && <AdminSliders />}
          {adminTab === "agents" && <AdminAgents />}
          {adminTab === "testimonials" && <AdminTestimonials />}
          {adminTab === "content" && <AdminContent />}
          {adminTab === "messages" && <AdminMessages />}
        </div>
      </div>
    </div>
  );
}

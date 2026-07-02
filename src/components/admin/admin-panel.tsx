"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useNav } from "@/store/nav-store";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminShell } from "@/components/admin/admin-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminPanel() {
  const { closeAdmin } = useNav();
  const [showCloseHint, setShowCloseHint] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.get<{ authenticated: boolean; user?: { email: string; name: string; role: string } }>("/api/me"),
    retry: false,
  });

  // Lock body scroll when admin is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAdmin();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeAdmin]);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Top close bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-foreground text-background text-sm">
        <span className="font-medium">
          پنل مدیریت ساورز و چویل
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={closeAdmin}
          className="text-background hover:bg-background/20 hover:text-background gap-1 h-8"
        >
          <X className="w-4 h-4" />
          بستن (ESC)
        </Button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="w-full h-full" />
        </div>
      ) : data?.authenticated && data.user ? (
        <AdminShell user={data.user} />
      ) : (
        <AdminLogin />
      )}

      {showCloseHint && !isLoading && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-foreground/90 text-background text-xs px-3 py-1.5 rounded-full shadow-lg cursor-pointer"
          onClick={() => setShowCloseHint(false)}
        >
          برای بازگشت به سایت، کلید ESC را بزنید یا دکمه بستن را کلیک کنید
        </div>
      )}
    </div>
  );
}

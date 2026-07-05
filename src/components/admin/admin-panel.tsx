"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useNav } from "@/store/nav-store";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminShell } from "@/components/admin/admin-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminPanel() {
  const { closeAdmin } = useNav();
  const qc = useQueryClient();
  const [showCloseHint, setShowCloseHint] = useState(true);

  // Always fetch fresh session status (no caching) to detect logout properly
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["me"],
    queryFn: () =>
      api.get<{ authenticated: boolean; user?: { email: string; name: string; role: string } }>(
        "/api/me"
      ),
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  // Lock body scroll when admin is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ESC to close + clear hash
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAdmin();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeAdmin]);

  const handleClose = () => {
    // invalidate me so next open reflects real auth state
    qc.invalidateQueries({ queryKey: ["me"] });
    if (typeof window !== "undefined" && window.location.hash === "#admin") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    closeAdmin();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden">
      {/* Top close bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-foreground text-background text-sm">
        <span className="font-medium">پنل مدیریت ساورز و چویل</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="text-background hover:bg-background/20 hover:text-background gap-1 h-8"
        >
          <X className="w-4 h-4" />
          بستن (ESC)
        </Button>
      </div>

      {isLoading || isFetching ? (
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="w-full h-full" />
        </div>
      ) : data?.authenticated && data.user ? (
        <AdminShell user={data.user} />
      ) : (
        <AdminLogin />
      )}

      {showCloseHint && !isLoading && !(isFetching) && (
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

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Sparkles, Lock, Mail, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("ایمیل یا رمز عبور اشتباه است");
        toast.error("ورود ناموفق بود");
        setLoading(false);
      } else {
        toast.success("خوش آمدید!");
        // Force a full reload to ensure session is picked up reliably
        setTimeout(() => window.location.reload(), 400);
      }
    } catch {
      setError("خطا در ارتباط با سرور");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-spice-gradient">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-3xl shadow-2xl p-8 border border-border">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-savers text-savers-foreground shadow-md">
                <Leaf className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-chovil text-chovil-foreground shadow-md -mr-3">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-foreground">پنل مدیریت</h1>
            <p className="text-sm text-muted-foreground mt-1">
              ساورز و چویل | ورود مدیران
            </p>
          </div>

          {/* Security badge */}
          <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl p-3 mb-6">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            <p className="text-xs text-foreground/70">
              دسترسی تنها برای مدیران مجاز. تمام فعالیت‌ها ثبت و مانیتور می‌شود.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-xl p-3 mb-4 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">ایمیل</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10"
                  dir="ltr"
                  placeholder="admin@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">رمز عبور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  dir="ltr"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 bg-primary hover:bg-primary/90"
              size="lg"
            >
              {loading ? "در حال ورود..." : "ورود به پنل"}
              <Lock className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              برای تست: admin@savers-chovil.ir / admin12345
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

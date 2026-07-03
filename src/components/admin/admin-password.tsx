"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";

export function AdminPassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      api.post("/api/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    onSuccess: () => {
      toast.success("رمز عبور با موفقیت تغییر کرد");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("رمز عبور جدید و تکرار آن مطابقت ندارند");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("رمز عبور جدید باید حداقل ۸ کاراکتر باشد");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <ShieldCheck className="w-6 h-6" />
          تغییر رمز عبور
        </h1>
        <p className="text-muted-foreground text-sm">رمز عبور حساب خود را تغییر دهید</p>
      </div>

      <div className="max-w-md bg-card rounded-xl border border-border p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current-password">رمز عبور فعلی</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="current-password"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10 pl-10"
                dir="ltr"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-password">رمز عبور جدید</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="new-password"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10 pl-10"
                dir="ltr"
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">حداقل ۸ کاراکتر</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">تکرار رمز عبور جدید</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10"
                dir="ltr"
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full gap-2"
          >
            {mutation.isPending ? "در حال ذخیره..." : "ذخیره رمز عبور جدید"}
            <ShieldCheck className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

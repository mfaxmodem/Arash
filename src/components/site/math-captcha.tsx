"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface MathCaptchaProps {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  className?: string;
}

export function MathCaptcha({ value, onChange, error, className }: MathCaptchaProps) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCaptcha = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/captcha");
      const data = await res.json();
      setQuestion(data.question);
    } catch {
      setQuestion("خطا در بارگذاری");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>سوال امنیتی *</Label>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm font-mono bg-muted px-3 py-2 rounded-md select-none whitespace-nowrap min-w-[100px] text-center">
            {loading ? "..." : question}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => { fetchCaptcha(); onChange(""); }}
            disabled={loading}
            aria-label="سوال جدید"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="پاسخ"
          className="w-24 text-center"
          dir="ltr"
          type="number"
          inputMode="numeric"
          required
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// Honeypot field — invisible to users, bots fill it
export function HoneypotField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        opacity: 0,
        height: 0,
        overflow: "hidden",
      }}
    >
      <label htmlFor="website-confirm">Leave this empty</label>
      <input
        id="website-confirm"
        name="website_confirm"
        type="text"
        autoComplete="off"
        tabIndex={-1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ContactMessage } from "@/lib/types";
import { formatPersianDateTime, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Mail, MailOpen, MailCheck, Trash2, Phone, User, Clock } from "lucide-react";
import { useState } from "react";

const STATUS = {
  NEW: { label: "جدید", icon: Mail, cls: "bg-blue-100 text-blue-700" },
  READ: { label: "خوانده شده", icon: MailOpen, cls: "bg-amber-100 text-amber-700" },
  REPLIED: { label: "پاسخ داده شده", icon: MailCheck, cls: "bg-green-100 text-green-700" },
};

export function AdminMessages() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: () => api.get<{ items: ContactMessage[] }>("/api/contact-messages"),
  });
  const messages = data?.items ?? [];

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/api/contact-messages/${id}`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["messages"] }); },
  });
  const delMut = useMutation({
    mutationFn: (id: string) => api.del(`/api/contact-messages/${id}`),
    onSuccess: () => { toast.success("حذف شد"); qc.invalidateQueries({ queryKey: ["messages"] }); if (selected) setSelected(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  const openMessage = (m: ContactMessage) => {
    setSelected(m.id);
    if (m.status === "NEW") updateMut.mutate({ id: m.id, status: "READ" });
  };

  const selectedMsg = messages.find((m) => m.id === selected);
  const newCount = messages.filter((m) => m.status === "NEW").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <Mail className="w-6 h-6" /> پیام‌های تماس
        </h1>
        <p className="text-muted-foreground text-sm">
          {newCount > 0 ? `${newCount} پیام جدید` : "همه پیام‌ها بررسی شده‌اند"}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : messages.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground bg-card rounded-xl border border-border">
          پیامی دریافت نشده است
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Message list */}
          <div className="space-y-2">
            {messages.map((m) => {
              const st = STATUS[m.status];
              const isActive = selected === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => openMessage(m)}
                  className={cn(
                    "w-full text-right bg-card rounded-xl border p-4 shadow-sm transition-all hover:shadow-md",
                    isActive ? "border-primary ring-1 ring-primary/20" : "border-border",
                    m.status === "NEW" && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", st.cls)}>
                        <st.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-foreground text-sm flex items-center gap-1">
                          {m.name}
                          {m.status === "NEW" && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{m.subject}</div>
                      </div>
                    </div>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0", st.cls)}>{st.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{m.message}</p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2">
                    <Clock className="w-3 h-3" />{formatPersianDateTime(m.createdAt)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          {selectedMsg ? (
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm lg:sticky lg:top-4 h-fit">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{selectedMsg.name}</h3>
                    <a href={`mailto:${selectedMsg.email}`} className="text-xs text-primary" dir="ltr">{selectedMsg.email}</a>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => delMut.mutate(selectedMsg.id)}
                  className="text-destructive h-8 w-8"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span dir="ltr">{selectedMsg.phone || "—"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">موضوع:</span>
                  <div className="font-medium text-foreground">{selectedMsg.subject}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">پیام:</span>
                  <div className="bg-muted/40 rounded-lg p-3 text-foreground/80 leading-relaxed mt-1">
                    {selectedMsg.message}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                  {formatPersianDateTime(selectedMsg.createdAt)}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateMut.mutate({ id: selectedMsg.id, status: "REPLIED" })}
                  className="gap-1.5"
                >
                  <MailCheck className="w-3.5 h-3.5" /> علامت‌گذاری به عنوان پاسخ داده شده
                </Button>
                <a href={`mailto:${selectedMsg.email}?subject=پاسخ: ${encodeURIComponent(selectedMsg.subject)}`}>
                  <Button size="sm" className="gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> پاسخ با ایمیل
                  </Button>
                </a>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center justify-center bg-card rounded-xl border border-border border-dashed p-12 text-muted-foreground">
              یک پیام را برای مشاهده جزئیات انتخاب کنید
            </div>
          )}
        </div>
      )}
    </div>
  );
}

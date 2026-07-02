"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { FileText, Save, MapPin, Info, Phone } from "lucide-react";

interface ContentField {
  key: string;
  label: string;
  type: "text" | "textarea";
  group: "about" | "contact" | "map";
  placeholder?: string;
}

const FIELDS: ContentField[] = [
  { key: "about_title", label: "عنوان بخش درباره ما", type: "text", group: "about" },
  { key: "about_body", label: "متن درباره ما", type: "textarea", group: "about" },
  { key: "contact_address", label: "آدرس", type: "textarea", group: "contact" },
  { key: "contact_phone", label: "تلفن ثابت", type: "text", group: "contact" },
  { key: "contact_mobile", label: "موبایل", type: "text", group: "contact" },
  { key: "contact_email", label: "ایمیل", type: "text", group: "contact" },
  { key: "contact_hours", label: "ساعات کاری", type: "text", group: "contact" },
  { key: "map_lat", label: "عرض جغرافیایی (Latitude)", type: "text", group: "map", placeholder: "35.7219" },
  { key: "map_lng", label: "طول جغرافیایی (Longitude)", type: "text", group: "map", placeholder: "51.3347" },
  { key: "map_zoom", label: "زوم نقشه", type: "text", group: "map", placeholder: "14" },
  { key: "map_address", label: "آدرس نمایشی روی نقشه", type: "text", group: "map" },
];

const GROUPS = [
  { id: "about", label: "بخش درباره ما", icon: Info },
  { id: "contact", label: "اطلاعات تماس", icon: Phone },
  { id: "map", label: "موقعیت مکانی (نقشه)", icon: MapPin },
] as const;

export function AdminContent() {
  const qc = useQueryClient();
  // Store only local edits (overrides on top of server data)
  const [edits, setEdits] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["page-content"],
    queryFn: () => api.get<{ content: Record<string, string> }>("/api/page-content"),
  });

  const serverContent = data?.content ?? {};
  // Merged view: local edits override server values
  const getValue = (key: string) => (key in edits ? edits[key] : (serverContent[key] ?? ""));
  const setValue = (key: string, value: string) => setEdits((prev) => ({ ...prev, [key]: value }));

  const saveMut = useMutation({
    mutationFn: (payload: { key: string; value: string }) => api.put(`/api/page-content/${payload.key}`, { value: payload.value }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["page-content"] }); },
  });

  const saveAll = async () => {
    let count = 0;
    for (const field of FIELDS) {
      const val = getValue(field.key);
      const original = serverContent[field.key] ?? "";
      if (val !== original) {
        try {
          await saveMut.mutateAsync({ key: field.key, value: val });
          count++;
        } catch { /* skip */ }
      }
    }
    toast.success(count > 0 ? `${count} مورد ذخیره شد` : "تغییری وجود نداشت");
  };

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><FileText className="w-6 h-6" /> محتوای صفحات</h1>
          <p className="text-muted-foreground text-sm">ویرایش متون بخش‌های درباره ما، تماس و نقشه</p>
        </div>
        <Button onClick={saveAll} disabled={saveMut.isPending} className="gap-2">
          <Save className="w-4 h-4" /> ذخیره تغییرات
        </Button>
      </div>

      {GROUPS.map((group) => (
        <div key={group.id} className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <group.icon className="w-5 h-5 text-primary" />
            {group.label}
          </h2>
          <div className="space-y-4">
            {FIELDS.filter((f) => f.group === group.id).map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label>{field.label}</Label>
                {field.type === "text" ? (
                  <Input
                    value={getValue(field.key)}
                    onChange={(e) => setValue(field.key, e.target.value)}
                    dir={field.group === "map" ? "ltr" : "rtl"}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <Textarea
                    value={getValue(field.key)}
                    onChange={(e) => setValue(field.key, e.target.value)}
                    rows={field.key === "about_body" ? 6 : 3}
                    maxLength={field.key === "about_body" ? 50000 : 1000}
                  />
                )}
                <p className="text-[10px] text-muted-foreground" dir="ltr">{field.key}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button onClick={saveAll} disabled={saveMut.isPending} className="gap-2">
          <Save className="w-4 h-4" /> ذخیره همه تغییرات
        </Button>
      </div>
    </div>
  );
}

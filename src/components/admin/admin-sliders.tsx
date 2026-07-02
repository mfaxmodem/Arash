"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Slider } from "@/lib/types";
import { toPersianDigits, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ImagePicker } from "@/components/admin/image-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Images } from "lucide-react";

export function AdminSliders() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Slider | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", image: "", link: "", buttonText: "", sortOrder: "0", active: true });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["sliders"],
    queryFn: () => api.get<{ items: Slider[] }>("/api/sliders"),
  });
  const sliders = data?.items ?? [];

  const saveMut = useMutation({
    mutationFn: (payload: any) =>
      editing ? api.put(`/api/sliders/${editing.id}`, payload) : api.post("/api/sliders", payload),
    onSuccess: () => { toast.success("ذخیره شد"); qc.invalidateQueries({ queryKey: ["sliders"] }); setOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => api.del(`/api/sliders/${id}`),
    onSuccess: () => { toast.success("حذف شد"); qc.invalidateQueries({ queryKey: ["sliders"] }); setDeleteId(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => { setEditing(null); setForm({ title: "", subtitle: "", image: "", link: "", buttonText: "", sortOrder: "0", active: true }); setOpen(true); };
  const openEdit = (s: Slider) => { setEditing(s); setForm({ title: s.title, subtitle: s.subtitle || "", image: s.image, link: s.link || "", buttonText: s.buttonText || "", sortOrder: String(s.sortOrder), active: s.active }); setOpen(true); };

  const save = () => {
    if (form.title.trim().length < 2) return toast.error("عنوان الزامی است");
    if (!form.image) return toast.error("تصویر الزامی است");
    saveMut.mutate({
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      image: form.image,
      link: form.link.trim(),
      buttonText: form.buttonText.trim(),
      sortOrder: Number(form.sortOrder) || 0,
      active: form.active,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><Images className="w-6 h-6" /> مدیریت اسلایدر</h1>
          <p className="text-muted-foreground text-sm">تصاویر و لینک‌های اسلایدر اصلی</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> افزودن اسلاید</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {sliders.map((s) => (
            <div key={s.id} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm flex flex-col sm:flex-row">
              <div className="sm:w-64 h-40 sm:h-auto shrink-0 bg-muted overflow-hidden relative">
                <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                {!s.active && <div className="absolute inset-0 bg-background/60 flex items-center justify-center"><span className="text-xs font-bold bg-destructive text-white px-2 py-1 rounded">غیرفعال</span></div>}
              </div>
              <div className="flex-1 p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-foreground">{s.title}</h3>
                    {s.subtitle && <p className="text-sm text-muted-foreground">{s.subtitle}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">ترتیب: {toPersianDigits(s.sortOrder)}</span>
                </div>
                {s.buttonText && <span className="inline-block w-fit text-xs bg-primary/10 text-primary px-2 py-1 rounded-full mb-2">{s.buttonText} ← {s.link || "#"}</span>}
                <div className="flex gap-1 mt-auto pt-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(s)} className="gap-1.5"><Pencil className="w-3.5 h-3.5" /> ویرایش</Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(s.id)} className="text-destructive gap-1.5"><Trash2 className="w-3.5 h-3.5" /> حذف</Button>
                </div>
              </div>
            </div>
          ))}
          {sliders.length === 0 && <div className="p-12 text-center text-muted-foreground bg-card rounded-xl border border-border">اسلایدی یافت نشد</div>}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "ویرایش اسلاید" : "افزودن اسلاید"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>عنوان *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={150} /></div>
            <div className="space-y-1.5"><Label>زیرعنوان</Label><Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} maxLength={300} /></div>
            <ImagePicker value={form.image} onChange={(v) => setForm({ ...form, image: v })} label="تصویر اسلاید *" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>متن دکمه</Label><Input value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} maxLength={50} /></div>
              <div className="space-y-1.5"><Label>لینک</Label><Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} dir="ltr" placeholder="#products" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>ترتیب نمایش</Label><Input value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} dir="ltr" type="number" /></div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label>فعال</Label>
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={saveMut.isPending} className="flex-1">{saveMut.isPending ? "ذخیره..." : "ذخیره"}</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>حذف اسلاید</AlertDialogTitle><AlertDialogDescription>آیا مطمئن هستید؟</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>انصراف</AlertDialogCancel><AlertDialogAction onClick={() => deleteId && delMut.mutate(deleteId)} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

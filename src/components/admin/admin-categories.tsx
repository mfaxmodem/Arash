"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";
import { slugify, cn, toPersianDigits } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ImagePicker } from "@/components/admin/image-picker";
import { LanguageTabs } from "@/components/admin/language-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { Plus, Pencil, Trash2, FolderTree, Leaf, Sparkles } from "lucide-react";

const BRANDS = [
  { value: "BOTH", label: "هر دو برند" },
  { value: "SAVERS", label: "ساورز" },
  { value: "CHOVIL", label: "چویل" },
];

interface FormState {
  name: string; nameEn: string; nameAr: string;
  slug: string;
  description: string; descriptionEn: string; descriptionAr: string;
  image: string; brand: string; sortOrder: string;
}

const EMPTY: FormState = {
  name: "", nameEn: "", nameAr: "",
  slug: "",
  description: "", descriptionEn: "", descriptionAr: "",
  image: "", brand: "BOTH", sortOrder: "0",
};

export function AdminCategories() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<{ items: Category[] }>("/api/categories"),
  });
  const categories = data?.items ?? [];

  const saveMut = useMutation({
    mutationFn: (payload: any) =>
      editing ? api.put(`/api/categories/${editing.id}`, payload) : api.post("/api/categories", payload),
    onSuccess: () => {
      toast.success(editing ? "به‌روزرسانی شد" : "دسته ایجاد شد");
      qc.invalidateQueries({ queryKey: ["categories"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => api.del(`/api/categories/${id}`),
    onSuccess: () => {
      toast.success("حذف شد");
      qc.invalidateQueries({ queryKey: ["categories"] });
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      name: c.name, nameEn: (c as any).nameEn || "", nameAr: (c as any).nameAr || "",
      slug: c.slug,
      description: c.description || "", descriptionEn: (c as any).descriptionEn || "", descriptionAr: (c as any).descriptionAr || "",
      image: c.image || "", brand: c.brand, sortOrder: String(c.sortOrder),
    });
    setOpen(true);
  };

  const set = (key: keyof FormState, val: any) => setForm((f) => ({ ...f, [key]: val }));

  const save = () => {
    if (form.name.trim().length < 2) return toast.error("نام الزامی است");
    saveMut.mutate({
      name: form.name.trim(), nameEn: form.nameEn.trim() || undefined, nameAr: form.nameAr.trim() || undefined,
      slug: form.slug.trim() || slugify(form.name),
      description: form.description.trim() || undefined, descriptionEn: form.descriptionEn.trim() || undefined, descriptionAr: form.descriptionAr.trim() || undefined,
      image: form.image, brand: form.brand, sortOrder: Number(form.sortOrder) || 0,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><FolderTree className="w-6 h-6" /> مدیریت دسته‌بندی‌ها</h1>
          <p className="text-muted-foreground text-sm">دسته‌بندی محصولات</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> افزودن دسته</Button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {c.image ? <img src={c.image} alt={c.name} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center"><FolderTree className="w-6 h-6 text-primary" /></div>}
                  <div>
                    <h3 className="font-bold text-foreground">{c.name}</h3>
                    <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full", c.brand === "SAVERS" ? "brand-savers" : c.brand === "CHOVIL" ? "brand-chovil" : "bg-primary/10 text-primary")}>
                      {c.brand === "SAVERS" ? <><Leaf className="w-3 h-3" />ساورز</> : c.brand === "CHOVIL" ? <><Sparkles className="w-3 h-3" />چویل</> : "هر دو"}
                    </span>
                  </div>
                </div>
              </div>
              {c.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{c.description}</p>}
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">{toPersianDigits(c._count?.products ?? 0)} محصول</span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(c)} className="h-8 w-8"><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteId(c.id)} className="h-8 w-8 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(o) => { if (!o) { setEditing(null); setForm(EMPTY); } setOpen(o); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto z-[110]" overlayClassName="z-[110]">
          <DialogHeader><DialogTitle>{editing ? "ویرایش دسته" : "افزودن دسته جدید"}</DialogTitle></DialogHeader>

          <LanguageTabs
            fa={
              <>
                <div className="space-y-1.5">
                  <Label>نام دسته (فارسی) *</Label>
                  <Input value={form.name} onChange={(e) => { const n = e.target.value; setForm({ ...form, name: n, slug: editing ? form.slug : slugify(n) }); }} />
                </div>
                <div className="space-y-1.5">
                  <Label>اسلاگ *</Label>
                  <Input value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label>توضیحات (فارسی)</Label>
                  <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} maxLength={1000} />
                </div>
              </>
            }
            en={
              <>
                <div className="space-y-1.5">
                  <Label>Category Name (EN)</Label>
                  <Input value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label>Description (EN)</Label>
                  <Textarea value={form.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} rows={2} maxLength={1000} dir="ltr" />
                </div>
              </>
            }
            ar={
              <>
                <div className="space-y-1.5">
                  <Label>اسم التصنيف (AR)</Label>
                  <Input value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} dir="rtl" />
                </div>
                <div className="space-y-1.5">
                  <Label>الوصف (AR)</Label>
                  <Textarea value={form.descriptionAr} onChange={(e) => set("descriptionAr", e.target.value)} rows={2} maxLength={1000} dir="rtl" />
                </div>
              </>
            }
          />

          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-1.5">
              <Label>برند</Label>
              <Select value={form.brand} onValueChange={(v) => set("brand", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="z-[110]">{BRANDS.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>ترتیب نمایش</Label>
              <Input value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} dir="ltr" type="number" />
            </div>
          </div>
          <ImagePicker value={form.image} onChange={(v) => set("image", v)} label="تصویر دسته" />

          <div className="flex gap-2">
            <Button onClick={save} disabled={saveMut.isPending} className="flex-1">{saveMut.isPending ? "ذخیره..." : "ذخیره"}</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="z-[110]" overlayClassName="z-[110]">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف دسته</AlertDialogTitle>
            <AlertDialogDescription>اگر این دسته دارای محصول باشد قابل حذف نیست.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && delMut.mutate(deleteId)} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

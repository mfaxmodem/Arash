"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BlogPost } from "@/lib/types";
import { slugify, formatPersianDate, cn, toPersianDigits } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ImagePicker } from "@/components/admin/image-picker";
import { LanguageTabs } from "@/components/admin/language-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { Plus, Pencil, Trash2, Newspaper, Calendar } from "lucide-react";

interface FormState {
  title: string; titleEn: string; titleAr: string;
  slug: string;
  excerpt: string; excerptEn: string; excerptAr: string;
  content: string; contentEn: string; contentAr: string;
  image: string; author: string; tags: string; published: boolean;
}

const EMPTY: FormState = {
  title: "", titleEn: "", titleAr: "",
  slug: "",
  excerpt: "", excerptEn: "", excerptAr: "",
  content: "", contentEn: "", contentAr: "",
  image: "", author: "تیم ساورز و چویل", tags: "", published: false,
};

export function AdminBlog() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["blog-admin"],
    queryFn: () => api.get<{ items: BlogPost[] }>("/api/blog?all=true"),
  });
  const posts = data?.items ?? [];

  const saveMut = useMutation({
    mutationFn: (payload: any) =>
      editing ? api.put(`/api/blog/${editing.id}`, payload) : api.post("/api/blog", payload),
    onSuccess: () => {
      toast.success(editing ? "به‌روزرسانی شد" : "مقاله ایجاد شد");
      qc.invalidateQueries({ queryKey: ["blog-admin"] });
      qc.invalidateQueries({ queryKey: ["blog-public"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => api.del(`/api/blog/${id}`),
    onSuccess: () => {
      toast.success("حذف شد");
      qc.invalidateQueries({ queryKey: ["blog-admin"] });
      qc.invalidateQueries({ queryKey: ["blog-public"] });
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (p: BlogPost) => {
    setEditing(p);
    setForm({
      title: p.title, titleEn: (p as any).titleEn || "", titleAr: (p as any).titleAr || "",
      slug: p.slug,
      excerpt: p.excerpt || "", excerptEn: (p as any).excerptEn || "", excerptAr: (p as any).excerptAr || "",
      content: p.content, contentEn: (p as any).contentEn || "", contentAr: (p as any).contentAr || "",
      image: p.image || "", author: p.author, tags: p.tags || "", published: p.published,
    });
    setOpen(true);
  };

  const set = (key: keyof FormState, val: any) => setForm((f) => ({ ...f, [key]: val }));

  const save = () => {
    if (form.title.trim().length < 2) return toast.error("عنوان الزامی است");
    if (form.content.trim().length < 5) return toast.error("محتوا الزامی است");
    saveMut.mutate({
      title: form.title.trim(), titleEn: form.titleEn.trim() || undefined, titleAr: form.titleAr.trim() || undefined,
      slug: form.slug.trim() || slugify(form.title),
      excerpt: form.excerpt.trim() || undefined, excerptEn: form.excerptEn.trim() || undefined, excerptAr: form.excerptAr.trim() || undefined,
      content: form.content.trim(), contentEn: form.contentEn.trim() || undefined, contentAr: form.contentAr.trim() || undefined,
      image: form.image, author: form.author.trim(), tags: form.tags.trim(), published: form.published,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><Newspaper className="w-6 h-6" /> مدیریت بلاگ</h1>
          <p className="text-muted-foreground text-sm">مقالات و مطالب وب‌سایت</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> افزودن مقاله</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground bg-card rounded-xl border border-border">مقاله‌ای موجود نیست</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {posts.map((p) => (
            <div key={p.id} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm flex">
              <div className="w-28 h-28 shrink-0 bg-muted overflow-hidden">
                {p.image && <img src={p.image} alt={p.title} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 p-3 flex flex-col min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-foreground text-sm line-clamp-1">{p.title}</h3>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0", p.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                    {p.published ? "منتشر شده" : "پیش‌نویس"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">{p.excerpt || p.content}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2">
                  <Calendar className="w-3 h-3" />{formatPersianDate(p.createdAt)}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)} className="h-7 gap-1 text-xs"><Pencil className="w-3 h-3" /> ویرایش</Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(p.id)} className="h-7 gap-1 text-xs text-destructive"><Trash2 className="w-3 h-3" /> حذف</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(o) => { if (!o) { setEditing(null); setForm(EMPTY); } setOpen(o); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[110]" overlayClassName="z-[110]">
          <DialogHeader><DialogTitle>{editing ? "ویرایش مقاله" : "افزودن مقاله جدید"}</DialogTitle></DialogHeader>

          <LanguageTabs
            fa={
              <>
                <div className="space-y-1.5">
                  <Label>عنوان (فارسی) *</Label>
                  <Input value={form.title} onChange={(e) => { const t = e.target.value; setForm({ ...form, title: t, slug: editing ? form.slug : slugify(t) }); }} maxLength={200} />
                </div>
                <div className="space-y-1.5">
                  <Label>اسلاگ (URL)</Label>
                  <Input value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label>خلاصه (فارسی)</Label>
                  <Textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} maxLength={500} placeholder="توضیح کوتاه مقاله" />
                </div>
                <div className="space-y-1.5">
                  <Label>محتوای کامل (فارسی) *</Label>
                  <Textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={8} maxLength={50000} />
                </div>
              </>
            }
            en={
              <>
                <div className="space-y-1.5">
                  <Label>Title (EN)</Label>
                  <Input value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} dir="ltr" maxLength={200} />
                </div>
                <div className="space-y-1.5">
                  <Label>Excerpt (EN)</Label>
                  <Textarea value={form.excerptEn} onChange={(e) => set("excerptEn", e.target.value)} rows={2} maxLength={500} dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label>Full Content (EN) *</Label>
                  <Textarea value={form.contentEn} onChange={(e) => set("contentEn", e.target.value)} rows={8} maxLength={50000} dir="ltr" />
                </div>
              </>
            }
            ar={
              <>
                <div className="space-y-1.5">
                  <Label>العنوان (AR)</Label>
                  <Input value={form.titleAr} onChange={(e) => set("titleAr", e.target.value)} dir="rtl" maxLength={200} />
                </div>
                <div className="space-y-1.5">
                  <Label>ملخص (AR)</Label>
                  <Textarea value={form.excerptAr} onChange={(e) => set("excerptAr", e.target.value)} rows={2} maxLength={500} dir="rtl" />
                </div>
                <div className="space-y-1.5">
                  <Label>المحتوى الكامل (AR) *</Label>
                  <Textarea value={form.contentAr} onChange={(e) => set("contentAr", e.target.value)} rows={8} maxLength={50000} dir="rtl" />
                </div>
              </>
            }
          />

          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-1.5">
              <Label>نویسنده</Label>
              <Input value={form.author} onChange={(e) => set("author", e.target.value)} maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <Label>برچسب‌ها (با کاما جدا کنید)</Label>
              <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="پسته,سلامت,آجیل" />
            </div>
          </div>
          <ImagePicker value={form.image} onChange={(v) => set("image", v)} label="تصویر مقاله" />
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div><Label>انتشار</Label><p className="text-xs text-muted-foreground">در سایت نمایش داده می‌شود</p></div>
            <Switch checked={form.published} onCheckedChange={(v) => set("published", v)} />
          </div>

          <div className="flex gap-2">
            <Button onClick={save} disabled={saveMut.isPending} className="flex-1 gap-2">{saveMut.isPending ? "در حال ذخیره..." : "ذخیره"}</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="z-[110]" overlayClassName="z-[110]">
          <AlertDialogHeader><AlertDialogTitle>حذف مقاله</AlertDialogTitle><AlertDialogDescription>آیا از حذف این مقاله مطمئن هستید؟</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && delMut.mutate(deleteId)} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

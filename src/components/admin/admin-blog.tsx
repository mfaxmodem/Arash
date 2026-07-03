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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { Plus, Pencil, Trash2, Newspaper, Eye, Calendar } from "lucide-react";

export function AdminBlog() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", image: "", author: "تیم ساورز و چویل", tags: "", published: false,
  });
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

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", slug: "", excerpt: "", content: "", image: "", author: "تیم ساورز و چویل", tags: "", published: false });
    setOpen(true);
  };
  const openEdit = (p: BlogPost) => {
    setEditing(p);
    setForm({
      title: p.title, slug: p.slug, excerpt: p.excerpt || "", content: p.content,
      image: p.image || "", author: p.author, tags: p.tags || "", published: p.published,
    });
    setOpen(true);
  };

  const save = () => {
    if (form.title.trim().length < 2) return toast.error("عنوان الزامی است");
    if (form.content.trim().length < 5) return toast.error("محتوا الزامی است");
    saveMut.mutate({
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      image: form.image,
      author: form.author.trim(),
      tags: form.tags.trim(),
      published: form.published,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Newspaper className="w-6 h-6" />
            مدیریت بلاگ
          </h1>
          <p className="text-muted-foreground text-sm">مقالات و مطالب وب‌سایت</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" />
          افزودن مقاله
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground bg-card rounded-xl border border-border">
          مقاله‌ای موجود نیست
        </div>
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
                  <Calendar className="w-3 h-3" />
                  {formatPersianDate(p.createdAt)}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)} className="h-7 gap-1 text-xs">
                    <Pencil className="w-3 h-3" /> ویرایش
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(p.id)} className="h-7 gap-1 text-xs text-destructive">
                    <Trash2 className="w-3 h-3" /> حذف
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(o) => { if (!o) { setEditing(null); setForm({ title: "", slug: "", excerpt: "", content: "", image: "", author: "تیم ساورز و چویل", tags: "", published: false }); } setOpen(o); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[110]" overlayClassName="z-[110]">
          <DialogHeader>
            <DialogTitle>{editing ? "ویرایش مقاله" : "افزودن مقاله جدید"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>عنوان *</Label>
              <Input
                value={form.title}
                onChange={(e) => {
                  const t = e.target.value;
                  setForm({ ...form, title: t, slug: editing ? form.slug : slugify(t) });
                }}
                maxLength={200}
              />
            </div>
            <div className="space-y-1.5">
              <Label>اسلاگ (URL)</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label>خلاصه (Excerpt)</Label>
              <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} maxLength={500} placeholder="توضیح کوتاه مقاله" />
            </div>
            <div className="space-y-1.5">
              <Label>محتوای کامل *</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} maxLength={50000} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>نویسنده</Label>
                <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} maxLength={100} />
              </div>
              <div className="space-y-1.5">
                <Label>برچسب‌ها (با کاما جدا کنید)</Label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="پسته,سلامت,آجیل" />
              </div>
            </div>
            <ImagePicker value={form.image} onChange={(v) => setForm({ ...form, image: v })} label="تصویر مقاله" />
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label>انتشار</Label>
                <p className="text-xs text-muted-foreground">در سایت نمایش داده می‌شود</p>
              </div>
              <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={saveMut.isPending} className="flex-1 gap-2">
              {saveMut.isPending ? "در حال ذخیره..." : "ذخیره"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
          <AlertDialogContent className="z-[110]" overlayClassName="z-[110]">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف مقاله</AlertDialogTitle>
            <AlertDialogDescription>آیا از حذف این مقاله مطمئن هستید؟</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && delMut.mutate(deleteId)} className="bg-destructive hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

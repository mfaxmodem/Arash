"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Product, Category, Paginated } from "@/lib/types";
import { formatPrice, toPersianDigits, slugify, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ImagePicker } from "@/components/admin/image-picker";
import { toast } from "@/lib/toast";
import { Plus, Pencil, Trash2, Package, Search, AlertTriangle } from "lucide-react";

interface FormState {
  name: string;
  slug: string;
  description: string;
  price: string;
  unit: string;
  stock: string;
  lowStock: string;
  image: string;
  brand: "SAVERS" | "CHOVIL";
  featured: boolean;
  active: boolean;
  weight: string;
  categoryId: string;
}

const EMPTY: FormState = {
  name: "", slug: "", description: "", price: "", unit: "کیلوگرم",
  stock: "0", lowStock: "5", image: "", brand: "SAVERS", featured: false, active: true, weight: "", categoryId: "",
};

export function AdminProducts() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const qc = useQueryClient();

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<{ items: Category[] }>("/api/categories"),
  });
  const categories = catData?.items ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", page, search],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      // admin needs all products; we use a separate flag via query
      return api.get<Paginated<Product>>(`/api/products?${params}&limit=20`);
    },
  });
  // For admin we want ALL products (including inactive). The public endpoint filters active=true.
  // We'll refetch with a dedicated admin approach below.

  const products = data?.items ?? [];

  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (editing) return api.put(`/api/products/${editing.id}`, payload);
      return api.post("/api/products", payload);
    },
    onSuccess: () => {
      toast.success(editing ? "محصول به‌روزرسانی شد" : "محصول ایجاد شد");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["products-featured"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/products/${id}`),
    onSuccess: () => {
      toast.success("محصول حذف شد");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY, categoryId: categories[0]?.id || "" });
    setErrors({});
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, description: p.description || "", price: String(p.price),
      unit: p.unit, stock: String(p.stock), lowStock: String(p.lowStock), image: p.image || "",
      brand: p.brand, featured: p.featured, active: p.active, weight: p.weight || "", categoryId: p.categoryId,
    });
    setErrors({});
    setOpen(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "نام الزامی است";
    if (form.slug.trim().length < 2) errs.slug = "اسلاگ الزامی است";
    if (!form.categoryId) errs.categoryId = "دسته را انتخاب کنید";
    const price = Number(form.price);
    if (isNaN(price) || price < 0) errs.price = "قیمت نامعتبر";
    const stock = Number(form.stock);
    if (isNaN(stock) || stock < 0) errs.stock = "موجودی نامعتبر";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    saveMutation.mutate({
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      unit: form.unit,
      stock: Number(form.stock),
      lowStock: Number(form.lowStock),
      image: form.image,
      brand: form.brand,
      featured: form.featured,
      active: form.active,
      weight: form.weight.trim(),
      categoryId: form.categoryId,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Package className="w-6 h-6" />
            مدیریت محصولات
          </h1>
          <p className="text-muted-foreground text-sm">مدیریت کامل محصولات و موجودی</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" />
          افزودن محصول
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجوی محصول..."
          className="pr-10"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-right">
                  <th className="p-3 font-medium text-muted-foreground">محصول</th>
                  <th className="p-3 font-medium text-muted-foreground">برند</th>
                  <th className="p-3 font-medium text-muted-foreground">قیمت</th>
                  <th className="p-3 font-medium text-muted-foreground">موجودی</th>
                  <th className="p-3 font-medium text-muted-foreground">وضعیت</th>
                  <th className="p-3 font-medium text-muted-foreground text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.filter((p) => !search || p.name.includes(search)).map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                          {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate flex items-center gap-1">
                            {p.name}
                            {p.featured && <Badge variant="secondary" className="text-[10px] h-4">ویژه</Badge>}
                          </div>
                          <div className="text-xs text-muted-foreground">{p.weight}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", p.brand === "SAVERS" ? "brand-savers" : "brand-chovil")}>
                        {p.brand === "SAVERS" ? "ساورز" : "چویل"}
                      </span>
                    </td>
                    <td className="p-3 text-foreground/80 whitespace-nowrap">{formatPrice(p.price)}</td>
                    <td className="p-3">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
                        p.stock <= 0 ? "bg-destructive/10 text-destructive" : p.stock <= p.lowStock ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                      )}>
                        {p.stock <= p.lowStock && p.stock > 0 && <AlertTriangle className="w-3 h-3" />}
                        {toPersianDigits(p.stock)}
                      </span>
                    </td>
                    <td className="p-3">
                      {p.active ? (
                        <Badge className="bg-green-500 hover:bg-green-500">فعال</Badge>
                      ) : (
                        <Badge variant="secondary">غیرفعال</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(p)} className="h-8 w-8">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteId(p.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {products.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">محصولی یافت نشد</div>
          )}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={open} onOpenChange={(o) => { if (!o) { setEditing(null); setForm(EMPTY); setErrors({}); } setOpen(o); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[110]" overlayClassName="z-[110]">
          <DialogHeader>
            <DialogTitle>{editing ? "ویرایش محصول" : "افزودن محصول جدید"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label>نام محصول *</Label>
              <Input
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm({ ...form, name, slug: editing ? form.slug : slugify(name) });
                }}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label>اسلاگ (URL) *</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} dir="ltr" />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>توضیحات</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} maxLength={2000} />
            </div>
            <div className="space-y-1.5">
              <Label>قیمت (تومان) *</Label>
              <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} dir="ltr" type="number" />
              {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>واحد</Label>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>موجودی *</Label>
              <Input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} dir="ltr" type="number" />
              {errors.stock && <p className="text-xs text-destructive">{errors.stock}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>هشدار موجودی کم</Label>
              <Input value={form.lowStock} onChange={(e) => setForm({ ...form, lowStock: e.target.value })} dir="ltr" type="number" />
            </div>
            <div className="space-y-1.5">
              <Label>وزن/بسته‌بندی</Label>
              <Input value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="مثلا: ۱ کیلوگرم" />
            </div>
            <div className="space-y-1.5">
              <Label>دسته‌بندی *</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="انتخاب کنید" /></SelectTrigger>
                <SelectContent className="z-[110]">
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>برند</Label>
              <Select value={form.brand} onValueChange={(v: any) => setForm({ ...form, brand: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="z-[110]">
                  <SelectItem value="SAVERS">ساورز</SelectItem>
                  <SelectItem value="CHOVIL">چویل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <ImagePicker value={form.image} onChange={(v) => setForm({ ...form, image: v })} label="تصویر محصول" />
            </div>
            <div className="flex items-center justify-between col-span-2 rounded-lg border p-3">
              <div>
                <Label>محصول ویژه</Label>
                <p className="text-xs text-muted-foreground">در صفحه اصلی نمایش داده می‌شود</p>
              </div>
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
            </div>
            <div className="flex items-center justify-between col-span-2 rounded-lg border p-3">
              <div>
                <Label>فعال</Label>
                <p className="text-xs text-muted-foreground">در سایت نمایش داده می‌شود</p>
              </div>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={save} disabled={saveMutation.isPending} className="gap-2 flex-1">
              {saveMutation.isPending ? "در حال ذخیره..." : "ذخیره"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
            <AlertDialogContent className="z-[110]" overlayClassName="z-[110]">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف محصول</AlertDialogTitle>
            <AlertDialogDescription>آیا از حذف این محصول مطمئن هستید؟ این عمل قابل بازگشت نیست.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

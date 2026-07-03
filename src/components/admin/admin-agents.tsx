"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Agent } from "@/lib/types";
import { toPersianDigits, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import { Plus, Pencil, Trash2, Store, MapPin, Phone, Smartphone, Leaf, Sparkles } from "lucide-react";

export function AdminAgents() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", city: "", address: "", phone: "", mobile: "", brand: "BOTH", active: true, sortOrder: "0" });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: () => api.get<{ items: Agent[] }>("/api/agents"),
  });
  const agents = data?.items ?? [];

  const saveMut = useMutation({
    mutationFn: (payload: any) =>
      editing ? api.put(`/api/agents/${editing.id}`, payload) : api.post("/api/agents", payload),
    onSuccess: () => { toast.success("ذخیره شد"); qc.invalidateQueries({ queryKey: ["agents"] }); setOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => api.del(`/api/agents/${id}`),
    onSuccess: () => { toast.success("حذف شد"); qc.invalidateQueries({ queryKey: ["agents"] }); setDeleteId(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => { setEditing(null); setForm({ name: "", city: "", address: "", phone: "", mobile: "", brand: "BOTH", active: true, sortOrder: "0" }); setOpen(true); };
  const openEdit = (a: Agent) => { setEditing(a); setForm({ name: a.name, city: a.city, address: a.address || "", phone: a.phone || "", mobile: a.mobile || "", brand: a.brand, active: a.active, sortOrder: String(a.sortOrder) }); setOpen(true); };

  const save = () => {
    if (form.name.trim().length < 2) return toast.error("نام الزامی است");
    if (form.city.trim().length < 2) return toast.error("شهر الزامی است");
    saveMut.mutate({
      name: form.name.trim(), city: form.city.trim(), address: form.address.trim(),
      phone: form.phone.trim(), mobile: form.mobile.trim(), brand: form.brand,
      active: form.active, sortOrder: Number(form.sortOrder) || 0,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><Store className="w-6 h-6" /> مدیریت نمایندگان</h1>
          <p className="text-muted-foreground text-sm">لیست نمایندگی‌های فروش</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> افزودن نماینده</Button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {agents.map((a) => (
            <div key={a.id} className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Store className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-bold text-foreground">{a.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{a.city}</div>
                  </div>
                </div>
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold",
                  a.brand === "SAVERS" ? "brand-savers" : a.brand === "CHOVIL" ? "brand-chovil" : "bg-primary/10 text-primary")}>
                  {a.brand === "SAVERS" ? <><Leaf className="w-3 h-3 inline" /> ساورز</> : a.brand === "CHOVIL" ? <><Sparkles className="w-3 h-3 inline" /> چویل</> : "هر دو"}
                </span>
              </div>
              {a.address && <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{a.address}</p>}
              <div className="flex flex-wrap gap-3 text-xs text-foreground/70 mb-3">
                {a.phone && <span className="flex items-center gap-1" dir="ltr"><Phone className="w-3 h-3" />{toPersianDigits(a.phone)}</span>}
                {a.mobile && <span className="flex items-center gap-1" dir="ltr"><Smartphone className="w-3 h-3" />{toPersianDigits(a.mobile)}</span>}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <span className={cn("text-xs", a.active ? "text-green-600" : "text-muted-foreground")}>{a.active ? "● فعال" : "○ غیرفعال"}</span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(a)} className="h-8 w-8"><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteId(a.id)} className="h-8 w-8 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={(o) => { if (!o) { setEditing(null); setForm({ name: "", city: "", address: "", phone: "", mobile: "", brand: "BOTH", active: true, sortOrder: "0" }); } setOpen(o); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto z-[110]" overlayClassName="z-[110]">
          <DialogHeader><DialogTitle>{editing ? "ویرایش نماینده" : "افزودن نماینده"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>نام نمایندگی *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={150} /></div>
              <div className="space-y-1.5"><Label>شهر *</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} maxLength={100} /></div>
            </div>
            <div className="space-y-1.5"><Label>آدرس</Label><Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} maxLength={500} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>تلفن ثابت</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" maxLength={30} /></div>
              <div className="space-y-1.5"><Label>موبایل</Label><Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} dir="ltr" maxLength={30} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>برند</Label>
                <Select value={form.brand} onValueChange={(v) => setForm({ ...form, brand: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="z-[110]">
                    <SelectItem value="BOTH">هر دو برند</SelectItem>
                    <SelectItem value="SAVERS">ساورز</SelectItem>
                    <SelectItem value="CHOVIL">چویل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>ترتیب</Label><Input value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} dir="ltr" type="number" /></div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label>فعال</Label>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={saveMut.isPending} className="flex-1">{saveMut.isPending ? "ذخیره..." : "ذخیره"}</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>انصراف</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
          <AlertDialogContent className="z-[110]" overlayClassName="z-[110]">
          <AlertDialogHeader><AlertDialogTitle>حذف نماینده</AlertDialogTitle><AlertDialogDescription>آیا مطمئن هستید؟</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>انصراف</AlertDialogCancel><AlertDialogAction onClick={() => deleteId && delMut.mutate(deleteId)} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

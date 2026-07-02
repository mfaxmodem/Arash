"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from "lucide-react";

export function ContactSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["page-content"],
    queryFn: () => api.get<{ content: Record<string, string> }>("/api/page-content"),
  });
  const content = data?.content ?? {};

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    website: "", // honeypot
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () => api.post("/api/contact", form),
    onSuccess: () => {
      toast.success("پیام شما با موفقیت ارسال شد. به زودی پاسخ خواهیم داد.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "", website: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = () => {
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "نام را وارد کنید";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "ایمیل نامعتبر است";
    if (form.subject.trim().length < 2) errs.subject = "موضوع را وارد کنید";
    if (form.message.trim().length < 10) errs.message = "حداقل ۱۰ کاراکتر بنویسید";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    mutation.mutate();
  };

  const lat = parseFloat(content.map_lat || "35.7219");
  const lng = parseFloat(content.map_lng || "51.3347");
  const zoom = content.map_zoom || "14";
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02}%2C${lat - 0.015}%2C${lng + 0.02}%2C${lat + 0.015}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <section id="contact" className="py-20 bg-spice-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/60 text-foreground text-sm mb-3">
            <MessageCircle className="w-4 h-4" />
            تماس با ما
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-3">
            با ما در ارتباط باشید
          </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            سوالات، پیشنهادات و نظرات خود را با ما در میان بگذارید
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-card rounded-3xl p-6 md:p-8 shadow-lg border border-border">
            <h3 className="font-bold text-xl text-foreground mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              فرم تماس
            </h3>
            <div className="space-y-4">
              {/* Honeypot - hidden from users */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="absolute opacity-0 pointer-events-none -z-10"
                aria-hidden="true"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="c-name">نام و نام خانوادگی *</Label>
                  <Input
                    id="c-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    maxLength={100}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-phone">تلفن تماس</Label>
                  <Input
                    id="c-phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    dir="ltr"
                    maxLength={30}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-email">ایمیل *</Label>
                <Input
                  id="c-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  dir="ltr"
                  maxLength={200}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-subject">موضوع *</Label>
                <Input
                  id="c-subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  maxLength={200}
                />
                {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-message">پیام شما *</Label>
                <Textarea
                  id="c-message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  maxLength={2000}
                />
                {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
              </div>
              <Button
                onClick={submit}
                disabled={mutation.isPending}
                className="w-full gap-2 bg-primary hover:bg-primary/90"
                size="lg"
              >
                {mutation.isPending ? "در حال ارسال..." : "ارسال پیام"}
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Info + Map */}
          <div className="space-y-6">
            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-lg border border-border">
              <h3 className="font-bold text-xl text-foreground mb-6">اطلاعات تماس</h3>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <InfoRow icon={MapPin} label="آدرس" value={content.contact_address || "-"} />
                  <InfoRow
                    icon={Phone}
                    label="تلفن"
                    value={content.contact_phone || "-"}
                    ltr
                  />
                  <InfoRow
                    icon={MessageCircle}
                    label="موبایل"
                    value={content.contact_mobile || "-"}
                    ltr
                  />
                  <InfoRow
                    icon={Mail}
                    label="ایمیل"
                    value={content.contact_email || "-"}
                    ltr
                  />
                  <InfoRow icon={Clock} label="ساعات کاری" value={content.contact_hours || "-"} />
                </div>
              )}
            </div>

            {/* Map */}
            <div className="bg-card rounded-3xl p-2 shadow-lg border border-border overflow-hidden">
              <iframe
                title="موقعیت مکانی"
                src={mapSrc}
                className="w-full h-72 rounded-2xl border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  ltr,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
        <div className="font-medium text-foreground" dir={ltr ? "ltr" : "rtl"}>
          {value}
        </div>
      </div>
    </div>
  );
}

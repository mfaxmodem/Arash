"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Video,
  Copy,
  Check,
  Film,
} from "lucide-react";

interface MediaFile {
  name: string;
  url: string;
  size: number;
  category: string;
  uploaded: number;
}

export function AdminGallery() {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["gallery-files"],
    queryFn: () => api.get<{ files: MediaFile[] }>("/api/upload"),
  });

  const files = (data?.files ?? []).filter(
    (f) => filter === "all" || f.category === filter
  );

  const uploadMut = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "خطا در آپلود");
      return json;
    },
    onSuccess: () => {
      toast.success("فایل با موفقیت آپلود شد");
      qc.invalidateQueries({ queryKey: ["gallery-files"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (url: string) => api.del("/api/upload", { url }),
    onSuccess: () => {
      toast.success("فایل حذف شد");
      qc.invalidateQueries({ queryKey: ["gallery-files"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    for (const file of Array.from(fileList)) {
      uploadMut.mutate(file);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Film className="w-6 h-6" />
            گالری رسانه
          </h1>
          <p className="text-muted-foreground text-sm">
            آپلود و مدیریت تصاویر و ویدئوها
          </p>
        </div>
        <Button
          onClick={() => inputRef.current?.click()}
          disabled={uploadMut.isPending}
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          {uploadMut.isPending ? "در حال آپلود..." : "آپلود فایل"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/svg+xml,video/mp4,video/webm"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40"
        )}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          فایل‌ها را اینجا بکشید یا کلیک کنید
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          تصاویر: JPG, PNG, WebP, SVG (حداکثر ۵MB) | ویدئوها: MP4, WebM (حداکثر ۵۰MB)
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "image", "video"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filter === t
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground/70 hover:text-foreground"
            )}
          >
            {t === "all" ? "همه" : t === "image" ? "تصاویر" : "ویدئوها"}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground bg-card rounded-xl border border-border">
          فایلی آپلود نشده است
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {files.map((file) => (
            <div
              key={file.name}
              className="group relative bg-card rounded-xl border border-border overflow-hidden shadow-sm"
            >
              {/* Preview */}
              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                {file.category === "image" ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Video className="w-10 h-10" />
                    <span className="text-[10px]">{formatSize(file.size)}</span>
                  </div>
                )}
              </div>

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => copyUrl(file.url)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/90 hover:bg-white text-foreground transition-colors"
                  title="کپی آدرس"
                >
                  {copiedUrl === file.url ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    if (confirm("از حذف این فایل مطمئنید؟")) {
                      deleteMut.mutate(file.url);
                    }
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-destructive/90 hover:bg-destructive text-white transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Info bar */}
              <div className="p-2 border-t border-border/50">
                <p className="text-[10px] text-muted-foreground truncate" dir="ltr">
                  {file.name}
                </p>
                <p className="text-[10px] text-muted-foreground" dir="ltr">
                  {formatSize(file.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Agent } from "@/lib/types";
import { cn, toPersianDigits } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Phone, Smartphone, Store, Leaf, Sparkles, Users } from "lucide-react";

export function AgentsSection() {
  const [brand, setBrand] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["agents", brand],
    queryFn: () => {
      const params = new URLSearchParams();
      // agents endpoint returns all active; client filter by brand
      return api.get<{ items: Agent[] }>("/api/agents");
    },
  });

  const all = data?.items ?? [];
  const agents = brand ? all.filter((a) => a.brand === brand || a.brand === "BOTH") : all;

  return (
    <section id="agents" className="py-20 bg-spice-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/60 text-foreground text-sm mb-3">
            <Users className="w-4 h-4" />
            نمایندگان فروش
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-3">
            نمایندگی‌های ساورز و چویل
          </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            محصولات ما را از نزدیک‌ترین نمایندگی به خود تهیه کنید
          </p>
        </div>

        {/* Brand filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <BrandTab active={brand === ""} onClick={() => setBrand("")}>
            همه نمایندگی‌ها
          </BrandTab>
          <BrandTab active={brand === "SAVERS"} onClick={() => setBrand("SAVERS")} icon="savers">
            نمایندگی ساورز
          </BrandTab>
          <BrandTab active={brand === "CHOVIL"} onClick={() => setBrand("CHOVIL")} icon="chovil">
            نمایندگی چویل
          </BrandTab>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}

        {agents.length === 0 && !isLoading && (
          <p className="text-center text-foreground/60 py-12">نمایندگی‌ای یافت نشد</p>
        )}
      </div>
    </section>
  );
}

function BrandTab({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: "savers" | "chovil";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-white/80 text-foreground/70 border-transparent hover:bg-white"
      )}
    >
      {icon === "savers" && <Leaf className="w-4 h-4" />}
      {icon === "chovil" && <Sparkles className="w-4 h-4" />}
      {children}
    </button>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <article className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow border border-white">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-foreground leading-tight">{agent.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              {agent.city}
            </div>
          </div>
        </div>
        {agent.brand !== "BOTH" && (
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-bold",
              agent.brand === "SAVERS" ? "brand-savers" : "brand-chovil"
            )}
          >
            {agent.brand === "SAVERS" ? "ساورز" : "چویل"}
          </span>
        )}
        {agent.brand === "BOTH" && (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
            هر دو برند
          </span>
        )}
      </div>

      {agent.address && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex items-start gap-2">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary/60" />
          {agent.address}
        </p>
      )}

      <div className="flex flex-col gap-2 pt-3 border-t border-border/50">
        {agent.phone && (
          <a
            href={`tel:${agent.phone}`}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
          >
            <Phone className="w-4 h-4 text-primary/70" />
            <span dir="ltr">{toPersianDigits(agent.phone)}</span>
          </a>
        )}
        {agent.mobile && (
          <a
            href={`tel:${agent.mobile}`}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
          >
            <Smartphone className="w-4 h-4 text-primary/70" />
            <span dir="ltr">{toPersianDigits(agent.mobile)}</span>
          </a>
        )}
      </div>
    </article>
  );
}

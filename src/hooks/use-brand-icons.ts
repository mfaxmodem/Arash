"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useBrandIcons() {
  const { data } = useQuery({
    queryKey: ["page-content"],
    queryFn: () => api.get<{ content: Record<string, string> }>("/api/page-content"),
    staleTime: 5 * 60 * 1000,
  });

  const content = data?.content ?? {};
  return {
    saversIcon: content["brand_savers_icon"] || "",
    chovilIcon: content["brand_chovil_icon"] || "",
  };
}

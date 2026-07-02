import { create } from "zustand";

export type View = "home" | "products" | "agents" | "testimonials" | "about" | "contact";

interface NavState {
  view: View;
  adminMode: boolean;
  adminTab: "dashboard" | "products" | "categories" | "sliders" | "agents" | "testimonials" | "content" | "messages" | null;
  setView: (v: View) => void;
  goHome: () => void;
  openAdmin: (tab?: NavState["adminTab"]) => void;
  closeAdmin: () => void;
  setAdminTab: (t: NonNullable<NavState["adminTab"]>) => void;
}

export const useNav = create<NavState>((set) => ({
  view: "home",
  adminMode: false,
  adminTab: null,
  setView: (view) => {
    set({ view });
    // sync URL hash for shareable sections
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },
  goHome: () => set({ view: "home", adminMode: false }),
  openAdmin: (tab = "dashboard") => set({ adminMode: true, adminTab: tab }),
  closeAdmin: () => set({ adminMode: false }),
  setAdminTab: (adminTab) => set({ adminTab }),
}));

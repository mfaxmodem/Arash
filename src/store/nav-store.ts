import { create } from "zustand";

export type View =
  | "home"
  | "products"
  | "agents"
  | "testimonials"
  | "about"
  | "contact"
  | "blog"
  | "blogDetail"
  | "productDetail";

interface NavState {
  view: View;
  adminMode: boolean;
  adminTab:
    | "dashboard"
    | "products"
    | "categories"
    | "sliders"
    | "agents"
    | "testimonials"
    | "productComments"
    | "blog"
    | "content"
    | "messages"
    | "password"
    | null;
  // context for detail views
  selectedProductId: string | null;
  selectedBlogId: string | null;
  setView: (v: View) => void;
  goHome: () => void;
  openProduct: (id: string) => void;
  openBlog: (id: string) => void;
  openAdmin: (tab?: NavState["adminTab"]) => void;
  closeAdmin: () => void;
  setAdminTab: (t: NonNullable<NavState["adminTab"]>) => void;
}

export const useNav = create<NavState>((set) => ({
  view: "home",
  adminMode: false,
  adminTab: null,
  selectedProductId: null,
  selectedBlogId: null,
  setView: (view) => {
    set({ view, selectedProductId: null, selectedBlogId: null });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },
  goHome: () => set({ view: "home", adminMode: false, selectedProductId: null, selectedBlogId: null }),
  openProduct: (id) => {
    set({ view: "productDetail", selectedProductId: id });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  },
  openBlog: (id) => {
    set({ view: "blogDetail", selectedBlogId: id });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  },
  openAdmin: (tab = "dashboard") => set({ adminMode: true, adminTab: tab }),
  closeAdmin: () => set({ adminMode: false }),
  setAdminTab: (adminTab) => set({ adminTab }),
}));

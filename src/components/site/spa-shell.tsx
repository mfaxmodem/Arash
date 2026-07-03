"use client";

import { useEffect } from "react";
import { useNav } from "@/store/nav-store";
import { Navbar } from "@/components/site/navbar";
import { HeroSlider } from "@/components/site/hero-slider";
import { FeaturedProducts } from "@/components/site/featured-products";
import { TestimonialPreview } from "@/components/site/testimonial-preview";
import { ProductsSection } from "@/components/site/products-section";
import { AgentsSection } from "@/components/site/agents-section";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import { AboutSection } from "@/components/site/about-section";
import { ContactSection } from "@/components/site/contact-section";
import { Footer } from "@/components/site/footer";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AboutPreview } from "@/components/site/about-preview";
import { BlogSection } from "@/components/site/blog-section";
import { BlogList } from "@/components/site/blog-list";
import { BlogDetail } from "@/components/site/blog-detail";
import { ProductDetail } from "@/components/site/product-detail";

export function SpaShell() {
  const { view, adminMode, openAdmin, closeAdmin } = useNav();

  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === "#admin") {
        openAdmin("dashboard");
      } else {
        if (adminMode) closeAdmin();
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {view === "home" && (
          <>
            <HeroSlider />
            <FeaturedProducts />
            <TestimonialPreview />
            <BlogSection />
            <AboutPreview />
          </>
        )}
        {view === "products" && <ProductsSection />}
        {view === "productDetail" && <ProductDetail />}
        {view === "agents" && <AgentsSection />}
        {view === "blog" && <BlogList />}
        {view === "blogDetail" && <BlogDetail />}
        {view === "testimonials" && <TestimonialsSection />}
        {view === "about" && <AboutSection />}
        {view === "contact" && <ContactSection />}
      </main>

      <Footer />

      {adminMode && <AdminPanel />}
    </div>
  );
}

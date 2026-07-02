"use client";

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

export default function Home() {
  const { view, adminMode } = useNav();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {view === "home" && (
          <>
            <HeroSlider />
            <FeaturedProducts />
            <AboutPreview />
            <TestimonialPreview />
          </>
        )}
        {view === "products" && <ProductsSection />}
        {view === "agents" && <AgentsSection />}
        {view === "testimonials" && <TestimonialsSection />}
        {view === "about" && <AboutSection />}
        {view === "contact" && <ContactSection />}
      </main>

      <Footer />

      {adminMode && <AdminPanel />}
    </div>
  );
}

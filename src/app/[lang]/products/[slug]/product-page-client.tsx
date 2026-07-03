"use client";

// This is a placeholder client component for SSR product pages.
// The actual product detail rendering is handled by the SPA in spa-shell.tsx.
// This file exists to demonstrate the SEO-optimized server-side metadata pattern.

export function ProductPageClient({ product }: { product: any }) {
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl font-black mb-4">{product.name}</h1>
      {product.description && (
        <p className="text-muted-foreground">{product.description}</p>
      )}
    </div>
  );
}

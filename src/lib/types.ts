// Shared types matching Prisma models (without @prisma/client dependency on client)

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  brand: "SAVERS" | "CHOVIL" | "BOTH";
  sortOrder: number;
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  price: number;
  unit: string;
  stock: number;
  lowStock: number;
  image?: string | null;
  gallery?: string | null;
  brand: "SAVERS" | "CHOVIL";
  featured: boolean;
  active: boolean;
  weight?: string | null;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Slider {
  id: string;
  title: string;
  subtitle?: string | null;
  image: string;
  link?: string | null;
  buttonText?: string | null;
  sortOrder: number;
  active: boolean;
}

export interface Agent {
  id: string;
  name: string;
  city: string;
  address?: string | null;
  phone?: string | null;
  mobile?: string | null;
  brand: "SAVERS" | "CHOVIL" | "BOTH";
  active: boolean;
  sortOrder: number;
}

export interface Testimonial {
  id: string;
  name: string;
  city?: string | null;
  rating: number;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  active: boolean;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED";
  createdAt: string;
}

export interface ProductComment {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  active: boolean;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  image?: string | null;
  author: string;
  tags?: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const BRAND_LABELS: Record<string, string> = {
  SAVERS: "ساورز",
  CHOvil: "چویل",
  CHOVIL: "چویل",
  BOTH: "هر دو برند",
};

export const CATEGORY_LABEL: Record<string, string> = {
  SAVERS: "ساورز",
  CHOvil: "چویل",
  CHOVIL: "چویل",
  BOTH: "ساورز و چویل",
};

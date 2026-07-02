import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert English digits to Persian digits
const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

// Format price in Tomans with thousand separators + Persian digits + تومان suffix
export function formatPrice(price: number): string {
  const formatted = new Intl.NumberFormat("en-US").format(price);
  return `${toPersianDigits(formatted)} تومان`;
}

// Format date to Persian (Jalali) readable string using Intl
export function formatPersianDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  } catch {
    return toPersianDigits(d.toLocaleDateString());
  }
}

export function formatPersianDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return toPersianDigits(d.toLocaleString());
  }
}

// Generate URL-friendly slug from Persian/English text
export function slugify(text: string): string {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Star rating renderer helper
export function getStars(rating: number): { filled: number; empty: number } {
  return { filled: Math.max(0, Math.min(5, Math.round(rating))), empty: Math.max(0, 5 - Math.round(rating)) };
}

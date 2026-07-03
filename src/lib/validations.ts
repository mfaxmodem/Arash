import { z } from "zod";

// ===== Input Validation Schemas (OWASP A03 - Injection / A07 - XSS) =====
// All user input is validated server-side with strict schemas.

// Sanitize string: prevent XSS by limiting length and disallowing script tags
const safeString = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .refine(
      (val) => !/<script|javascript:|onerror|onload|onclick/i.test(val),
      "ورودی نامعتبر است"
    );

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("ایمیل نامعتبر است"),
  password: z
    .string()
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
    .max(128, "رمز عبور بسیار طولانی است"),
});

// Persian/Arabic slug regex: allows a-z, 0-9, dash, Persian chars (\u0600-\u06FF), and ZWNJ (half-space \u200C)
const SLUG_REGEX = /^[a-z0-9\u0600-\u06FF\u200C-]+$/;
const SLUG_MESSAGE = "اسلاگ فقط شامل حروف (انگلیسی/فارسی)، عدد، خط تیره و نیم‌فاصله باشد";

export const categorySchema = z.object({
  name: safeString(100).min(2, "نام دسته الزامی است"),
  nameEn: safeString(100).optional().or(z.literal("")),
  nameAr: safeString(100).optional().or(z.literal("")),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(SLUG_REGEX, SLUG_MESSAGE),
  description: safeString(1000).optional().or(z.literal("")),
  descriptionEn: safeString(1000).optional().or(z.literal("")),
  descriptionAr: safeString(1000).optional().or(z.literal("")),
  image: safeString(500).optional().or(z.literal("")),
  brand: z.enum(["SAVERS", "CHOVIL", "BOTH"]).default("BOTH"),
  sortOrder: z.number().int().min(0).max(9999).default(0),
});

export const productSchema = z.object({
  name: safeString(150).min(2, "نام محصول الزامی است"),
  nameEn: safeString(150).optional().or(z.literal("")),
  nameAr: safeString(150).optional().or(z.literal("")),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .regex(SLUG_REGEX, SLUG_MESSAGE),
  description: safeString(2000).optional().or(z.literal("")),
  descriptionEn: safeString(2000).optional().or(z.literal("")),
  descriptionAr: safeString(2000).optional().or(z.literal("")),
  content: safeString(10000).optional().or(z.literal("")),
  contentEn: safeString(10000).optional().or(z.literal("")),
  contentAr: safeString(10000).optional().or(z.literal("")),
  price: z.number().int().min(0, "قیمت نمی‌تواند منفی باشد").max(999999999),
  unit: safeString(50).default("کیلوگرم"),
  stock: z.number().int().min(0).max(999999).default(0),
  lowStock: z.number().int().min(0).max(9999).default(5),
  image: safeString(500).optional().or(z.literal("")),
  gallery: safeString(5000).optional().or(z.literal("")),
  brand: z.enum(["SAVERS", "CHOVIL"]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  weight: safeString(50).optional().or(z.literal("")),
  categoryId: safeString(50).min(1, "دسته‌بندی الزامی است"),
});

export const sliderSchema = z.object({
  title: safeString(150).min(2, "عنوان الزامی است"),
  subtitle: safeString(300).optional().or(z.literal("")),
  image: safeString(500).min(1, "تصویر الزامی است"),
  link: safeString(500).optional().or(z.literal("")),
  buttonText: safeString(50).optional().or(z.literal("")),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  active: z.boolean().default(true),
});

export const agentSchema = z.object({
  name: safeString(150).min(2, "نام الزامی است"),
  city: safeString(100).min(2, "شهر الزامی است"),
  address: safeString(500).optional().or(z.literal("")),
  phone: safeString(30)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^[\d\s+()-]+$/.test(v), "تلفن نامعتبر است"),
  mobile: safeString(30)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^[\d\s+()-]+$/.test(v), "موبایل نامعتبر است"),
  brand: z.enum(["SAVERS", "CHOVIL", "BOTH"]).default("BOTH"),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(9999).default(0),
});

export const testimonialSchema = z.object({
  name: safeString(100).min(2, "نام الزامی است"),
  city: safeString(100).optional().or(z.literal("")),
  rating: z.number().int().min(1).max(5).default(5),
  comment: safeString(1000).min(5, "حداقل ۵ کاراکتر"),
  website: z.string().max(0, "bot detected").optional().or(z.literal("")),
  captchaAnswer: z.string().min(1, "پاسخ کپچا الزامی است"),
});

export const productCommentSchema = z.object({
  name: safeString(100).min(2, "نام الزامی است"),
  rating: z.number().int().min(1).max(5).default(5),
  comment: safeString(1000).min(5, "حداقل ۵ کاراکتر"),
  website: z.string().max(0, "bot detected").optional().or(z.literal("")),
  captchaAnswer: z.string().min(1, "پاسخ کپچا الزامی است"),
});

export const blogPostSchema = z.object({
  title: safeString(200).min(2, "عنوان الزامی است"),
  titleEn: safeString(200).optional().or(z.literal("")),
  titleAr: safeString(200).optional().or(z.literal("")),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(200)
    .regex(SLUG_REGEX, SLUG_MESSAGE),
  excerpt: safeString(500).optional().or(z.literal("")),
  excerptEn: safeString(500).optional().or(z.literal("")),
  excerptAr: safeString(500).optional().or(z.literal("")),
  content: safeString(50000).min(5, "محتوا الزامی است"),
  contentEn: safeString(50000).optional().or(z.literal("")),
  contentAr: safeString(50000).optional().or(z.literal("")),
  image: safeString(500).optional().or(z.literal("")),
  author: safeString(100).default("تیم ساورز و چویل"),
  tags: safeString(500).optional().or(z.literal("")),
  published: z.boolean().default(false),
});

export const pageContentSchema = z.object({
  key: safeString(100).min(1, "کلید الزامی است"),
  value: safeString(50000),
});

export const contactSchema = z.object({
  name: safeString(100).min(2, "نام الزامی است"),
  email: z.string().trim().toLowerCase().email("ایمیل نامعتبر است"),
  phone: safeString(30)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^[\d\s+()-]+$/.test(v), "تلفن نامعتبر است"),
  subject: safeString(200).min(2, "موضوع الزامی است"),
  message: safeString(2000).min(10, "حداقل ۱۰ کاراکتر"),
  // Honeypot field — must be empty; bots fill it
  website: z.string().max(0, "bot detected").optional().or(z.literal("")),
  // Math captcha answer
  captchaAnswer: z.string().min(1, "پاسخ کپچا الزامی است"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "رمز عبور فعلی الزامی است"),
  newPassword: z
    .string()
    .min(8, "رمز عبور جدید باید حداقل ۸ کاراکتر باشد")
    .max(128, "رمز عبور بسیار طولانی است"),
  confirmPassword: z.string().min(1, "تکرار رمز عبور الزامی است"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "رمز عبور جدید و تکرار آن مطابقت ندارند",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type SliderInput = z.infer<typeof sliderSchema>;
export type AgentInput = z.infer<typeof agentSchema>;
export type TestimonialInput = z.infer<typeof testimonialSchema>;
export type ProductCommentInput = z.infer<typeof productCommentSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type PageContentInput = z.infer<typeof pageContentSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

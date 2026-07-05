import { db } from "@/lib/db";
import { requireAdmin, validateBody, jsonResponse, errorResponse } from "@/lib/session";
import { productSchema } from "@/lib/validations";
import { localizeItem, LOCALIZABLE } from "@/lib/localize";
import type { Locale } from "@/i18n";

// GET /api/products - public list with filters & pagination
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "12")));
  const categoryId = searchParams.get("categoryId") || undefined;
  const brand = searchParams.get("brand") || undefined;
  const search = searchParams.get("search") || undefined;
  const featured = searchParams.get("featured");
  const lang = (searchParams.get("lang") || "fa") as Locale;
  const admin = searchParams.get("admin") === "true";

  const where: any = admin ? {} : { active: true };
  if (categoryId) where.categoryId = categoryId;
  if (brand && ["SAVERS", "CHOVIL"].includes(brand)) where.brand = brand;
  if (search) where.name = { contains: search };
  if (featured === "true") where.featured = true;

  const [total, items] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      include: { category: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  // Apply localization to products and their categories
  const localized = items.map((item) => {
    const product = localizeItem(item, LOCALIZABLE.product, lang);
    if (product.category) {
      product.category = localizeItem(product.category, LOCALIZABLE.category, lang);
    }
    return product;
  });

  return jsonResponse({
    items: localized,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

// POST /api/products - admin create
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await validateBody(req, productSchema);
  if (!body.ok) return body.response;

  try {
    const product = await db.product.create({ data: body.data });
    return jsonResponse(product, 201);
  } catch (e: any) {
    if (e?.code === "P2002") return errorResponse("این اسلاگ قبلاً استفاده شده است", 409);
    return errorResponse("خطا در ایجاد محصول", 500);
  }
}

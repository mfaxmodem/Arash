import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// POST /api/seed - one-time setup: creates default admin + sample data.
// Disabled after first run (checks if any admin exists).
export async function POST() {
  const existing = await db.user.findFirst({ where: { role: "ADMIN" } });
  if (existing) {
    return NextResponse.json(
      { error: "سیستم قبلاً راه‌اندازی شده است." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash("admin12345", 12);

  await db.user.create({
    data: {
      email: "admin@savers-chovil.ir",
      name: "مدیر سایت",
      passwordHash,
      role: "ADMIN",
    },
  });

  // Categories
  const catNuts = await db.category.create({
    data: { name: "خشکبار", slug: "dried-fruits-nuts", description: "انواع آجیل و خشکبار تازه و باکیفیت", brand: "BOTH", sortOrder: 1 },
  });
  const catSpices = await db.category.create({
    data: { name: "ادویه‌جات", slug: "spices", description: "ادویه‌جات خالص و معطر", brand: "BOTH", sortOrder: 2 },
  });
  const catSugar = await db.category.create({
    data: { name: "قند و شکر", slug: "sugar-candy", description: "قند و شکر و نبات مرغوب", brand: "BOTH", sortOrder: 3 },
  });

  const products = [
    { name: "پسته اکبری", slug: "pistachio-akbari", price: 850000, stock: 120, image: "/images/pistachio.png", brand: "SAVERS", categoryId: catNuts.id, featured: true, weight: "۱ کیلوگرم", description: "پسته اکبری درجه یک، تازه و خوش‌طعم" },
    { name: "بادام درختی", slug: "almond", price: 420000, stock: 200, image: "/images/almond.png", brand: "SAVERS", categoryId: catNuts.id, featured: true, weight: "۱ کیلوگرم", description: "بادام خام تازه و مغذی" },
    { name: "گردو", slug: "walnut", price: 480000, stock: 90, image: "/images/walnut.png", brand: "CHOVIL", categoryId: catNuts.id, featured: false, weight: "۱ کیلوگرم", description: "گردو مغز مرغوب" },
    { name: "بادام هندی", slug: "cashew", price: 720000, stock: 60, image: "/images/cashew.png", brand: "CHOVIL", categoryId: catNuts.id, featured: true, weight: "۵۰۰ گرم", description: "بادام هندی تازه و ترد" },
    { name: "مخلوط آجیل", slug: "mixed-nuts", price: 560000, stock: 75, image: "/images/mixed-nuts.png", brand: "SAVERS", categoryId: catNuts.id, featured: true, weight: "۱ کیلوگرم", description: "ترکیب آجیل شامل پسته، بادام، گردو و کشمش" },
    { name: "زردآلو خشک", slug: "dried-apricot", price: 320000, stock: 110, image: "/images/dried-apricot.png", brand: "CHOVIL", categoryId: catNuts.id, featured: false, weight: "۵۰۰ گرم", description: "زردآلو خشک شیرین" },
    { name: "زعفران نگین", slug: "saffron", price: 1250000, stock: 30, image: "/images/saffron.png", brand: "SAVERS", categoryId: catSpices.id, featured: true, weight: "۱ گرم", description: "زعفران نگین قائنات درجه یک" },
    { name: "زردچوبه", slug: "turmeric", price: 95000, stock: 250, image: "/images/turmeric.png", brand: "CHOVIL", categoryId: catSpices.id, featured: false, weight: "۲۰۰ گرم", description: "زردچوبه خالص و خوش‌رنگ" },
    { name: "دارچین", slug: "cinnamon", price: 110000, stock: 180, image: "/images/cinnamon.png", brand: "CHOVIL", categoryId: catSpices.id, featured: false, weight: "۲۰۰ گرم", description: "دارچین معطر و خالص" },
    { name: "شکر سفید", slug: "white-sugar", price: 65000, stock: 400, image: "/images/sugar.png", brand: "SAVERS", categoryId: catSugar.id, featured: false, weight: "۱ کیلوگرم", description: "شکر سفید مرغوب" },
  ];
  for (const p of products) {
    await db.product.create({ data: p });
  }

  await db.slider.createMany({
    data: [
      { title: "بهترین کیفیت خشکبار", subtitle: "تازه، سالم و باکیفیت", image: "/images/hero-1.png", buttonText: "مشاهده محصولات", link: "#products", sortOrder: 1, active: true },
      { title: "ادویه‌جات خالص و معطر", subtitle: "طعم و رنگ واقعی طبیعت", image: "/images/hero-2.png", buttonText: "ادویه‌جات", link: "#products", sortOrder: 2, active: true },
      { title: "قند و شکر مرغوب", subtitle: "شیرینی زندگی با ساورز و چویل", image: "/images/hero-3.png", buttonText: "بیشتر بدانید", link: "#about", sortOrder: 3, active: true },
    ],
  });

  await db.agent.createMany({
    data: [
      { name: "فروشگاه بزرگ ساورز", city: "تهران", address: "خیابان ولیعصر، نرسیده به میدان ونک", phone: "02188880001", mobile: "09121110001", brand: "SAVERS", active: true, sortOrder: 1 },
      { name: "هایپرمارکت چویل", city: "مشهد", address: "بلوار وکیل‌آباد، نبش وکیل‌آباد ۲۲", phone: "05138880002", mobile: "09152220002", brand: "CHOVIL", active: true, sortOrder: 2 },
      { name: "مرکز توزیع پایتخت", city: "تهران", address: "بازار بزرگ تهران، راسته آجیل", phone: "02133330003", mobile: "09123330003", brand: "BOTH", active: true, sortOrder: 3 },
      { name: "نمایندگی اصفهان", city: "اصفهان", address: "خیابان چهارباغ بالا، روبروی مسجد سید", phone: "03166660004", mobile: "09134440004", brand: "BOTH", active: true, sortOrder: 4 },
      { name: "نمایندگی شیراز", city: "شیراز", address: "خیابان زند، جنب فروشگاه رفاه", phone: "07177770005", mobile: "09175550005", brand: "SAVERS", active: true, sortOrder: 5 },
    ],
  });

  await db.testimonial.createMany({
    data: [
      { name: "مریم احمدی", city: "تهران", rating: 5, comment: "کیفیت خشکبار عالی بود، مطمئناً دوباره خرید می‌کنم. بسته‌بندی بسیار تمیز و حرفه‌ای.", status: "APPROVED", active: true },
      { name: "علی رضایی", city: "مشهد", rating: 5, comment: "زعفران ساورز واقعاً درجه یک است. عطر و رنگ فوق‌العاده‌ای دارد.", status: "APPROVED", active: true },
      { name: "زهرا کریمی", city: "اصفهان", rating: 4, comment: "ادویه‌های چویل تازه و خوش‌عطر هستند. ارسال سریع بود.", status: "APPROVED", active: true },
      { name: "حسین موسوی", city: "شیراز", rating: 5, comment: "بهترین آجیلی که تا حالا خریدم. ممنون از تیم حرفه‌ای ساورز.", status: "APPROVED", active: true },
      { name: "فاطمه نوری", city: "تبریز", rating: 5, comment: "قند و شکر باکیفیت و قیمت مناسب. به همه پیشنهاد می‌کنم.", status: "APPROVED", active: true },
    ],
  });

  await db.pageContent.createMany({
    data: [
      { key: "about_title", value: "درباره ساورز و چویل" },
      { key: "about_body", value: "شرکت ما با بیش از دو دهه تجربه در زمینه فروش و بسته‌بندی خشکبار، ادویه‌جات، قند و شکر، با دو برند اختصاصی «ساورز» و «چویل» در خدمت شما عزیزان است. هدف ما ارائه محصولاتی سالم، باکیفیت و با بسته‌بندی استاندارد به سراسر کشور است.\n\nتیم متخصص ما با کنترل کیفیت دقیق در تمام مراحل از تهیه تا بسته‌بندی، اطمینان از تازگی و سلامت محصولات را تضمین می‌کند. شبکه گسترده نمایندگان ما در سراسر کشور امکان دسترسی آسان به محصولات را فراهم کرده است." },
      { key: "contact_address", value: "تهران، خیابان ولیعصر، پلاک ۱۲۳۴" },
      { key: "contact_phone", value: "021-88880000" },
      { key: "contact_mobile", value: "0912-0000000" },
      { key: "contact_email", value: "info@savers-chovil.ir" },
      { key: "contact_hours", value: "شنبه تا پنجشنبه، ۹ تا ۱۸" },
      { key: "map_lat", value: "35.7219" },
      { key: "map_lng", value: "51.3347" },
      { key: "map_zoom", value: "14" },
      { key: "map_address", value: "تهران، خیابان ولیعصر" },
    ],
  });

  return NextResponse.json({
    success: true,
    message: "راه‌اندازی انجام شد. ایمیل: admin@savers-chovil.ir | رمز: admin12345",
    adminEmail: "admin@savers-chovil.ir",
  });
}

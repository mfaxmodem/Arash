import { db } from "@/lib/db";
import { validateBody, jsonResponse, errorResponse } from "@/lib/session";
import { contactSchema } from "@/lib/validations";
import { validateCaptcha, COOKIE_NAME } from "@/lib/captcha";

// POST /api/contact - public contact form submission
// Rate limiting via simple in-memory counter per IP
const ipHits = new Map<string, { count: number; ts: number }>();
const RATE_LIMIT = 5; // per minute
const WINDOW = 60_000;

export async function POST(req: Request) {
  // Rate limiting (OWASP A07)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const now = Date.now();
  const hit = ipHits.get(ip);
  if (hit && now - hit.ts < WINDOW) {
    if (hit.count >= RATE_LIMIT) {
      return errorResponse("تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی بعد تلاش کنید.", 429);
    }
    hit.count++;
  } else {
    ipHits.set(ip, { count: 1, ts: now });
  }

  const body = await validateBody(req, contactSchema);
  if (!body.ok) return body.response;

  // Honeypot check — if filled, silently accept but don't save (bot trap)
  if (body.data.website && body.data.website.length > 0) {
    return jsonResponse({ success: true, message: "پیام شما با موفقیت ارسال شد." }, 201);
  }

  // Captcha validation
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );
  const captchaToken = cookies[COOKIE_NAME];
  const captchaAnswer = (body.data as any).captchaAnswer as string | undefined;

  const captchaResult = validateCaptcha(captchaToken, captchaAnswer);
  if (!captchaResult.ok) {
    return errorResponse(captchaResult.error!, 400);
  }

  await db.contactMessage.create({
    data: {
      name: body.data.name,
      email: body.data.email,
      phone: body.data.phone || null,
      subject: body.data.subject,
      message: body.data.message,
      status: "NEW",
    },
  });

  return jsonResponse(
    { success: true, message: "پیام شما با موفقیت ارسال شد. به زودی پاسخ خواهیم داد." },
    201
  );
}

import { NextResponse } from "next/server";
import { generateCaptcha, COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/captcha";

// GET /api/captcha — generate a new math captcha challenge
export async function GET() {
  const { question, token } = generateCaptcha();

  const response = NextResponse.json({ question });

  // Store the answer token in an httpOnly cookie
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}

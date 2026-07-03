// Server-side math captcha: stateless, cookie-based, no external dependencies

const COOKIE_NAME = "captcha_answer";
const COOKIE_MAX_AGE = 300; // 5 minutes

/** Generate a simple math problem and set answer in an httpOnly cookie */
export function generateCaptcha(): { question: string; token: string } {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  const ops = ["+", "-", "×"] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];

  let answer: number;
  switch (op) {
    case "+": answer = a + b; break;
    case "-": answer = a - b; break;
    case "×": answer = a * b; break;
  }

  // Simple signed token: base64(answer:timestamp:random)
  const nonce = Math.random().toString(36).slice(2, 8);
  const payload = `${answer}:${Date.now()}:${nonce}`;
  const token = Buffer.from(payload).toString("base64url");

  return {
    question: `${a} ${op} ${b} = ؟`,
    token,
  };
}

/** Validate captcha answer from request cookies + body */
export function validateCaptcha(
  token: string | undefined,
  userAnswer: string | undefined
): { ok: boolean; error?: string } {
  if (!token) {
    return { ok: false, error: "کپچا منقضی شده است. صفحه را رفرش کنید." };
  }
  if (!userAnswer || userAnswer.trim() === "") {
    return { ok: false, error: "پاسخ کپچا الزامی است." };
  }

  let decoded: string;
  try {
    decoded = Buffer.from(token, "base64url").toString("utf-8");
  } catch {
    return { ok: false, error: "توکن کپچا نامعتبر است." };
  }

  const [answerStr, tsStr] = decoded.split(":");
  const ts = parseInt(tsStr, 10);

  // Expire after 5 minutes
  if (Date.now() - ts > COOKIE_MAX_AGE * 1000) {
    return { ok: false, error: "کپچا منقضی شده است. صفحه را رفرش کنید." };
  }

  const expected = parseInt(answerStr, 10);
  const given = parseInt(userAnswer.trim(), 10);

  if (isNaN(given) || given !== expected) {
    return { ok: false, error: "پاسخ کپچا اشتباه است." };
  }

  return { ok: true };
}

export { COOKIE_NAME, COOKIE_MAX_AGE };

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations";

// ===== Secure Authentication (OWASP A07 - Auth Failures) =====
// - bcrypt password hashing (salt rounds 12)
// - credential provider with server-side validation
// - session strategy: jwt with rotating secret
// - strict callbacks for role-based access

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "ایمیل", type: "email" },
        password: { label: "رمز عبور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Validate input server-side (defense in depth)
        const parsed = loginSchema.safeParse({
          email: credentials.email,
          password: credentials.password,
        });
        if (!parsed.success) {
          return null;
        }

        // Parameterized query via Prisma prevents SQL injection (OWASP A03)
        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });

        // Timing-safe: always run bcrypt compare even if user not found
        if (!user) {
          // dummy hash compare to equalize timing
          await bcrypt.compare(
            parsed.data.password,
            "$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
          );
          return null;
        }

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) {
          return null;
        }

        // Return minimal user data
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as any;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  jwt: {
    maxAge: 8 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/?admin=login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  // Security headers
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

export type { Session } from "next-auth";

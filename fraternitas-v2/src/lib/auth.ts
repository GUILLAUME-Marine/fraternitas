import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation/schemas";
import { auditLog } from "@/lib/security/audit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const ip = req?.headers?.get?.("x-forwarded-for") || "unknown";

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.password) {
          await auditLog({ action: "LOGIN_FAILED", metadata: { email, ip } });
          return null;
        }

        if (user.banned) {
          await auditLog({ action: "LOGIN_BANNED_USER", userId: user.id, metadata: { ip } });
          return null;
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          await auditLog({ action: "LOGIN_WRONG_PASSWORD", userId: user.id, metadata: { ip } });
          // Log failed login
          await prisma.loginHistory.create({
            data: { userId: user.id, ipAddress: ip, success: false },
          });
          return null;
        }

        if (!user.emailVerified) {
          await auditLog({ action: "LOGIN_UNVERIFIED_EMAIL", userId: user.id });
          return null;
        }

        // Log successful login
        await prisma.loginHistory.create({
          data: { userId: user.id, ipAddress: ip, success: true },
        });
        await auditLog({ action: "LOGIN_SUCCESS", userId: user.id, metadata: { ip } });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        await prisma.profile.create({
          data: {
            userId: user.id!,
            notificationSettings: { create: {} },
          },
        });
      }
    },
  },
});

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation/schemas";
import { generateSecureToken, generateExpiryDate } from "@/lib/security/tokens";
import { sendPasswordResetEmail } from "@/lib/email/resend";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { auditLog } from "@/lib/security/audit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    
    // Rate limit: 3 requests per 15 minutes per IP
    const rateCheck = checkRateLimit(`forgot:${ip}`, 3, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans 15 minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Always return success (don't reveal if email exists)
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && user.emailVerified) {
      // Invalidate old tokens
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true },
      });

      const token = generateSecureToken();
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expires: generateExpiryDate(1),
        },
      });

      await sendPasswordResetEmail(email, user.name || "ami(e)", token);
      await auditLog({ action: "PASSWORD_RESET_REQUESTED", userId: user.id, metadata: { ip } });
    }

    // Always return 200 for security
    return NextResponse.json({ message: "Si cet email existe, un lien a été envoyé." });
  } catch (error) {
    console.error("[FORGOT_PASSWORD_ERROR]", error);
    return NextResponse.json({ message: "Si cet email existe, un lien a été envoyé." });
  }
}

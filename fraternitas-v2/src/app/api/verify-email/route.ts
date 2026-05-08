import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email/resend";
import { auditLog } from "@/lib/security/audit";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login?error=invalid-token", req.url));
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.redirect(new URL("/auth/login?error=invalid-token", req.url));
    }

    if (verificationToken.used) {
      return NextResponse.redirect(new URL("/auth/login?error=token-used", req.url));
    }

    if (new Date() > verificationToken.expires) {
      return NextResponse.redirect(new URL("/auth/login?error=token-expired", req.url));
    }

    // Mark email as verified
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.update({
        where: { token },
        data: { used: true },
      }),
    ]);

    // Send welcome email
    await sendWelcomeEmail(verificationToken.user.email, verificationToken.user.name || "");
    await auditLog({ action: "EMAIL_VERIFIED", userId: verificationToken.userId });

    return NextResponse.redirect(new URL("/auth/login?verified=true", req.url));
  } catch (error) {
    console.error("[VERIFY_EMAIL_ERROR]", error);
    return NextResponse.redirect(new URL("/auth/login?error=server-error", req.url));
  }
}

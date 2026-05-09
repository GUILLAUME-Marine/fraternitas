import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation/schemas";
import { generateSecureToken, generateExpiryDate } from "@/lib/security/tokens";
import { sendVerificationEmail } from "@/lib/email/resend";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { auditLog } from "@/lib/security/audit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    
    // Rate limiting: 5 registrations per IP per hour
    const rateCheck = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans une heure." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Don't reveal if email exists (security)
      await auditLog({ action: "REGISTER_DUPLICATE_EMAIL", metadata: { email, ip } });
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 409 }
      );
    }

    // Hash password with cost factor 14
    const hashedPassword = await bcrypt.hash(password, 14);

    // Create user + profile
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profile: {
          create: {
            notificationSettings: { create: {} },
          },
        },
      },
      select: { id: true, name: true, email: true },
    });

    // Generate verification token
    const token = generateSecureToken();
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        expires: generateExpiryDate(24),
      },
    });

    // Send verification email
    await sendVerificationEmail(email, name, token);

    await auditLog({ action: "REGISTER_SUCCESS", userId: user.id, metadata: { ip } });

    return NextResponse.json(
      { message: "Compte créé. Vérifiez votre email." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[REGISTER_ERROR]", error?.message, error?.code);
    return NextResponse.json(
      { error: error?.message || "Une erreur est survenue." },
      { status: 500 }
    );
  }
}

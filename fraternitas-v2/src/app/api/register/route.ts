import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation/schemas";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { auditLog } from "@/lib/security/audit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";

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

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 14);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: new Date(),
        profile: {
          create: {
            onboarded: true,
            notificationSettings: { create: {} },
          },
        },
      },
    });

    await auditLog({ action: "REGISTER_SUCCESS", metadata: { ip } });

    return NextResponse.json(
      { message: "Compte créé avec succès." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[REGISTER_ERROR]", error?.message);
    return NextResponse.json(
      { error: "Une erreur est survenue. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

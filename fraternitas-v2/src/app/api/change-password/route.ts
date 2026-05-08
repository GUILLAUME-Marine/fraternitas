import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validation/schemas";
import { sendPasswordChangedEmail } from "@/lib/email/resend";
import { auditLog } from "@/lib/security/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.password) {
      return NextResponse.json(
        { error: "Impossible de changer le mot de passe pour ce type de compte." },
        { status: 400 }
      );
    }

    const validCurrent = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!validCurrent) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 14);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await sendPasswordChangedEmail(user.email, user.name || "");
    await auditLog({ action: "PASSWORD_CHANGED", userId: user.id });

    return NextResponse.json({ message: "Mot de passe modifié avec succès." });
  } catch (error) {
    console.error("[CHANGE_PASSWORD_ERROR]", error);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }
}

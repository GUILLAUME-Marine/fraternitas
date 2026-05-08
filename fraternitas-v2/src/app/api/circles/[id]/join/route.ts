import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await context.params;

  const circle = await prisma.circle.findUnique({ where: { id } });
  if (!circle || circle.status !== "ACTIVE") {
    return NextResponse.json({ error: "Cercle introuvable." }, { status: 404 });
  }

  const existing = await prisma.circleMember.findUnique({
    where: { circleId_userId: { circleId: id, userId: session.user.id } },
  });
  if (existing) return NextResponse.json({ error: "Déjà membre." }, { status: 409 });

  const member = await prisma.circleMember.create({
    data: { circleId: id, userId: session.user.id, role: "MEMBER" },
  });

  return NextResponse.json({ member }, { status: 201 });
}

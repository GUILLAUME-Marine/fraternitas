import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const circle = await prisma.circle.findUnique({ where: { id: params.id } });
  if (!circle || circle.status !== "ACTIVE") {
    return NextResponse.json({ error: "Cercle introuvable." }, { status: 404 });
  }

  const existing = await prisma.circleMember.findUnique({
    where: { circleId_userId: { circleId: params.id, userId: session.user.id } },
  });
  if (existing) return NextResponse.json({ error: "Déjà membre." }, { status: 409 });

  const member = await prisma.circleMember.create({
    data: { circleId: params.id, userId: session.user.id, role: "MEMBER" },
  });

  return NextResponse.json({ member }, { status: 201 });
}

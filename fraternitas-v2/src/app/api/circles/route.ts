import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { circleSchema } from "@/lib/validation/schemas";
import { auditLog } from "@/lib/security/audit";

// GET /api/circles
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const mine = searchParams.get("mine") === "true";
  const city = searchParams.get("city");

  const circles = await prisma.circle.findMany({
    where: {
      status: "ACTIVE",
      ...(mine ? { members: { some: { userId: session.user.id } } } : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
    },
    include: {
      owner: { select: { id: true, name: true, image: true } },
      _count: { select: { members: true } },
      members: {
        where: { userId: session.user.id },
        select: { role: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ circles });
}

// POST /api/circles
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const body = await req.json();
  const parsed = circleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const circle = await prisma.circle.create({
    data: {
      ...parsed.data,
      ownerId: session.user.id,
      members: {
        create: { userId: session.user.id, role: "ADMIN" },
      },
    },
  });

  await auditLog({ action: "CIRCLE_CREATED", userId: session.user.id, entityId: circle.id });

  return NextResponse.json({ circle }, { status: 201 });
}

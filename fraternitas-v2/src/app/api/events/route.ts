import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validation/schemas";
import { sendEventConfirmationEmail } from "@/lib/email/resend";
import { auditLog } from "@/lib/security/audit";

// GET /api/events
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const city = searchParams.get("city");
  const type = searchParams.get("type");
  const page = parseInt(searchParams.get("page") || "1");
  const take = 12;

  const events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      startDate: { gte: new Date() },
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(type ? { type: type as any } : {}),
    },
    include: {
      host: { select: { id: true, name: true, image: true } },
      _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
    },
    orderBy: { startDate: "asc" },
    skip: (page - 1) * take,
    take,
  });

  const total = await prisma.event.count({
    where: {
      status: "PUBLISHED",
      startDate: { gte: new Date() },
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(type ? { type: type as any } : {}),
    },
  });

  return NextResponse.json({ events, total, pages: Math.ceil(total / take) });
}

// POST /api/events
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const body = await req.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      ...parsed.data,
      hostId: session.user.id,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    },
  });

  await auditLog({ action: "EVENT_CREATED", userId: session.user.id, entityId: event.id });

  return NextResponse.json({ event }, { status: 201 });
}

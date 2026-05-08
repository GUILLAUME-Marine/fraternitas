import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEventConfirmationEmail } from "@/lib/email/resend";
import { formatDateTime } from "@/lib/utils";
import { auditLog } from "@/lib/security/audit";

// POST /api/events/[id]/register
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { registrations: { where: { status: "CONFIRMED" } } } },
    },
  });

  if (!event || event.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Événement introuvable." }, { status: 404 });
  }

  // Check existing registration
  const existing = await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId: params.id, userId: session.user.id } },
  });

  if (existing) {
    return NextResponse.json({ error: "Vous êtes déjà inscrit(e)." }, { status: 409 });
  }

  // Check capacity
  const isFull = event.maxAttendees
    ? event._count.registrations >= event.maxAttendees
    : false;

  const registration = await prisma.eventRegistration.create({
    data: {
      eventId: params.id,
      userId: session.user.id,
      status: isFull ? "WAITLIST" : "CONFIRMED",
    },
  });

  // Send confirmation email
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user && registration.status === "CONFIRMED") {
    await sendEventConfirmationEmail(
      user.email,
      user.name || "ami(e)",
      event.title,
      formatDateTime(event.startDate),
      event.city
    );
  }

  await auditLog({
    action: "EVENT_REGISTRATION",
    userId: session.user.id,
    entityId: params.id,
    metadata: { status: registration.status },
  });

  return NextResponse.json({ registration }, { status: 201 });
}

// DELETE /api/events/[id]/register — cancel registration
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  await prisma.eventRegistration.delete({
    where: {
      eventId_userId: { eventId: params.id, userId: session.user.id },
    },
  });

  return NextResponse.json({ message: "Inscription annulée." });
}

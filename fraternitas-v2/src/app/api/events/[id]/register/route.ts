import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEventConfirmationEmail } from "@/lib/email/resend";
import { formatDateTime } from "@/lib/utils";
import { auditLog } from "@/lib/security/audit";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await context.params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { registrations: { where: { status: "CONFIRMED" } } } } },
  });
  if (!event || event.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Événement introuvable." }, { status: 404 });
  }
  const existing = await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId: id, userId: session.user.id } },
  });
  if (existing) return NextResponse.json({ error: "Déjà inscrit(e)." }, { status: 409 });
  const isFull = event.maxAttendees ? event._count.registrations >= event.maxAttendees : false;
  const registration = await prisma.eventRegistration.create({
    data: { eventId: id, userId: session.user.id, status: isFull ? "WAITLIST" : "CONFIRMED" },
  });
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user && registration.status === "CONFIRMED") {
    await sendEventConfirmationEmail(user.email, user.name || "ami(e)", event.title, formatDateTime(event.startDate), event.city);
  }
  await auditLog({ action: "EVENT_REGISTRATION", userId: session.user.id, entityId: id });
  return NextResponse.json({ registration }, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await context.params;
  await prisma.eventRegistration.delete({
    where: { eventId_userId: { eventId: id, userId: session.user.id } },
  });
  return NextResponse.json({ message: "Inscription annulée." });
}

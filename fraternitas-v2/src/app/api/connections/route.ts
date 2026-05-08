import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendConnectionRequestEmail } from "@/lib/email/resend";
import { auditLog } from "@/lib/security/audit";

// GET /api/connections — list my connections
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const connections = await prisma.connection.findMany({
    where: {
      status: "ACCEPTED",
      OR: [
        { senderId: session.user.id },
        { receiverId: session.user.id },
      ],
    },
    include: {
      sender: { select: { id: true, name: true, image: true, profile: { select: { city: true } } } },
      receiver: { select: { id: true, name: true, image: true, profile: { select: { city: true } } } },
    },
  });

  return NextResponse.json({ connections });
}

// POST /api/connections — send connection request
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { receiverId } = await req.json();

  if (!receiverId || receiverId === session.user.id) {
    return NextResponse.json({ error: "ID invalide." }, { status: 400 });
  }

  // Check not blocked
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: session.user.id, blockedId: receiverId },
        { blockerId: receiverId, blockedId: session.user.id },
      ],
    },
  });
  if (block) return NextResponse.json({ error: "Impossible d'envoyer une demande." }, { status: 403 });

  // Check existing
  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { senderId: session.user.id, receiverId },
        { senderId: receiverId, receiverId: session.user.id },
      ],
    },
  });

  if (existing) {
    return NextResponse.json({ error: "Demande déjà existante." }, { status: 409 });
  }

  const connection = await prisma.connection.create({
    data: { senderId: session.user.id, receiverId },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: "CONNECTION_REQUEST",
      title: "Nouvelle demande de connexion",
      body: `${session.user.name} souhaite se connecter avec vous.`,
      link: "/dashboard/members",
    },
  });

  // Send email
  const [sender, receiver] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.user.findUnique({ where: { id: receiverId } }),
  ]);

  if (sender && receiver) {
    await sendConnectionRequestEmail(receiver.email, receiver.name || "", sender.name || "");
  }

  await auditLog({ action: "CONNECTION_REQUEST_SENT", userId: session.user.id, entityId: receiverId });

  return NextResponse.json({ connection }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/security/audit";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await context.params;
  const { action } = await req.json();
  if (!["accept", "reject"].includes(action)) {
    return NextResponse.json({ error: "Action invalide." }, { status: 400 });
  }
  const connection = await prisma.connection.findUnique({ where: { id } });
  if (!connection || connection.receiverId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }
  if (action === "accept") {
    const updated = await prisma.connection.update({ where: { id }, data: { status: "ACCEPTED" } });
    await prisma.notification.create({
      data: {
        userId: connection.senderId,
        type: "CONNECTION_ACCEPTED",
        title: "Demande acceptée",
        body: `${session.user.name} a accepté votre demande.`,
        link: `/dashboard/members`,
      },
    });
    await auditLog({ action: "CONNECTION_ACCEPTED", userId: session.user.id });
    return NextResponse.json({ connection: updated });
  } else {
    await prisma.connection.update({ where: { id }, data: { status: "REJECTED" } });
    return NextResponse.json({ message: "Demande refusée." });
  }
}

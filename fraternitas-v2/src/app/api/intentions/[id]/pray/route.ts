import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/intentions/[id]/pray
// Toggle : si déjà prié → retire, sinon → ajoute
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const intentionId = params.id;

  // Vérifier que l'intention existe et n'est pas expirée
  const intention = await prisma.intention.findUnique({
    where: { id: intentionId },
  });

  if (!intention) {
    return NextResponse.json({ error: "Intention introuvable." }, { status: 404 });
  }

  if (intention.expiresAt < new Date()) {
    return NextResponse.json({ error: "Cette intention a expiré." }, { status: 410 });
  }

  // On ne peut pas prier pour sa propre intention
  if (intention.userId === session.user.id) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas prier pour votre propre intention." },
      { status: 400 }
    );
  }

  // Toggle
  const existing = await prisma.intentionPrayer.findUnique({
    where: {
      intentionId_userId: {
        intentionId,
        userId: session.user.id,
      },
    },
  });

  if (existing) {
    // Retirer
    await prisma.intentionPrayer.delete({
      where: { id: existing.id },
    });
    return NextResponse.json({ praying: false });
  } else {
    // Ajouter
    await prisma.intentionPrayer.create({
      data: {
        intentionId,
        userId: session.user.id,
      },
    });
    return NextResponse.json({ praying: true });
  }
}

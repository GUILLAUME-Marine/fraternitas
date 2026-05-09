import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/defunts/[id]/pray — toggle prière pour un défunt
export async function POST(
  req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
// Et ensuite : const { id } = await params;
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  try {
const { id } = await params;
const defunt = await prisma.defunt.findUnique({ where: { id } });
    if (!defunt) return NextResponse.json({ error: "Défunt introuvable." }, { status: 404 });

    const existing = await prisma.defuntPrayer.findUnique({
      where: { defuntId_userId: { defuntId: id, userId: session.user.id } },
    });

    if (existing) {
      await prisma.defuntPrayer.delete({ where: { id: existing.id } });
      return NextResponse.json({ praying: false });
    }

    await prisma.defuntPrayer.create({
      data: { defuntId: id, userId: session.user.id },
    });
    return NextResponse.json({ praying: true });
  } catch (e) {
    console.error("[DEFUNT_PRAY]", e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

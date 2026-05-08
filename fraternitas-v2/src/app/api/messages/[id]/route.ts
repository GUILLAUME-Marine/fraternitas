import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await context.params;
  const member = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const cursor = req.nextUrl.searchParams.get("cursor");
  const take = 30;
  const messages = await prisma.message.findMany({
    where: { conversationId: id, deletedAt: null, ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}) },
    include: { sender: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
  await prisma.conversationMember.update({
    where: { conversationId_userId: { conversationId: id, userId: session.user.id } },
    data: { lastReadAt: new Date() },
  });
  return NextResponse.json({
    messages: messages.reverse(),
    hasMore: messages.length === take,
    nextCursor: messages[0]?.createdAt?.toISOString(),
  });
}

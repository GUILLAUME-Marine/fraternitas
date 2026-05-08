import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { messageSchema, newConversationSchema } from "@/lib/validation/schemas";

// GET /api/messages — list conversations
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: {
      members: { some: { userId: session.user.id } },
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, image: true, profile: { select: { city: true } } },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        where: { deletedAt: null },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ conversations });
}

// POST /api/messages — send message or start conversation
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const body = await req.json();

  // New conversation
  if (body.receiverId) {
    const parsed = newConversationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    // Check if conversation already exists
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { members: { some: { userId: session.user.id } } },
          { members: { some: { userId: parsed.data.receiverId } } },
        ],
      },
    });

    let conversationId = existing?.id;

    if (!conversationId) {
      // Check connection exists (can only message connections)
      const connection = await prisma.connection.findFirst({
        where: {
          status: "ACCEPTED",
          OR: [
            { senderId: session.user.id, receiverId: parsed.data.receiverId },
            { senderId: parsed.data.receiverId, receiverId: session.user.id },
          ],
        },
      });

      if (!connection) {
        return NextResponse.json(
          { error: "Vous devez être connectés pour envoyer un message." },
          { status: 403 }
        );
      }

      const conv = await prisma.conversation.create({
        data: {
          members: {
            create: [
              { userId: session.user.id },
              { userId: parsed.data.receiverId },
            ],
          },
        },
      });
      conversationId = conv.id;
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        content: parsed.data.content,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message, conversationId }, { status: 201 });
  }

  // Send to existing conversation
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  // Verify user is member of this conversation
  const member = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: {
        conversationId: parsed.data.conversationId,
        userId: session.user.id,
      },
    },
  });

  if (!member) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: {
      conversationId: parsed.data.conversationId,
      senderId: session.user.id,
      content: parsed.data.content,
    },
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
  });

  await prisma.conversation.update({
    where: { id: parsed.data.conversationId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ message }, { status: 201 });
}

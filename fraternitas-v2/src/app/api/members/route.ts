import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCompatibilityScore } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const city = searchParams.get("city");
  const page = parseInt(searchParams.get("page") || "1");
  const take = 12;

  // Get current user's interests
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: {
        include: { interests: { include: { interest: true } } },
      },
    },
  });

  const myInterests = currentUser?.profile?.interests.map((i) => i.interestId) || [];
  const myCity = currentUser?.profile?.city || "";

  // Get blocked users
  const blocks = await prisma.block.findMany({
    where: {
      OR: [
        { blockerId: session.user.id },
        { blockedId: session.user.id },
      ],
    },
  });
  const blockedIds = blocks.map((b) => (b.blockerId === session.user.id ? b.blockedId : b.blockerId));

  const members = await prisma.user.findMany({
    where: {
      id: { not: session.user.id, notIn: blockedIds },
      emailVerified: { not: null },
      banned: false,
      profile: {
        onboarded: true,
        visibility: { in: ["PUBLIC", "MEMBERS"] },
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      },
    },
    include: {
      profile: {
        include: { interests: { include: { interest: true } } },
      },
    },
    skip: (page - 1) * take,
    take,
  });

  // Calculate compatibility scores
  const membersWithScore = members
    .map((member) => {
      const memberInterests = member.profile?.interests.map((i) => i.interestId) || [];
      const sameCity = member.profile?.city?.toLowerCase() === myCity.toLowerCase();
      const score = getCompatibilityScore(myInterests, memberInterests, sameCity);
      return { ...member, compatibilityScore: score };
    })
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  const total = await prisma.user.count({
    where: {
      id: { not: session.user.id, notIn: blockedIds },
      emailVerified: { not: null },
      banned: false,
      profile: { onboarded: true, visibility: { in: ["PUBLIC", "MEMBERS"] } },
    },
  });

  return NextResponse.json({
    members: membersWithScore,
    total,
    pages: Math.ceil(total / take),
  });
}

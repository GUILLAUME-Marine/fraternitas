import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validation/schemas";
import { auditLog } from "@/lib/security/audit";

// GET /api/profile
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: {
        include: {
          interests: { include: { interest: true } },
          notificationSettings: true,
        },
      },
    },
  });

  return NextResponse.json({ user });
}

// PATCH /api/profile
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const body = await req.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { name, interests, ...profileData } = parsed.data;

  // Update user name
  await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  });

  // Update profile
  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: {
      ...profileData,
      onboarded: true,
    },
    create: {
      userId: session.user.id,
      ...profileData,
      onboarded: true,
    },
  });

  // Update interests
  if (interests && interests.length > 0) {
    await prisma.profileInterest.deleteMany({ where: { profileId: profile.id } });

    const validInterests = await prisma.interest.findMany({
      where: { id: { in: interests } },
    });

    if (validInterests.length > 0) {
      await prisma.profileInterest.createMany({
        data: validInterests.map((i) => ({
          profileId: profile.id,
          interestId: i.id,
        })),
      });
    }
  }

  await auditLog({ action: "PROFILE_UPDATED", userId: session.user.id });

  return NextResponse.json({ message: "Profil mis à jour." });
}

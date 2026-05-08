import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileEditor } from "./profile-editor";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: {
        include: {
          interests: { include: { interest: true } },
        },
      },
    },
  });

  const allInterests = await prisma.interest.findMany({ orderBy: { category: "asc" } });

  const [eventsCount, circlesCount, connectionsCount] = await Promise.all([
    prisma.eventRegistration.count({ where: { userId: session.user.id, status: "CONFIRMED" } }),
    prisma.circleMember.count({ where: { userId: session.user.id } }),
    prisma.connection.count({
      where: { status: "ACCEPTED", OR: [{ senderId: session.user.id }, { receiverId: session.user.id }] },
    }),
  ]);

  return (
    <ProfileEditor
      user={user}
      allInterests={allInterests}
      stats={{ events: eventsCount, circles: circlesCount, connections: connectionsCount }}
    />
  );
}

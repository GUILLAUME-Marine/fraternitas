import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopNav } from "@/components/dashboard/topnav";
import { MobileNav } from "@/components/dashboard/mobile-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: {},
    create: {
      userId: session.user.id,
      onboarded: true,
      notificationSettings: { create: {} },
    },
  });

  const [unreadMessages, unreadNotifications] = await Promise.all([
    prisma.conversationMember.count({
      where: {
        userId: session.user.id,
        conversation: {
          messages: {
            some: {
              senderId: { not: session.user.id },
              deletedAt: null,
            },
          },
        },
      },
    }),
    prisma.notification.count({
      where: { userId: session.user.id, read: false },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <DashboardTopNav user={session.user} />
      <div className="pt-16 flex">
        <DashboardSidebar
          unreadMessages={unreadMessages}
          unreadNotifications={unreadNotifications}
        />
        <main className="flex-1 md:ml-60 min-h-[calc(100vh-4rem)] pb-20 md:pb-0">
          {children}
        </main>
      </div>
      <MobileNav
        unreadMessages={unreadMessages}
        unreadNotifications={unreadNotifications}
      />
    </div>
  );
}

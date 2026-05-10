// src/app/dashboard/layout.tsx
//
// MODIFICATION : sur les routes /dashboard/spiritual/*
// → on masque la DashboardSidebar et la MobileNav globales
//   (la page spiritual a sa propre sidebar + nav)
// → toutes les autres routes /dashboard/* gardent le comportement existant.

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopNav } from "@/components/dashboard/topnav";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { headers } from "next/headers";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const userId = session.user.id;

  // Détecter si on est sur une route /spiritual
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isSpiritual = pathname.startsWith("/dashboard/spiritual");

  // Ensure profile exists — robuste sans crash
  try {
    const existing = await prisma.profile.findUnique({ where: { userId } });
    if (!existing) {
      await prisma.profile.create({
        data: {
          userId,
          onboarded: true,
          notificationSettings: { create: {} },
        },
      });
    } else if (!existing.onboarded) {
      await prisma.profile.update({
        where: { userId },
        data: { onboarded: true },
      });
    }
  } catch (e) {
    console.error("[PROFILE_ENSURE_ERROR]", e);
  }

  let unreadMessages = 0;
  let unreadNotifications = 0;

  try {
    [unreadMessages, unreadNotifications] = await Promise.all([
      prisma.conversationMember.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);
  } catch (e) {
    console.error("[UNREAD_COUNT_ERROR]", e);
  }

  // Sur /spiritual → layout transparent (la page gère tout elle-même)
  if (isSpiritual) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  // Sur toutes les autres routes dashboard → layout standard
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

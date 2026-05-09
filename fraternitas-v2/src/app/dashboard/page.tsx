import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRelative } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  let feedMessages: any[] = [];
  let upcomingEvents: any[] = [];
  let connectionsCount = 0;
  let eventsCount = 0;
  let circlesCount = 0;

  try {
    const myCircles = await prisma.circle.findMany({
      where: { members: { some: { userId } }, status: "ACTIVE" },
      select: { id: true },
    });
    const circleIds = myCircles.map((c) => c.id);

    if (circleIds.length > 0) {
      feedMessages = await prisma.circleMessage.findMany({
        where: { circleId: { in: circleIds }, deletedAt: null, userId: { not: userId } },
        include: {
          user: { select: { id: true, name: true, image: true, profile: { select: { city: true } } } },
          circle: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
    }

    [upcomingEvents, connectionsCount, eventsCount, circlesCount] = await Promise.all([
      prisma.event.findMany({
        where: { status: "PUBLISHED", startDate: { gte: new Date() } },
        orderBy: { startDate: "asc" },
        take: 3,
        select: { id: true, title: true, city: true, startDate: true, type: true },
      }),
      prisma.connection.count({
        where: { status: "ACCEPTED", OR: [{ senderId: userId }, { receiverId: userId }] },
      }),
      prisma.eventRegistration.count({ where: { userId, status: "CONFIRMED" } }),
      prisma.circleMember.count({ where: { userId } }),
    ]);
  } catch (e) {
    console.error("[DASHBOARD_PAGE_ERROR]", e);
  }

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const firstName = session.user.name?.split(" ")[0] || "ami(e)";

  return (
    <div className="flex">
      <div className="flex-1 p-6 md:p-10">
        <div className="mb-8">
          <h1 className="font-display font-light text-3xl text-[#111009] mb-1">
            Bonjour, {firstName} ✦
          </h1>
          <p className="text-sm text-[rgba(17,16,9,0.45)] capitalize">{today}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: "👥", n: connectionsCount, l: "Connexions" },
            { icon: "🗓️", n: eventsCount, l: "Événements" },
            { icon: "🏘️", n: circlesCount, l: "Cercles" },
          ].map((s) => (
            <div key={s.l} className="bg-white rounded-2xl p-5 border border-[rgba(17,16,9,0.08)] shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
              <div className="text-xl mb-3">{s.icon}</div>
              <div className="font-display text-4xl font-light text-[#111009] mb-1">{s.n}</div>
              <div className="text-xs text-[rgba(17,16,9,0.45)]">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Contenu spirituel du jour */}
        <Link href="/dashboard/spiritual" className="block mb-8">
          <div className="bg-[#111009] rounded-2xl p-6 hover:scale-[1.01] transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">✦</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#D4AF5A]">Contenu du jour</span>
            </div>
            <p className="font-display text-lg text-[#F7F3EC] font-light leading-relaxed mb-1">
              Évangile du jour, saint du jour et citation spirituelle
            </p>
            <p className="text-xs text-[rgba(247,243,236,0.45)]">Cliquez pour lire →</p>
          </div>
        </Link>

        {/* Feed */}
        <h2 className="font-display text-xl font-medium text-[#111009] mb-4">Activité des cercles</h2>

        {feedMessages.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-[rgba(17,16,9,0.08)] text-center">
            <div className="text-4xl mb-4">🏘️</div>
            <p className="font-display text-xl text-[#111009] mb-2">Rejoignez des cercles</p>
            <p className="text-sm text-[rgba(17,16,9,0.5)] mb-6">
              Rejoignez des cercles locaux pour voir l'activité de votre communauté ici.
            </p>
            <Link href="/dashboard/circles"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#111009] text-white text-sm font-medium hover:-translate-y-0.5 transition-all">
              Découvrir les cercles →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {feedMessages.map((msg) => (
              <div key={msg.id} className="bg-white rounded-2xl p-6 border border-[rgba(17,16,9,0.08)] hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EEE8DA] flex items-center justify-center text-lg flex-shrink-0">
                      {msg.user.name?.[0]?.toUpperCase() || "👤"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111009]">{msg.user.name}</p>
                      <p className="text-xs text-[rgba(17,16,9,0.45)]">{msg.circle.name}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[rgba(17,16,9,0.35)]">{formatRelative(msg.createdAt)}</span>
                </div>
                <p className="text-sm text-[rgba(17,16,9,0.7)] leading-relaxed">{msg.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right panel */}
      <aside className="hidden lg:block w-72 border-l border-[rgba(17,16,9,0.08)] bg-white p-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto flex-shrink-0">
        <h3 className="font-display text-lg font-medium text-[#111009] mb-4">Événements proches</h3>
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-[rgba(17,16,9,0.45)] mb-3">Aucun événement à venir.</p>
            <Link href="/dashboard/events"
              className="text-xs text-[#B8973A] hover:text-[#D4AF5A] transition-colors">
              Créer le premier →
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5 mb-8">
            {upcomingEvents.map((ev) => (
              <Link key={ev.id} href="/dashboard/events"
                className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(17,16,9,0.08)] bg-[#F7F3EC] hover:bg-white hover:shadow-sm transition-all">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F0E3C0] to-[#EEE8DA] flex flex-col items-center justify-center flex-shrink-0">
                  <span className="font-display text-base font-medium text-[#B8973A] leading-none">
                    {new Date(ev.startDate).getDate()}
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-[#D4AF5A]">
                    {new Date(ev.startDate).toLocaleDateString("fr-FR", { month: "short" })}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#111009] truncate">{ev.title}</p>
                  <p className="text-xs text-[rgba(17,16,9,0.4)]">📍 {ev.city}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link href="/dashboard/members"
          className="block p-5 rounded-2xl bg-[#111009] text-[#F7F3EC] hover:scale-[1.02] transition-all">
          <div className="text-2xl mb-3">✦</div>
          <p className="text-sm font-display font-light leading-relaxed mb-3">
            Trouvez des catholiques compatibles près de vous.
          </p>
          <span className="text-xs text-[#D4AF5A]">Découvrir des membres →</span>
        </Link>
      </aside>
    </div>
  );
}

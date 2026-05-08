import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRelative } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  // Get user's circles
  const myCircles = await prisma.circle.findMany({
    where: { members: { some: { userId } }, status: "ACTIVE" },
    select: { id: true },
  });
  const circleIds = myCircles.map((c) => c.id);

  // Get recent circle messages as feed
  const feedMessages = await prisma.circleMessage.findMany({
    where: { circleId: { in: circleIds }, deletedAt: null, userId: { not: userId } },
    include: {
      user: { select: { id: true, name: true, image: true, profile: { select: { city: true } } } },
      circle: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Upcoming events
  const upcomingEvents = await prisma.event.findMany({
    where: { status: "PUBLISHED", startDate: { gte: new Date() } },
    orderBy: { startDate: "asc" },
    take: 3,
    select: { id: true, title: true, city: true, startDate: true, type: true },
  });

  // Stats
  const [connectionsCount, eventsCount, circlesCount] = await Promise.all([
    prisma.connection.count({
      where: { status: "ACCEPTED", OR: [{ senderId: userId }, { receiverId: userId }] },
    }),
    prisma.eventRegistration.count({ where: { userId, status: "CONFIRMED" } }),
    prisma.circleMember.count({ where: { userId } }),
  ]);

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="flex">
      <div className="flex-1 p-6 md:p-10">
        <div className="mb-8">
          <h1 className="font-display font-light text-3xl text-[#111009] mb-1">
            Bonjour, {session!.user!.name?.split(" ")[0]} ✦
          </h1>
          <p className="text-sm text-[rgba(17,16,9,0.45)] capitalize">{today}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: "👥", n: connectionsCount, l: "Connexions", trend: "↑ actif" },
            { icon: "🗓️", n: eventsCount, l: "Événements inscrits", trend: "→ à venir" },
            { icon: "🏘️", n: circlesCount, l: "Cercles", trend: "✦ actif" },
          ].map((s) => (
            <div key={s.l} className="bg-white rounded-2xl p-5 border border-[rgba(17,16,9,0.08)] shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">{s.icon}</span>
                <span className="text-xs text-[#16a34a] font-medium">{s.trend}</span>
              </div>
              <div className="font-display text-4xl font-light text-[#111009] mb-1">{s.n}</div>
              <div className="text-xs text-[rgba(17,16,9,0.45)]">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Feed */}
        <h2 className="font-display text-xl font-medium text-[#111009] mb-4">Activité des cercles</h2>

        {feedMessages.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-[rgba(17,16,9,0.08)] text-center">
            <div className="text-4xl mb-4">🏘️</div>
            <p className="font-display text-xl text-[#111009] mb-2">Rejoignez des cercles</p>
            <p className="text-sm text-[rgba(17,16,9,0.5)] mb-6">Rejoignez des cercles locaux pour voir l'activité de votre communauté ici.</p>
            <a href="/dashboard/circles" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#111009] text-white text-sm font-medium hover:-translate-y-0.5 transition-all">
              Découvrir les cercles →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {feedMessages.map((msg) => (
              <div key={msg.id} className="bg-white rounded-2xl p-6 border border-[rgba(17,16,9,0.08)] hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EEE8DA] flex items-center justify-center text-lg flex-shrink-0">
                      {msg.user.image ? (
                        <img src={msg.user.image} alt={msg.user.name || ""} className="w-full h-full rounded-full object-cover" />
                      ) : "👤"}
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
          <p className="text-sm text-[rgba(17,16,9,0.45)]">Aucun événement à venir.</p>
        ) : (
          <div className="space-y-2.5 mb-8">
            {upcomingEvents.map((ev) => (
              <a key={ev.id} href="/dashboard/events"
                className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(17,16,9,0.08)] bg-[#F7F3EC] hover:bg-white hover:shadow-sm transition-all cursor-pointer">
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
              </a>
            ))}
          </div>
        )}

        <div className="p-5 rounded-2xl bg-[#111009] text-[#F7F3EC]">
          <div className="text-2xl mb-3">✦</div>
          <p className="text-sm font-display font-light leading-relaxed mb-4">
            Invitez des amis à rejoindre Fraternitas et grandissez ensemble.
          </p>
          <a href="/dashboard/members" className="inline-flex items-center gap-1.5 text-xs text-[#D4AF5A] hover:text-[#F0E3C0] transition-colors">
            Trouver des membres →
          </a>
        </div>
      </aside>
    </div>
  );
}

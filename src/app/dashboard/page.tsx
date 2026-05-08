import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const stats = [
  { icon: "👥", label: "Connexions", value: "24", trend: "+3 ce mois", color: "from-[#F0E3C0] to-[#EEE8DA]" },
  { icon: "🗓️", label: "Événements à venir", value: "3", trend: "→ Ce week-end", color: "from-[#E8F4EC] to-[#D4E8DA]" },
  { icon: "🏘️", label: "Cercles actifs", value: "2", trend: "+1 nouveau", color: "from-[#F0E3C0] to-[#EEE8DA]" },
];

const feedItems = [
  {
    avatar: "👩",
    name: "Marie-Claire R.",
    role: "Cercle Lyon Sud",
    time: "Il y a 2h",
    text: "Bonjour à tous ! Je viens d'organiser une soirée raclette + jeux de société pour samedi prochain. On est 8 pour l'instant, encore 4 places. Qui est partant ? 🧀🎲",
    tags: ["🏘️ Lyon 7e", "Soirée", "Samedi 18 jan."],
    reactions: null,
  },
  {
    avatar: "📿",
    name: "Fraternitas · Réflexion",
    role: "Contenu spirituel",
    time: "Ce matin",
    text: "« La joie est le signe infaillible de la présence de Dieu. » — Teilhard de Chardin. Dans un monde qui cherche le bonheur partout sauf là où il se trouve, notre communauté est un signe.",
    tags: ["✦ Spiritualité"],
    reactions: { count: 34, comments: 12 },
  },
  {
    avatar: "👨",
    name: "Hugo B.",
    role: "Membre Premium · Lyon",
    time: "Hier",
    text: "Superbe retraite de week-end à Ars-sur-Formans ! On était 22 personnes. Des discussions profondes, un temps de prière magnifique, et de belles amitiés nouées. Je rentre transformé. 🙏✨",
    tags: ["🏔️ Retraite", "Ars-sur-Formans"],
    reactions: { count: 67, comments: 28 },
  },
];

const upcomingEvents = [
  { day: "18", month: "Jan", name: "Soirée raclette & jeux", loc: "Lyon 7e · 4 places" },
  { day: "25", month: "Jan", name: "Groupe lecture — Bernanos", loc: "Lyon 2e · 4 places" },
  { day: "01", month: "Fév", name: "Retraite week-end Taizé", loc: "Bourgogne · 6 places" },
];

const suggestions = [
  { avatar: "👩", name: "Laure D.", meta: "Paris · Avocate · 92% compat." },
  { avatar: "👨", name: "Pierre V.", meta: "Lyon · Médecin · 88% compat." },
  { avatar: "👩", name: "Sophie M.", meta: "Lyon · Designer · 85% compat." },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const firstName = session.user.name?.split(" ")[0] || "ami(e)";
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="flex min-h-full">
      {/* Main content */}
      <div className="flex-1 p-6 md:p-10 pb-24 md:pb-10">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="font-display font-light text-[28px] text-[#111009] mb-1">
            Bonjour, {firstName} ✦
          </h1>
          <p className="text-sm text-[rgba(17,16,9,0.45)] font-body capitalize">{today}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-[rgba(17,16,9,0.08)] shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">{s.icon}</span>
                <span className="text-xs text-[rgba(17,16,9,0.45)] font-body">{s.trend}</span>
              </div>
              <div className="font-display text-4xl font-light text-[#111009] mb-1">{s.value}</div>
              <div className="text-sm text-[rgba(17,16,9,0.5)] font-body">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feed */}
        <h2 className="font-display text-xl font-medium text-[#111009] mb-4">Fil d&apos;activité</h2>
        <div className="space-y-3">
          {feedItems.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-[rgba(17,16,9,0.08)] hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EEE8DA] flex items-center justify-center text-lg flex-shrink-0">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111009] font-body">{item.name}</p>
                    <p className="text-xs text-[rgba(17,16,9,0.4)] font-body">{item.role}</p>
                  </div>
                </div>
                <span className="text-xs text-[rgba(17,16,9,0.35)] font-body flex-shrink-0">{item.time}</span>
              </div>
              <p className="text-sm text-[rgba(17,16,9,0.7)] leading-relaxed font-body mb-4">{item.text}</p>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-[#F7F3EC] border border-[rgba(17,16,9,0.10)] text-[rgba(17,16,9,0.6)] px-2.5 py-1 rounded-full font-body">
                    {tag}
                  </span>
                ))}
              </div>
              {item.reactions && (
                <div className="flex gap-4 mt-4 pt-3 border-t border-[rgba(17,16,9,0.06)]">
                  <button className="text-xs text-[rgba(17,16,9,0.4)] hover:text-[#111009] transition-colors font-body">
                    ❤️ {item.reactions.count} réactions
                  </button>
                  <button className="text-xs text-[rgba(17,16,9,0.4)] hover:text-[#111009] transition-colors font-body">
                    💬 {item.reactions.comments} commentaires
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <aside className="hidden lg:block w-72 xl:w-80 border-l border-[rgba(17,16,9,0.08)] bg-white p-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto flex-shrink-0">
        {/* Suggestions */}
        <h3 className="font-display text-lg font-medium text-[#111009] mb-4">Membres suggérés</h3>
        <div className="space-y-2.5 mb-8">
          {suggestions.map((s) => (
            <div key={s.name} className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(17,16,9,0.08)] bg-[#F7F3EC] hover:bg-white hover:shadow-sm transition-all cursor-pointer">
              <div className="w-11 h-11 rounded-full bg-[#EEE8DA] flex items-center justify-center text-xl flex-shrink-0">
                {s.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111009] font-body">{s.name}</p>
                <p className="text-xs text-[rgba(17,16,9,0.4)] font-body truncate">{s.meta}</p>
              </div>
              <button className="w-7 h-7 rounded-full bg-[#111009] text-white flex items-center justify-center text-sm hover:bg-[#B8973A] transition-colors flex-shrink-0">
                +
              </button>
            </div>
          ))}
        </div>

        {/* Upcoming events */}
        <h3 className="font-display text-lg font-medium text-[#111009] mb-4">Événements proches</h3>
        <div className="space-y-2.5">
          {upcomingEvents.map((e) => (
            <div key={e.name} className="flex items-center gap-3 p-3 rounded-xl border border-[rgba(17,16,9,0.08)] bg-[#F7F3EC] hover:bg-white hover:shadow-sm transition-all cursor-pointer">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F0E3C0] to-[#EEE8DA] flex flex-col items-center justify-center flex-shrink-0">
                <span className="font-display text-base font-medium text-[#B8973A] leading-none">{e.day}</span>
                <span className="text-[9px] font-semibold uppercase tracking-wide text-[#D4AF5A] font-body">{e.month}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#111009] font-body truncate">{e.name}</p>
                <p className="text-xs text-[rgba(17,16,9,0.4)] font-body">📍 {e.loc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Welcome card */}
        <div className="mt-8 p-5 rounded-2xl bg-[#111009] text-[#F7F3EC]">
          <div className="text-2xl mb-3">✦</div>
          <p className="text-sm font-display font-light leading-relaxed mb-4">
            Bienvenue dans votre communauté, {firstName}. Explorez les cercles locaux et participez à votre premier événement.
          </p>
          <Link
            href="/dashboard/events"
            className="inline-flex items-center gap-1.5 text-xs text-[#D4AF5A] hover:text-[#F0E3C0] transition-colors font-body"
          >
            Voir les événements →
          </Link>
        </div>
      </aside>
    </div>
  );
}

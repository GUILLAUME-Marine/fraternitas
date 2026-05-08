import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { SignOutButton } from "./sign-out-button";

const sidebarLinks = [
  { icon: "🏠", label: "Fil d'activité", href: "/dashboard" },
  { icon: "💬", label: "Messages", href: "/dashboard/messages", badge: 5 },
  { icon: "🗓️", label: "Événements", href: "/dashboard/events" },
  { icon: "🏘️", label: "Mes cercles", href: "/dashboard/circles" },
  { icon: "👥", label: "Membres proches", href: "/dashboard/members" },
  { icon: "📖", label: "Contenu spirituel", href: "/dashboard/spiritual" },
  { icon: "😊", label: "Mon profil", href: "/dashboard/profile" },
  { icon: "⚙️", label: "Paramètres", href: "/dashboard/settings" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      {/* Top Nav */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-[rgba(17,16,9,0.10)] z-50 flex items-center px-6 justify-between">
        <Link href="/dashboard">
          <Logo variant="dark" size="sm" />
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[rgba(17,16,9,0.6)] font-body hidden sm:block">
            {session.user.name || session.user.email}
          </span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F0E3C0] to-[#D4AF5A] flex items-center justify-center text-sm font-semibold text-[#8B6914]">
            {(session.user.name?.[0] || session.user.email?.[0] || "U").toUpperCase()}
          </div>
          <SignOutButton />
        </div>
      </header>

      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside className="fixed top-16 left-0 bottom-0 w-60 bg-white border-r border-[rgba(17,16,9,0.08)] overflow-y-auto hidden md:flex flex-col p-4">
          <div className="space-y-0.5 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(17,16,9,0.35)] px-3 py-2 font-body">
              Navigation
            </p>
            {sidebarLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F7F3EC] text-[rgba(17,16,9,0.65)] hover:text-[#111009] transition-all group"
              >
                <span className="w-8 h-8 rounded-lg bg-[#F7F3EC] group-hover:bg-white flex items-center justify-center text-base transition-colors flex-shrink-0">
                  {l.icon}
                </span>
                <span className="text-sm font-body flex-1">{l.label}</span>
                {l.badge && (
                  <span className="bg-[#B8973A] text-white text-xs font-semibold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {l.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-[rgba(17,16,9,0.08)]">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-xs text-[rgba(17,16,9,0.4)] hover:text-[rgba(17,16,9,0.7)] transition-colors font-body"
            >
              ← Retour au site
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 md:ml-60 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[rgba(17,16,9,0.10)] flex justify-around items-center h-16 px-2 z-50">
        {[
          { icon: "🏠", label: "Accueil", href: "/dashboard" },
          { icon: "🗓️", label: "Événements", href: "/dashboard/events" },
          { icon: "💬", label: "Messages", href: "/dashboard/messages" },
          { icon: "😊", label: "Profil", href: "/dashboard/profile" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl hover:bg-[#F7F3EC] transition-colors"
          >
            <span className="text-xl">{l.icon}</span>
            <span className="text-[10px] text-[rgba(17,16,9,0.5)] font-body">{l.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

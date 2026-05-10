"use client";
// src/components/dashboard/sidebar.tsx
//
// MODIFICATION : se masque complètement sur /dashboard/spiritual/*
// La page spiritual a sa propre sidebar — pas de doublon.
// Utilise usePathname() côté client — pas besoin de middleware.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard",               icon: "🏠", label: "Fil d'activité",  exact: true  },
  { href: "/dashboard/messages",      icon: "💬", label: "Messages",         badge: "messages"      },
  { href: "/dashboard/notifications", icon: "🔔", label: "Notifications",    badge: "notifications" },
  { section: "Communauté" },
  { href: "/dashboard/intentions",    icon: "🙏", label: "Intentions" },
  { href: "/dashboard/events",        icon: "🗓️", label: "Événements" },
  { href: "/dashboard/circles",       icon: "🏘️", label: "Mes cercles" },
  { href: "/dashboard/members",       icon: "👥", label: "Membres proches" },
  { href: "/dashboard/travel",        icon: "✈️", label: "Je voyage" },
  { section: "Spiritualité" },
  { href: "/dashboard/spiritual",     icon: "📖", label: "Prières" },
  { section: "Personnel" },
  { href: "/dashboard/profile",       icon: "😊", label: "Mon profil" },
  { href: "/dashboard/settings",      icon: "⚙️", label: "Paramètres" },
  { href: "/dashboard/pricing",       icon: "✦",  label: "Passer Premium" },
];

interface Props {
  unreadMessages:      number;
  unreadNotifications: number;
}

export function DashboardSidebar({ unreadMessages, unreadNotifications }: Props) {
  const pathname = usePathname();

  // Masqué entièrement sur toutes les pages /spiritual
  // (la page spiritual gère sa propre sidebar)
  if (pathname.startsWith("/dashboard/spiritual")) return null;

  const getBadge = (badge?: string) => {
    if (badge === "messages")      return unreadMessages;
    if (badge === "notifications") return unreadNotifications;
    return 0;
  };

  return (
    <aside className="hidden md:flex flex-col fixed top-16 left-0 bottom-0 w-60 bg-white border-r border-[rgba(17,16,9,0.08)] p-4 overflow-y-auto z-40">
      {links.map((link, i) => {
        if ("section" in link) {
          return (
            <p key={i} className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(17,16,9,0.35)] px-3 py-2 mt-3 first:mt-0">
              {link.section}
            </p>
          );
        }

        const isActive   = link.exact ? pathname === link.href : pathname.startsWith(link.href!);
        const badgeCount = getBadge((link as any).badge);
        const isPremium  = link.href === "/dashboard/pricing";

        return (
          <Link key={link.href} href={link.href!}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
              isPremium && "bg-gradient-to-r from-[#F0E3C0] to-[#EEE8DA] text-[#8B6914] font-medium",
              !isPremium && isActive  && "bg-[#111009] text-white",
              !isPremium && !isActive && "text-[rgba(17,16,9,0.65)] hover:bg-[#F7F3EC] hover:text-[#111009]"
            )}>
            <span className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0",
              isPremium  ? "bg-[rgba(184,151,58,0.15)]"  :
              isActive   ? "bg-[rgba(255,255,255,0.15)]" : "bg-[#F7F3EC]"
            )}>
              {link.icon}
            </span>
            <span className="flex-1">{link.label}</span>
            {badgeCount > 0 && (
              <span className={cn(
                "text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center",
                isActive ? "bg-[#D4AF5A]" : "bg-[#B8973A]"
              )}>
                {badgeCount > 99 ? "99+" : badgeCount}
              </span>
            )}
          </Link>
        );
      })}
      <div className="mt-auto pt-4 border-t border-[rgba(17,16,9,0.08)]">
        <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs text-[rgba(17,16,9,0.4)] hover:text-[rgba(17,16,9,0.7)] transition-colors">
          ← Retour au site
        </Link>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  unreadMessages: number;
  unreadNotifications: number;
}

const items = [
  { href: "/dashboard", icon: "🏠", label: "Accueil", exact: true },
  { href: "/dashboard/events", icon: "🗓️", label: "Événements" },
  { href: "/dashboard/messages", icon: "💬", label: "Messages", badge: "messages" },
  { href: "/dashboard/members", icon: "👥", label: "Membres" },
  { href: "/dashboard/profile", icon: "😊", label: "Profil" },
];

export function MobileNav({ unreadMessages, unreadNotifications }: Props) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[rgba(17,16,9,0.10)] flex justify-around items-center h-16 px-2 z-50">
      {items.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const badge = item.badge === "messages" ? unreadMessages : 0;
        return (
          <Link key={item.href} href={item.href}
            className={cn("flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-colors relative",
              isActive ? "bg-[#F7F3EC]" : "hover:bg-[#F7F3EC]")}>
            <span className="text-xl">{item.icon}</span>
            <span className={cn("text-[10px]", isActive ? "text-[#B8973A] font-medium" : "text-[rgba(17,16,9,0.45)]")}>{item.label}</span>
            {badge > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#B8973A] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

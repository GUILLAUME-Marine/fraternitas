"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  unreadMessages: number;
  unreadNotifications: number;
}

const items = [
  { href: "/dashboard",           label: "Accueil",   exact: true,  icon: "home" },
  { href: "/dashboard/events",    label: "Événements", exact: false, icon: "calendar" },
  { href: "/dashboard/spiritual", label: "Prières",   exact: false, icon: "cross",  special: true }, // ← renommé
  { href: "/dashboard/messages",  label: "Messages",  exact: false, icon: "chat",   badge: "messages" },
  { href: "/dashboard/profile",   label: "Profil",    exact: false, icon: "user" },
];

function Icon({ name, active, special }: { name: string; active: boolean; special?: boolean }) {
  const stroke = special
    ? (active ? "#C49A3C" : "rgba(17,16,9,0.32)")
    : (active ? "#111009" : "rgba(17,16,9,0.35)");
  const fill = special && active ? "rgba(196,154,60,0.1)" : "none";

  if (name === "cross") return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="11.5" stroke={stroke} strokeWidth="1.2" fill={fill} />
      <line x1="14" y1="5.5" x2="14" y2="22.5" stroke={stroke} strokeWidth="1.3" />
      <line x1="7.5" y1="11" x2="20.5" y2="11" stroke={stroke} strokeWidth="1.3" />
    </svg>
  );
  if (name === "home") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3L21 12V20C21 20.55 20.55 21 20 21H15V16H9V21H4C3.45 21 3 20.55 3 20V12Z"
        stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        fill={active ? "rgba(17,16,9,0.07)" : "none"} />
    </svg>
  );
  if (name === "calendar") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="3" stroke={stroke} strokeWidth="1.5" fill={active ? "rgba(17,16,9,0.07)" : "none"} />
      <line x1="3" y1="9" x2="21" y2="9" stroke={stroke} strokeWidth="1.5" />
      <line x1="8" y1="2" x2="8" y2="6" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="2" x2="16" y2="6" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
  if (name === "chat") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M21 15C21 15.53 20.79 16.04 20.41 16.41C20.04 16.79 19.53 17 19 17H7L3 21V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H19C19.53 3 20.04 3.21 20.41 3.59C20.79 3.96 21 4.47 21 5V15Z"
        stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        fill={active ? "rgba(17,16,9,0.07)" : "none"} />
    </svg>
  );
  if (name === "user") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={stroke} strokeWidth="1.5" fill={active ? "rgba(17,16,9,0.07)" : "none"} />
      <path d="M4 20C4 17 7.58 14 12 14C16.42 14 20 17 20 20" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
  return null;
}

export function MobileNav({ unreadMessages, unreadNotifications: _ }: Props) {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(247,243,236,0.94)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(17,16,9,0.08)",
        paddingBottom: "env(safe-area-inset-bottom)",
        height: "calc(60px + env(safe-area-inset-bottom))",
        display: "flex", alignItems: "stretch",
      }}
    >
      {items.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const badge = item.badge === "messages" ? unreadMessages : 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              flex: 1,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 3,
              textDecoration: "none", position: "relative",
              padding: "8px 2px",
              background: item.special && isActive ? "rgba(196,154,60,0.06)" : "transparent",
              transition: "background 0.15s",
            }}
          >
            {/* Indicateur actif */}
            {isActive && (
              <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: 26, height: 2, borderRadius: "0 0 2px 2px",
                background: item.special ? "#C49A3C" : "#111009",
              }} />
            )}

            {/* Badge messages */}
            {badge > 0 && (
              <div style={{
                position: "absolute", top: 6, right: "calc(50% - 16px)",
                width: 16, height: 16, borderRadius: "50%",
                background: "#C49A3C", color: "#fff",
                fontSize: 9, fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid rgba(247,243,236,0.94)",
              }}>
                {badge > 9 ? "9+" : badge}
              </div>
            )}

            <Icon name={item.icon} active={isActive} special={item.special} />

            <span style={{
              fontSize: 10,
              fontWeight: isActive ? 500 : 400,
              color: item.special
                ? (isActive ? "#C49A3C" : "rgba(17,16,9,0.38)")
                : (isActive ? "#111009" : "rgba(17,16,9,0.38)"),
              letterSpacing: item.special ? "0.02em" : "0",
              fontFamily: "'DM Sans',system-ui,sans-serif",
              transition: "color 0.15s",
            }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

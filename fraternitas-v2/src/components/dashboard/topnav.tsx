"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface Props {
  user: { id?: string; name?: string | null; email?: string | null; image?: string | null };
}

export function DashboardTopNav({ user }: Props) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-[rgba(17,16,9,0.10)] z-50 flex items-center justify-between px-6">
      <Link href="/dashboard" className="flex items-center gap-2.5">
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22.5" stroke="#B8973A" strokeWidth="1.2"/>
          <rect x="22.8" y="8" width="2.4" height="32" rx="1.2" fill="#B8973A"/>
          <rect x="10" y="19.8" width="28" height="2.4" rx="1.2" fill="#B8973A"/>
          <circle cx="24" cy="24" r="3.5" fill="none" stroke="#B8973A" strokeWidth="1.4"/>
          <circle cx="24" cy="24" r="1.5" fill="#B8973A"/>
        </svg>
        <span className="font-display text-lg text-[#111009] tracking-wide hidden sm:block">Fraternitas</span>
      </Link>

      <div className="flex items-center gap-3">
        <span className="text-sm text-[rgba(17,16,9,0.55)] hidden sm:block">{user.name}</span>
        <Link href="/dashboard/profile"
          className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F0E3C0] to-[#D4AF5A] flex items-center justify-center text-sm font-bold text-[#8B6914] hover:scale-105 transition-transform">
          {getInitials(user.name || user.email || "U")}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-1.5 text-xs text-[rgba(17,16,9,0.45)] hover:text-[#111009] transition-colors px-2 py-1.5 rounded-lg hover:bg-[rgba(17,16,9,0.06)]">
          <LogOut size={14} />
          <span className="hidden sm:block">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}

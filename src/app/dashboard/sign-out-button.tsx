"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-1.5 text-xs text-[rgba(17,16,9,0.45)] hover:text-[#111009] transition-colors font-body px-2 py-1.5 rounded-lg hover:bg-[rgba(17,16,9,0.06)]"
      title="Se déconnecter"
    >
      <LogOut size={14} />
      <span className="hidden sm:block">Déconnexion</span>
    </button>
  );
}

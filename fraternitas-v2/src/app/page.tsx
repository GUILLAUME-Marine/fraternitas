import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#0D0C08] flex flex-col items-center justify-center px-6">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(184,151,58,0.12)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-12">
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22.5" stroke="#B8973A" strokeWidth="1.2"/>
            <rect x="22.8" y="8" width="2.4" height="32" rx="1.2" fill="#B8973A"/>
            <rect x="10" y="19.8" width="28" height="2.4" rx="1.2" fill="#B8973A"/>
            <circle cx="24" cy="24" r="3.5" fill="none" stroke="#B8973A" strokeWidth="1.4"/>
            <circle cx="24" cy="24" r="1.5" fill="#B8973A"/>
          </svg>
          <span className="font-display text-2xl text-[#F7F3EC] tracking-wide">Fraternitas</span>
        </div>

        <h1 className="font-display font-light text-5xl md:text-6xl text-[#F7F3EC] mb-6 leading-tight">
          Ne vivez plus votre<br />foi <em>seul</em>.
        </h1>

        <p className="text-lg text-[rgba(247,243,236,0.55)] font-light leading-relaxed mb-12 max-w-lg mx-auto">
          Fraternitas réunit les catholiques pratiquants qui cherchent des amis authentiques, une communauté locale et une vie de foi incarnée.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register"
            className="px-8 py-4 rounded-2xl bg-gradient-to-br from-[#D4AF5A] to-[#B8973A] text-white font-medium text-base hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#B8973A]/30 transition-all">
            Rejoindre la communauté →
          </Link>
          <Link href="/auth/login"
            className="px-8 py-4 rounded-2xl border border-[rgba(255,255,255,0.12)] text-[rgba(247,243,236,0.7)] font-medium text-base hover:bg-[rgba(255,255,255,0.06)] transition-all">
            Se connecter
          </Link>
        </div>

        <p className="mt-8 text-sm text-[rgba(247,243,236,0.25)]">
          Gratuit pour commencer · Aucune carte requise
        </p>
      </div>

      <footer className="absolute bottom-6 text-xs text-[rgba(247,243,236,0.2)]">
        © {new Date().getFullYear()} Fraternitas · Fait avec ✦ et foi
      </footer>
    </div>
  );
}

import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D0C08] flex flex-col">
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22.5" stroke="#B8973A" strokeWidth="1.2"/>
            <rect x="22.8" y="8" width="2.4" height="32" rx="1.2" fill="#B8973A"/>
            <rect x="10" y="19.8" width="28" height="2.4" rx="1.2" fill="#B8973A"/>
            <circle cx="24" cy="24" r="3.5" fill="none" stroke="#B8973A" strokeWidth="1.4"/>
            <circle cx="24" cy="24" r="1.5" fill="#B8973A"/>
          </svg>
          <span className="font-display text-xl text-[#F7F3EC] tracking-wide">Fraternitas</span>
        </Link>
      </header>

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(184,151,58,0.10)_0%,transparent_70%)]" />
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        {children}
      </main>

      <footer className="p-6 text-center">
        <p className="text-xs text-[rgba(247,243,236,0.2)] font-body">
          © {new Date().getFullYear()} Fraternitas · Fait avec ✦ et foi
        </p>
      </footer>
    </div>
  );
}

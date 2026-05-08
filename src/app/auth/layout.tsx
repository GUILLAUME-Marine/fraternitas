import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D0C08] flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/">
          <Logo variant="light" size="md" />
        </Link>
      </header>

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(184,151,58,0.10)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(184,151,58,0.06)_0%,transparent_70%)]" />
        {/* Rings */}
        {[500, 750, 1000].map((size, i) => (
          <div
            key={size}
            className="absolute top-1/3 left-1/2 rounded-full border border-[rgba(184,151,58,0.08)]"
            style={{
              width: size,
              height: size,
              transform: "translate(-50%, -50%)",
              animation: `pulse-ring 5s ease-in-out ${i}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-xs text-[rgba(247,243,236,0.2)] font-body">
          © {new Date().getFullYear()} Fraternitas · Fait avec ✦ et foi
        </p>
      </footer>

      <style>{`
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.02); }
        }
      `}</style>
    </div>
  );
}

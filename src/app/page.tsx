import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero";
import { FeaturesSection } from "@/components/sections/features";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { PricingSection } from "@/components/sections/pricing";
import { FaqSection } from "@/components/sections/faq";
import { CtaSection } from "@/components/sections/cta";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />

        {/* Marquee strip */}
        <div className="border-y border-[rgba(17,16,9,0.12)] bg-white py-5 overflow-hidden">
          <div className="flex gap-16 animate-[marquee_30s_linear_infinite] whitespace-nowrap w-max">
            {[
              "Emmanuel","Chemin Neuf","Communion et Libération",
              "NeoCatéchuménat","Aleteia","KTO","Famille Chrétienne",
              "Opus Dei","Focolari","Emmanuel","Chemin Neuf",
              "Communion et Libération","NeoCatéchuménat","Aleteia",
              "KTO","Famille Chrétienne","Opus Dei","Focolari",
            ].map((name, i) => (
              <span key={i} className="font-display text-base font-light text-[rgba(17,16,9,0.35)] tracking-wide">
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Why section */}
        <section className="py-32 px-6 bg-[#0D0C08] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(184,151,58,0.09)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(184,151,58,0.06)_0%,transparent_70%)] pointer-events-none" />
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-3 text-[#D4AF5A] text-xs font-semibold uppercase tracking-[0.14em] mb-5 font-body">
                <span className="w-5 h-px bg-[#D4AF5A]" />
                Le constat
              </div>
              <h2 className="font-display font-light text-[clamp(36px,5vw,64px)] text-[#F7F3EC] mb-6">
                La solitude<br />
                n&apos;est pas une{" "}
                <em className="italic text-[#D4AF5A]">fatalité</em>
              </h2>
              <p className="text-lg font-light text-[rgba(247,243,236,0.6)] mb-10 font-body leading-relaxed">
                Les catholiques pratiquants de 20–40 ans vivent une
                contradiction : des convictions profondes, mais peu de liens
                sociaux qui les reflètent. Fraternitas est l&apos;infrastructure
                sociale qui manquait.
              </p>
              <a
                href="#fonctionnalites"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-[rgba(255,255,255,0.2)] text-[#F7F3EC] text-sm font-body hover:bg-[rgba(255,255,255,0.08)] transition-all"
              >
                Trouver ma communauté →
              </a>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[rgba(255,255,255,0.06)] rounded-3xl overflow-hidden border border-[rgba(255,255,255,0.08)]">
              {[
                { n: "78%", l: "des cathos pratiquants se sentent isolés dans leur foi" },
                { n: "1,3Md", l: "de catholiques — aucun réseau social digne de ce nom" },
                { n: "+40%", l: "de jeunes adultes en quête de sens et de communauté" },
                { n: "2024", l: "renaissance catholique visible chez les 18–35 ans" },
              ].map((s) => (
                <div key={s.n} className="p-9 bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] transition-colors">
                  <div className="font-display text-5xl font-light text-[#F0E3C0] mb-2 tracking-tight">
                    {s.n}
                  </div>
                  <p className="text-sm text-[rgba(247,243,236,0.45)] leading-snug font-body font-light">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </>
  );
}

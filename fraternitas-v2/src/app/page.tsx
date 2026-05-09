"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

// ─── Design tokens ────────────────────────────────────────────────────────────
// Crème #F7F3EC · Encre #111009 · Or #C49A3C · Blanc #FFFFFF

// ─── Helpers ──────────────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(247,243,236,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(17,16,9,0.08)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12.5" stroke="#C49A3C" strokeWidth="1" />
              <line x1="14" y1="4.5" x2="14" y2="23.5" stroke="#C49A3C" strokeWidth="1.3" />
              <line x1="8.5" y1="11" x2="19.5" y2="11" stroke="#C49A3C" strokeWidth="1.3" />
            </svg>
            <span
              className="font-serif text-lg tracking-wide"
              style={{ color: "#111009", fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
            >
              Fraternitas
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#communaute"
              className="text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: "rgba(17,16,9,0.65)" }}
            >
              La communauté
            </a>
            <a
              href="#comment"
              className="text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: "rgba(17,16,9,0.65)" }}
            >
              Comment ça marche
            </a>
            <a
              href="#faq"
              className="text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: "rgba(17,16,9,0.65)" }}
            >
              FAQ
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium px-4 py-2 rounded-full transition-all hover:bg-black/5"
              style={{ color: "#111009" }}
            >
              Se connecter
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:opacity-90 hover:shadow-md"
              style={{ background: "#111009", color: "#F7F3EC" }}
            >
              Rejoindre →
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            <span
              className="block w-6 h-px transition-all"
              style={{
                background: "#111009",
                transform: menuOpen ? "rotate(45deg) translate(2px, 3px)" : "none",
              }}
            />
            <span
              className="block w-6 h-px transition-all"
              style={{
                background: "#111009",
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-6 h-px transition-all"
              style={{
                background: "#111009",
                transform: menuOpen ? "rotate(-45deg) translate(2px, -3px)" : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden"
            style={{
              background: "rgba(247,243,236,0.98)",
              borderBottom: "1px solid rgba(17,16,9,0.08)",
            }}
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {["#communaute", "#comment", "#faq"].map((href, i) => (
                <a
                  key={href}
                  href={href}
                  className="text-base font-medium py-2"
                  style={{ color: "#111009" }}
                  onClick={() => setMenuOpen(false)}
                >
                  {["La communauté", "Comment ça marche", "FAQ"][i]}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-2 border-t" style={{ borderColor: "rgba(17,16,9,0.08)" }}>
                <Link
                  href="/auth/login"
                  className="text-center py-3 rounded-xl font-medium"
                  style={{ color: "#111009", border: "1.5px solid rgba(17,16,9,0.15)" }}
                  onClick={() => setMenuOpen(false)}
                >
                  Se connecter
                </Link>
                <Link
                  href="/auth/register"
                  className="text-center py-3 rounded-xl font-semibold"
                  style={{ background: "#111009", color: "#F7F3EC" }}
                  onClick={() => setMenuOpen(false)}
                >
                  Rejoindre gratuitement →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 overflow-hidden"
      style={{ background: "#0D0C08" }}
    >
      {/* Atmospheric glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(196,154,60,0.13) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(196,154,60,0.07) 0%, transparent 65%)",
          animation: "pulse-glow 6s ease-in-out infinite",
        }}
      />

      {/* Subtle cross motif */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${10 + i * 22}%`,
              top: `${15 + (i % 3) * 25}%`,
              width: 1,
              height: 80,
              background: "#C49A3C",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full"
          style={{ border: "1px solid rgba(196,154,60,0.3)", color: "#C49A3C" }}
        >
          <span className="text-xs">✦</span>
          <span className="text-xs font-medium tracking-widest uppercase">
            Bêta ouverte — Rejoignez les premiers membres
          </span>
        </motion.div>

        {/* Titre principal */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif font-light leading-[1.1] mb-6"
          style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            fontSize: "clamp(48px, 8vw, 88px)",
            color: "#F7F3EC",
            letterSpacing: "-0.01em",
          }}
        >
          Ne vivez plus
          <br />
          votre foi{" "}
          <em
            className="italic"
            style={{ color: "#C49A3C" }}
          >
            seul.
          </em>
        </motion.h1>

        {/* Sous-titre émotionnel */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 leading-relaxed font-light"
          style={{
            fontSize: "clamp(17px, 2.5vw, 21px)",
            color: "rgba(247,243,236,0.6)",
            maxWidth: "520px",
            margin: "0 auto 2.5rem",
          }}
        >
          Fraternitas réunit des catholiques de 20 à 40 ans autour de cercles locaux,
          d&rsquo;événements réels et d&rsquo;une vie spirituelle partagée.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/auth/register"
            className="px-8 py-4 rounded-full font-semibold text-base transition-all hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5"
            style={{ background: "#C49A3C", color: "#0D0C08" }}
          >
            Rejoindre gratuitement →
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-4 rounded-full font-medium text-base transition-all hover:bg-white/10"
            style={{
              border: "1.5px solid rgba(247,243,236,0.2)",
              color: "rgba(247,243,236,0.75)",
            }}
          >
            Se connecter
          </Link>
        </motion.div>

        {/* Note honnête */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 text-xs"
          style={{ color: "rgba(247,243,236,0.25)" }}
        >
          Gratuit pour commencer. Aucune carte de crédit requise.
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: "rgba(247,243,236,0.2)" }}
      >
        <span className="text-xs tracking-widest uppercase font-light">Découvrir</span>
        <div
          className="w-px h-8"
          style={{
            background: "linear-gradient(to bottom, rgba(247,243,236,0.3), transparent)",
            animation: "scroll-fade 2s ease-in-out infinite",
          }}
        />
      </motion.div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.08); }
        }
        @keyframes scroll-fade {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </section>
  );
}

// ─── Section "Ce que vous vivez" (émotionnelle) ───────────────────────────────
function EmotionSection() {
  const phrases = [
    "Vous allez à la messe le dimanche. Mais vous ne savez pas avec qui déjeuner après.",
    "Vous avez des convictions profondes — mais dans votre entourage, personne ne partage vraiment votre foi.",
    "Vous cherchez des amis avec qui prier, rire, vous engager. Pas juste partager un banc.",
    "Vous sentez que la foi devrait s'incarner dans le quotidien. Mais vous ne savez pas comment.",
  ];

  return (
    <section
      className="py-28 px-6"
      style={{ background: "#111009" }}
      id="communaute"
    >
      <div className="max-w-2xl mx-auto">
        <Reveal>
          <p
            className="text-xs font-medium tracking-widest uppercase mb-12"
            style={{ color: "rgba(196,154,60,0.7)" }}
          >
            Ce que vous vivez
          </p>
        </Reveal>

        <div className="space-y-10">
          {phrases.map((phrase, i) => (
            <Reveal key={i} delay={i * 80}>
              <p
                className="font-serif font-light leading-relaxed"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(20px, 3vw, 26px)",
                  color: i === 0 ? "rgba(247,243,236,0.9)" : `rgba(247,243,236,${0.5 - i * 0.04})`,
                }}
              >
                {phrase}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={400}>
          <div
            className="mt-16 pt-12 border-t"
            style={{ borderColor: "rgba(196,154,60,0.15)" }}
          >
            <p
              className="font-serif italic font-light leading-relaxed"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(22px, 3.5vw, 30px)",
                color: "#C49A3C",
              }}
            >
              Fraternitas existe pour ça.
            </p>
            <p
              className="mt-3 font-light"
              style={{ color: "rgba(247,243,236,0.45)", fontSize: "16px" }}
            >
              Une communauté construite sur de vraies rencontres, une foi partagée, et
              une présence locale concrète.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Section "Trois piliers" ──────────────────────────────────────────────────
const PILLARS = [
  {
    icon: "◎",
    title: "Cercles locaux",
    description:
      "Des petits groupes de 8 à 15 personnes dans votre ville. Pas un groupe Facebook. Une vraie communauté de proximité avec des rencontres régulières.",
  },
  {
    icon: "✦",
    title: "Événements réels",
    description:
      "Dîners, retraites, sorties, temps de prière. Des moments organisés par les membres pour les membres. La plateforme n'est qu'un outil — la vie se passe en vrai.",
  },
  {
    icon: "☽",
    title: "Vie spirituelle partagée",
    description:
      "L'évangile du jour, le saint du jour, la liturgie des heures. Des repères quotidiens pour ancrer la foi dans la semaine, pas seulement le dimanche.",
  },
];

function PillarsSection() {
  return (
    <section className="py-28 px-6" style={{ background: "#F7F3EC" }}>
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <p
              className="text-xs font-medium tracking-widest uppercase mb-4"
              style={{ color: "rgba(17,16,9,0.35)" }}
            >
              Ce que Fraternitas propose
            </p>
            <h2
              className="font-serif font-light leading-tight"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(32px, 5vw, 52px)",
                color: "#111009",
              }}
            >
              Trois piliers. Un seul but :
              <br />
              <em className="italic" style={{ color: "#C49A3C" }}>
                vous relier aux autres.
              </em>
            </h2>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {PILLARS.map((pillar, i) => (
            <Reveal key={i} delay={i * 100}>
              <div
                className="p-8 rounded-2xl flex flex-col gap-4 h-full transition-all hover:-translate-y-1 hover:shadow-md"
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid rgba(17,16,9,0.07)",
                }}
              >
                <span
                  className="text-2xl"
                  style={{ color: "#C49A3C" }}
                >
                  {pillar.icon}
                </span>
                <h3
                  className="font-serif text-xl font-medium"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    color: "#111009",
                  }}
                >
                  {pillar.title}
                </h3>
                <p
                  className="font-light leading-relaxed text-sm flex-1"
                  style={{ color: "rgba(17,16,9,0.6)" }}
                >
                  {pillar.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section "Comment ça marche" ──────────────────────────────────────────────
const STEPS = [
  {
    number: "01",
    title: "Créez votre profil",
    description:
      "Votre prénom, votre ville, ce qui vous anime. En 3 minutes, vous êtes prêt à rencontrer votre communauté.",
  },
  {
    number: "02",
    title: "Rejoignez un cercle",
    description:
      "Choisissez un cercle près de chez vous — ou créez le vôtre. Un espace intime, pas un grand groupe anonyme.",
  },
  {
    number: "03",
    title: "Participez à la vie",
    description:
      "Événements, prières, messages. La plateforme facilite. Les vraies rencontres font le reste.",
  },
];

function HowSection() {
  return (
    <section className="py-28 px-6" style={{ background: "#FFFFFF" }} id="comment">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <div className="mb-16">
            <p
              className="text-xs font-medium tracking-widest uppercase mb-4"
              style={{ color: "rgba(17,16,9,0.35)" }}
            >
              Comment ça marche
            </p>
            <h2
              className="font-serif font-light leading-tight"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(32px, 5vw, 52px)",
                color: "#111009",
              }}
            >
              Simple par principe.
              <br />
              <em className="italic" style={{ color: "#C49A3C" }}>
                Profond par nature.
              </em>
            </h2>
          </div>
        </Reveal>

        <div className="space-y-0">
          {STEPS.map((step, i) => (
            <Reveal key={i} delay={i * 100}>
              <div
                className="flex gap-8 py-10"
                style={{
                  borderBottom:
                    i < STEPS.length - 1
                      ? "1px solid rgba(17,16,9,0.07)"
                      : "none",
                }}
              >
                <div
                  className="font-serif text-4xl font-light shrink-0 w-12 pt-1"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    color: "rgba(196,154,60,0.4)",
                  }}
                >
                  {step.number}
                </div>
                <div>
                  <h3
                    className="font-serif text-xl font-medium mb-2"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      color: "#111009",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="font-light leading-relaxed"
                    style={{ color: "rgba(17,16,9,0.55)", fontSize: "15px" }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section "Pour qui" ───────────────────────────────────────────────────────
function ForWhoSection() {
  const items = [
    "Vous avez entre 20 et 40 ans",
    "Vous vous définissez comme catholique pratiquant ou en chemin",
    "Vous cherchez de vraies amitiés fondées sur des valeurs communes",
    "Vous aimeriez vous engager dans votre paroisse mais ne savez pas comment",
    "Vous êtes en ville et avez du mal à trouver des gens qui partagent votre foi",
    "Vous voulez que votre foi s'incarne dans votre vie quotidienne",
  ];

  return (
    <section className="py-28 px-6" style={{ background: "#0D0C08" }}>
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-16 items-start">
        <div>
          <Reveal>
            <p
              className="text-xs font-medium tracking-widest uppercase mb-6"
              style={{ color: "rgba(196,154,60,0.6)" }}
            >
              Pour vous si...
            </p>
            <h2
              className="font-serif font-light leading-tight"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(30px, 4vw, 44px)",
                color: "#F7F3EC",
              }}
            >
              Fraternitas n&rsquo;est pas pour tout le monde.
              <br />
              <em className="italic" style={{ color: "#C49A3C" }}>
                C&rsquo;est pour vous.
              </em>
            </h2>
          </Reveal>
        </div>

        <div className="space-y-4">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="flex items-start gap-3">
                <span
                  className="mt-1 shrink-0 text-xs"
                  style={{ color: "#C49A3C" }}
                >
                  ✦
                </span>
                <p
                  className="font-light text-sm leading-relaxed"
                  style={{ color: "rgba(247,243,236,0.65)" }}
                >
                  {item}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "Fraternitas est-il réservé aux catholiques pratiquants ?",
    a: "Non. Fraternitas accueille tous ceux qui se reconnaissent dans la foi catholique, qu'ils soient pratiquants réguliers, en chemin, ou simplement en quête de sens. Aucun jugement, aucune case à cocher.",
  },
  {
    q: "Est-ce que c'est gratuit ?",
    a: "L'accès de base est gratuit : profil, cercles, événements, vie spirituelle. Un abonnement premium sera proposé pour des fonctionnalités avancées — mais le cœur du produit restera toujours accessible.",
  },
  {
    q: "Que se passe-t-il si je suis le seul dans ma ville ?",
    a: "Vous pouvez créer le premier cercle de votre ville. Fraternitas vous donne les outils pour rassembler d'autres membres autour de vous. Beaucoup de communautés naissent d'une seule personne qui ose commencer.",
  },
  {
    q: "Mes données personnelles sont-elles protégées ?",
    a: "Oui. Vos données ne sont jamais vendues ni partagées avec des tiers. Vous contrôlez votre visibilité : public, membres uniquement, ou privé. La confiance est au cœur de Fraternitas.",
  },
  {
    q: "Fraternitas est-il affilié à un mouvement ou diocèse particulier ?",
    a: "Non. Fraternitas est une plateforme indépendante, ouverte à tous les catholiques, quelle que soit leur sensibilité spirituelle — charismatique, traditionnelle, dominicaine, ignatienne ou autre.",
  },
];

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-28 px-6" style={{ background: "#F7F3EC" }} id="faq">
      <div className="max-w-2xl mx-auto">
        <Reveal>
          <div className="text-center mb-14">
            <p
              className="text-xs font-medium tracking-widest uppercase mb-4"
              style={{ color: "rgba(17,16,9,0.35)" }}
            >
              Questions fréquentes
            </p>
            <h2
              className="font-serif font-light"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(28px, 4vw, 42px)",
                color: "#111009",
              }}
            >
              Ce que vous vous demandez
            </h2>
          </div>
        </Reveal>

        <div className="space-y-1">
          {FAQ_ITEMS.map((item, i) => (
            <Reveal key={i} delay={i * 50}>
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1.5px solid rgba(17,16,9,0.08)" }}
              >
                <button
                  className="w-full flex items-start justify-between gap-4 p-5 text-left transition-colors hover:bg-black/[0.02]"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span
                    className="font-medium text-sm leading-relaxed flex-1"
                    style={{ color: "#111009" }}
                  >
                    {item.q}
                  </span>
                  <span
                    className="shrink-0 text-lg leading-none transition-transform"
                    style={{
                      color: "#C49A3C",
                      transform: open === i ? "rotate(45deg)" : "rotate(0)",
                    }}
                  >
                    +
                  </span>
                </button>

                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <p
                        className="px-5 pb-5 font-light text-sm leading-relaxed"
                        style={{ color: "rgba(17,16,9,0.6)" }}
                      >
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Final ────────────────────────────────────────────────────────────────
function CtaFinal() {
  return (
    <section
      className="py-32 px-6 relative overflow-hidden"
      style={{ background: "#0D0C08" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(196,154,60,0.1) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-xl mx-auto text-center">
        <Reveal>
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-8"
            style={{ border: "1px solid rgba(196,154,60,0.3)" }}
          >
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12.5" stroke="#C49A3C" strokeWidth="1" />
              <line x1="14" y1="5" x2="14" y2="23" stroke="#C49A3C" strokeWidth="1.2" />
              <line x1="9" y1="11" x2="19" y2="11" stroke="#C49A3C" strokeWidth="1.2" />
            </svg>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h2
            className="font-serif font-light leading-tight mb-5"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(34px, 5vw, 56px)",
              color: "#F7F3EC",
            }}
          >
            Votre communauté
            <br />
            <em className="italic" style={{ color: "#C49A3C" }}>
              vous attend.
            </em>
          </h2>
        </Reveal>

        <Reveal delay={160}>
          <p
            className="mb-10 font-light leading-relaxed"
            style={{
              color: "rgba(247,243,236,0.5)",
              fontSize: "17px",
            }}
          >
            Rejoignez Fraternitas aujourd&rsquo;hui. C&rsquo;est gratuit, sans
            engagement, et le premier pas vers de vraies rencontres.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/register"
              className="px-9 py-4 rounded-full font-semibold text-base transition-all hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: "#C49A3C", color: "#0D0C08" }}
            >
              Rejoindre gratuitement →
            </Link>
            <Link
              href="/auth/login"
              className="px-9 py-4 rounded-full font-medium text-base transition-all hover:bg-white/10"
              style={{
                border: "1.5px solid rgba(247,243,236,0.15)",
                color: "rgba(247,243,236,0.6)",
              }}
            >
              Se connecter
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      className="py-12 px-6"
      style={{
        background: "#0D0C08",
        borderTop: "1px solid rgba(247,243,236,0.07)",
      }}
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12.5" stroke="#C49A3C" strokeWidth="1" />
            <line x1="14" y1="4.5" x2="14" y2="23.5" stroke="#C49A3C" strokeWidth="1.3" />
            <line x1="8.5" y1="11" x2="19.5" y2="11" stroke="#C49A3C" strokeWidth="1.3" />
          </svg>
          <span
            className="font-serif text-base tracking-wide"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: "rgba(247,243,236,0.7)",
            }}
          >
            Fraternitas
          </span>
        </div>

        <div className="flex flex-wrap gap-6">
          {[
            { label: "Mentions légales", href: "/legal" },
            { label: "CGU", href: "/terms" },
            { label: "Confidentialité", href: "/privacy" },
            { label: "Contact", href: "mailto:contact@fraternitas.app" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-light transition-colors hover:opacity-70"
              style={{ color: "rgba(247,243,236,0.35)" }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p
          className="text-xs font-light"
          style={{ color: "rgba(247,243,236,0.2)" }}
        >
          © {new Date().getFullYear()} Fraternitas
        </p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <EmotionSection />
        <PillarsSection />
        <HowSection />
        <ForWhoSection />
        <FaqSection />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}

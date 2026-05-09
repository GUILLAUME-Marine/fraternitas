"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ─── Reveal helper ────────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>{children}</div>
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
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style={{
        background: scrolled ? "rgba(247,243,236,0.94)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(17,16,9,0.07)" : "none",
      }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12.5" stroke="#C49A3C" strokeWidth="1" />
              <line x1="14" y1="4.5" x2="14" y2="23.5" stroke="#C49A3C" strokeWidth="1.3" />
              <line x1="8.5" y1="11" x2="19.5" y2="11" stroke="#C49A3C" strokeWidth="1.3" />
            </svg>
            <span style={{ fontFamily: "'Cormorant Garamond','Playfair Display',Georgia,serif", fontSize: "18px", color: "#111009" }}>
              Fraternitas
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[["#comprendre", "La communauté"], ["#comment", "Comment ça marche"], ["#faq", "FAQ"]].map(([href, label]) => (
              <a key={href} href={href} className="text-sm font-medium transition-opacity hover:opacity-60" style={{ color: "rgba(17,16,9,0.6)" }}>{label}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium px-4 py-2 rounded-full hover:bg-black/5" style={{ color: "#111009" }}>Se connecter</Link>
            <Link href="/auth/register" className="text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-all" style={{ background: "#111009", color: "#F7F3EC" }}>Rejoindre →</Link>
          </div>

          <button className="md:hidden p-2 flex flex-col gap-[5px]" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            {[0, 1, 2].map(i => (
              <span key={i} className="block w-5 h-px transition-all" style={{
                background: "#111009",
                opacity: menuOpen && i === 1 ? 0 : 1,
                transform: menuOpen && i === 0 ? "rotate(45deg) translate(2px,3px)" : menuOpen && i === 2 ? "rotate(-45deg) translate(2px,-3px)" : "none",
              }} />
            ))}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden"
            style={{ background: "rgba(247,243,236,0.98)", borderBottom: "1px solid rgba(17,16,9,0.08)" }}>
            <div className="px-6 py-5 flex flex-col gap-4">
              {[["#comprendre", "La communauté"], ["#comment", "Comment ça marche"], ["#faq", "FAQ"]].map(([href, label]) => (
                <a key={href} href={href} className="text-base font-medium py-1" style={{ color: "#111009" }} onClick={() => setMenuOpen(false)}>{label}</a>
              ))}
              <div className="pt-3 border-t flex flex-col gap-3" style={{ borderColor: "rgba(17,16,9,0.08)" }}>
                <Link href="/auth/login" className="text-center py-3 rounded-xl font-medium text-sm" style={{ border: "1.5px solid rgba(17,16,9,0.15)", color: "#111009" }} onClick={() => setMenuOpen(false)}>Se connecter</Link>
                <Link href="/auth/register" className="text-center py-3 rounded-xl font-semibold text-sm" style={{ background: "#111009", color: "#F7F3EC" }} onClick={() => setMenuOpen(false)}>Rejoindre gratuitement →</Link>
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
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20 overflow-hidden"
      style={{ background: "linear-gradient(160deg,#1A1710 0%,#0D0C08 50%,#16140E 100%)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 65% 45% at 50% 55%,rgba(196,154,60,0.10) 0%,transparent 70%)",
      }} />
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full"
          style={{ border: "1px solid rgba(196,154,60,0.25)", color: "rgba(196,154,60,0.8)" }}>
          <span className="text-xs">✦</span>
          <span className="text-xs font-medium tracking-widest uppercase">Bêta ouverte — Rejoignez les premiers membres</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "'Cormorant Garamond','Playfair Display',Georgia,serif",
            fontSize: "clamp(46px,7.5vw,84px)", fontWeight: 300,
            color: "#F7F3EC", lineHeight: 1.08, letterSpacing: "-0.01em", marginBottom: "1.25rem",
          }}>
          Ne vivez plus<br />votre foi{" "}
          <em className="italic" style={{ color: "#C49A3C" }}>seul.</em>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: "clamp(16px,2.2vw,19px)", color: "rgba(247,243,236,0.55)", fontWeight: 300, lineHeight: 1.65, maxWidth: "500px", margin: "0 auto 2.5rem" }}>
          Fraternitas réunit des catholiques autour de cercles locaux,
          d&rsquo;événements réels et d&rsquo;une vie spirituelle partagée.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/auth/register"
            className="px-8 py-3.5 rounded-full font-semibold text-base transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: "#C49A3C", color: "#0D0C08" }}>
            Rejoindre gratuitement →
          </Link>
          <Link href="/auth/login"
            className="px-8 py-3.5 rounded-full font-medium text-base transition-all hover:bg-white/10"
            style={{ border: "1.5px solid rgba(247,243,236,0.18)", color: "rgba(247,243,236,0.65)" }}>
            Se connecter
          </Link>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="mt-5 text-xs" style={{ color: "rgba(247,243,236,0.2)" }}>
          Gratuit pour commencer. Aucune carte de crédit requise.
        </motion.p>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs tracking-widest uppercase" style={{ color: "rgba(247,243,236,0.18)" }}>Découvrir</span>
        <div className="w-px h-7 animate-pulse" style={{ background: "linear-gradient(to bottom,rgba(196,154,60,0.4),transparent)" }} />
      </motion.div>
    </section>
  );
}

// ─── Encart "Qu'est-ce que Fraternitas" ───────────────────────────────────────
function WhatIsSection() {
  return (
    <section className="py-24 px-6" style={{ background: "#F7F3EC" }} id="comprendre">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="rounded-3xl overflow-hidden grid md:grid-cols-2"
            style={{ border: "1.5px solid rgba(17,16,9,0.09)", background: "#fff", boxShadow: "0 4px 40px rgba(17,16,9,0.05)" }}>

            {/* Gauche */}
            <div className="p-10 md:p-14 flex flex-col justify-center">
              <p className="text-xs font-medium tracking-widest uppercase mb-5" style={{ color: "rgba(196,154,60,0.7)" }}>
                Qu&rsquo;est-ce que Fraternitas ?
              </p>
              <h2 style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif",
                fontSize: "clamp(24px,3.2vw,36px)", fontWeight: 400,
                color: "#111009", lineHeight: 1.22, marginBottom: "1.25rem",
              }}>
                Une communauté catholique
                <br /><em className="italic" style={{ color: "#C49A3C" }}>vivante et locale.</em>
              </h2>
              <p className="font-light leading-relaxed mb-4 text-sm" style={{ color: "rgba(17,16,9,0.62)" }}>
                Fraternitas n&rsquo;est pas un réseau social de plus. C&rsquo;est un espace
                structuré autour de{" "}
                <strong style={{ color: "#111009", fontWeight: 500 }}>cercles de proximité</strong> — de petits groupes
                ancrés dans une ville, où des catholiques se retrouvent, prient,
                organisent des événements et tissent de vraies amitiés.
              </p>
              <p className="font-light leading-relaxed text-sm" style={{ color: "rgba(17,16,9,0.62)" }}>
                La plateforme est un outil. La vie se passe en vrai, entre vraies
                personnes, dans de vrais lieux. Fraternitas est ouvert à tous ceux
                qui se reconnaissent dans la foi catholique, quelle que soit leur
                sensibilité ou leur cheminement.
              </p>
              <div className="mt-8">
                <Link href="/auth/register"
                  className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full transition-all hover:opacity-90"
                  style={{ background: "#111009", color: "#F7F3EC" }}>
                  Rejoindre la communauté →
                </Link>
              </div>
            </div>

            {/* Droite — 3 piliers */}
            <div className="p-10 md:p-14 flex flex-col gap-8"
              style={{ background: "rgba(247,243,236,0.5)", borderLeft: "1.5px solid rgba(17,16,9,0.07)" }}>
              {[
                { icon: "◎", label: "Cercles locaux", desc: "Des groupes de 8 à 15 personnes dans votre ville. Un espace intime, pas un grand groupe anonyme." },
                { icon: "✦", label: "Événements réels", desc: "Dîners, retraites, sorties. Organisés par les membres, pour les membres — la plateforme ne fait qu'aider." },
                { icon: "☽", label: "Vie spirituelle partagée", desc: "L'évangile du jour, le saint du jour, des repères quotidiens pour ancrer la foi dans la semaine." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="text-xl mt-0.5 shrink-0" style={{ color: "#C49A3C" }}>{item.icon}</span>
                  <div>
                    <p className="font-semibold text-sm mb-1" style={{ color: "#111009" }}>{item.label}</p>
                    <p className="font-light text-sm leading-relaxed" style={{ color: "rgba(17,16,9,0.55)" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Section émotionnelle — cartes ───────────────────────────────────────────
function EmotionSection() {
  const phrases = [
    { text: "Vous allez à la messe le dimanche. Mais vous ne savez pas avec qui déjeuner après.", icon: "☀" },
    { text: "Vous avez des convictions profondes — mais dans votre entourage, peu partagent vraiment votre foi.", icon: "✶" },
    { text: "Vous cherchez des amis avec qui prier, rire, vous engager. Pas juste partager un banc.", icon: "◇" },
    { text: "Vous sentez que la foi devrait s'incarner dans le quotidien — mais vous ne savez pas comment.", icon: "✦" },
  ];

  return (
    <section className="py-24 px-6" style={{ background: "#F3EFE7" }}>
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <p className="text-xs font-medium tracking-widest uppercase mb-10" style={{ color: "rgba(17,16,9,0.35)" }}>
            Ce que vous vivez peut-être
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-4">
          {phrases.map((item, i) => (
            <Reveal key={i} delay={i * 75}>
              <div className="rounded-2xl p-7 h-full flex flex-col gap-4 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                style={{ background: "#FFFFFF", border: "1.5px solid rgba(17,16,9,0.07)" }}>
                <span className="text-xl" style={{ color: "rgba(196,154,60,0.55)" }}>{item.icon}</span>
                <p className="font-light leading-relaxed" style={{ color: "rgba(17,16,9,0.68)", fontSize: "15px", lineHeight: 1.7 }}>
                  {item.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={300}>
          <div className="mt-6 rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6"
            style={{ background: "#111009" }}>
            <svg width="36" height="36" viewBox="0 0 28 28" fill="none" className="shrink-0">
              <circle cx="14" cy="14" r="12.5" stroke="#C49A3C" strokeWidth="1" />
              <line x1="14" y1="5" x2="14" y2="23" stroke="#C49A3C" strokeWidth="1.2" />
              <line x1="9" y1="11" x2="19" y2="11" stroke="#C49A3C" strokeWidth="1.2" />
            </svg>
            <p style={{
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "clamp(18px,2.2vw,24px)", fontWeight: 300,
              color: "#F7F3EC", lineHeight: 1.45,
            }}>
              Fraternitas existe pour ça. Pour que vous ne soyez plus seul à vivre votre foi.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Comment ça marche ────────────────────────────────────────────────────────
function HowSection() {
  const steps = [
    { n: "01", title: "Créez votre profil", desc: "Votre prénom, votre ville, ce qui vous anime. En quelques minutes, vous rejoignez la communauté." },
    { n: "02", title: "Rejoignez un cercle", desc: "Choisissez un cercle près de chez vous — ou créez le vôtre. Un espace intime, pas un grand groupe anonyme." },
    { n: "03", title: "Participez à la vie", desc: "Événements, prières partagées, messages. La plateforme facilite. Les vraies rencontres font le reste." },
  ];

  return (
    <section className="py-24 px-6" style={{ background: "#FFFFFF" }} id="comment">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <div className="mb-14">
            <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: "rgba(17,16,9,0.35)" }}>
              Comment ça marche
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "clamp(28px,4vw,46px)", fontWeight: 400,
              color: "#111009", lineHeight: 1.15,
            }}>
              Simple par principe.{" "}
              <em className="italic" style={{ color: "#C49A3C" }}>Profond par nature.</em>
            </h2>
          </div>
        </Reveal>

        {steps.map((step, i) => (
          <Reveal key={i} delay={i * 90}>
            <div className="flex gap-8 py-9" style={{
              borderBottom: i < steps.length - 1 ? "1px solid rgba(17,16,9,0.07)" : "none",
            }}>
              <div style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif",
                fontSize: "38px", fontWeight: 300,
                color: "rgba(196,154,60,0.35)", width: "48px", flexShrink: 0, paddingTop: "2px",
              }}>{step.n}</div>
              <div>
                <p className="font-semibold text-base mb-1.5" style={{ color: "#111009" }}>{step.title}</p>
                <p className="font-light text-sm leading-relaxed" style={{ color: "rgba(17,16,9,0.55)" }}>{step.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ─── Pour qui ────────────────────────────────────────────────────────────────
function ForWhoSection() {
  const items = [
    "Vous vous définissez comme catholique pratiquant, en chemin, ou simplement en quête de sens",
    "Vous cherchez de vraies amitiés fondées sur des valeurs communes",
    "Vous avez du mal à trouver des catholiques en dehors de la messe",
    "Vous aimeriez vous engager concrètement mais ne savez pas par où commencer",
    "Vous voulez que votre foi s'incarne dans votre vie de tous les jours",
    "Vous souhaitez rencontrer des gens avec qui prier, mais aussi sortir, débattre, rire",
  ];

  return (
    <section className="py-24 px-6" style={{ background: "#F7F3EC" }}>
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-start">
        <Reveal>
          <p className="text-xs font-medium tracking-widest uppercase mb-6" style={{ color: "rgba(17,16,9,0.35)" }}>
            Fraternitas est pour vous si…
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: "clamp(26px,3.2vw,40px)", fontWeight: 400,
            color: "#111009", lineHeight: 1.22,
          }}>
            Ouvert à tous ceux qui cherchent
            <em className="italic" style={{ color: "#C49A3C" }}> à ne plus être seuls.</em>
          </h2>
          <p className="mt-5 font-light text-sm leading-relaxed" style={{ color: "rgba(17,16,9,0.5)" }}>
            Pas de filtre d&rsquo;âge, pas de case à cocher. Fraternitas accueille
            quiconque se reconnaît dans la foi catholique et cherche une communauté
            humaine et vivante.
          </p>
        </Reveal>

        <div className="space-y-4 pt-2">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 55}>
              <div className="flex items-start gap-3">
                <span className="mt-1 shrink-0 text-xs" style={{ color: "#C49A3C" }}>✦</span>
                <p className="font-light text-sm leading-relaxed" style={{ color: "rgba(17,16,9,0.65)" }}>{item}</p>
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
  { q: "Fraternitas est-il réservé aux catholiques pratiquants ?", a: "Non. Fraternitas accueille tous ceux qui se reconnaissent dans la foi catholique, qu'ils soient pratiquants réguliers, en chemin, ou simplement en quête de sens. Aucun jugement, aucune condition d'entrée." },
  { q: "Y a-t-il une limite d'âge ?", a: "Aucune. Fraternitas est ouvert à tous, quel que soit l'âge. Que vous ayez 20 ans ou 70 ans, votre place est ici si vous cherchez une communauté." },
  { q: "Est-ce que c'est gratuit ?", a: "L'accès de base est gratuit : profil, cercles, événements, vie spirituelle quotidienne. Un abonnement premium sera proposé pour des fonctionnalités avancées — mais le cœur du produit restera toujours accessible." },
  { q: "Que se passe-t-il si je suis le seul dans ma ville ?", a: "Vous pouvez créer le premier cercle de votre ville. Fraternitas vous donne les outils pour rassembler d'autres membres autour de vous. Beaucoup de communautés naissent d'une seule personne qui ose commencer." },
  { q: "Fraternitas est-il affilié à un mouvement ou un diocèse ?", a: "Non. Fraternitas est une plateforme indépendante, ouverte à toutes les sensibilités catholiques — charismatique, traditionnelle, dominicaine, ignatienne ou autre." },
  { q: "Mes données personnelles sont-elles protégées ?", a: "Oui. Vos données ne sont jamais vendues ni partagées avec des tiers. Vous contrôlez votre visibilité. La confiance est au cœur de Fraternitas." },
];

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 px-6" style={{ background: "#FFFFFF" }} id="faq">
      <div className="max-w-2xl mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: "rgba(17,16,9,0.35)" }}>Questions fréquentes</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "clamp(26px,4vw,40px)", fontWeight: 400, color: "#111009" }}>
              Ce que vous vous demandez
            </h2>
          </div>
        </Reveal>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <Reveal key={i} delay={i * 40}>
              <div className="rounded-xl overflow-hidden" style={{ border: "1.5px solid rgba(17,16,9,0.08)" }}>
                <button className="w-full flex items-start justify-between gap-4 p-5 text-left transition-colors hover:bg-black/[0.02]"
                  onClick={() => setOpen(open === i ? null : i)}>
                  <span className="font-medium text-sm leading-relaxed flex-1" style={{ color: "#111009" }}>{item.q}</span>
                  <span className="shrink-0 text-xl leading-none transition-transform" style={{ color: "#C49A3C", transform: open === i ? "rotate(45deg)" : "none" }}>+</span>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: "hidden" }}>
                      <p className="px-5 pb-5 font-light text-sm leading-relaxed" style={{ color: "rgba(17,16,9,0.58)" }}>{item.a}</p>
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
    <section className="py-28 px-6 relative overflow-hidden" style={{ background: "#111009" }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 55% 55% at 50% 50%,rgba(196,154,60,0.09) 0%,transparent 70%)",
      }} />
      <div className="relative z-10 max-w-xl mx-auto text-center">
        <Reveal>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-8"
            style={{ border: "1px solid rgba(196,154,60,0.3)" }}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12.5" stroke="#C49A3C" strokeWidth="1" />
              <line x1="14" y1="5" x2="14" y2="23" stroke="#C49A3C" strokeWidth="1.2" />
              <line x1="9" y1="11" x2="19" y2="11" stroke="#C49A3C" strokeWidth="1.2" />
            </svg>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: "clamp(32px,5vw,54px)", fontWeight: 300,
            color: "#F7F3EC", lineHeight: 1.1, marginBottom: "1.25rem",
          }}>
            Votre communauté<br />
            <em className="italic" style={{ color: "#C49A3C" }}>vous attend.</em>
          </h2>
        </Reveal>
        <Reveal delay={130}>
          <p className="mb-9 font-light leading-relaxed" style={{ color: "rgba(247,243,236,0.45)", fontSize: "16px" }}>
            Rejoignez Fraternitas aujourd&rsquo;hui. Gratuit, sans engagement,
            et le premier pas vers de vraies rencontres.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/register"
              className="px-9 py-3.5 rounded-full font-semibold text-base transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-xl"
              style={{ background: "#C49A3C", color: "#0D0C08" }}>
              Rejoindre gratuitement →
            </Link>
            <Link href="/auth/login"
              className="px-9 py-3.5 rounded-full font-medium text-base transition-all hover:bg-white/10"
              style={{ border: "1.5px solid rgba(247,243,236,0.15)", color: "rgba(247,243,236,0.55)" }}>
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
    <footer className="py-10 px-6" style={{ background: "#111009", borderTop: "1px solid rgba(247,243,236,0.06)" }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12.5" stroke="#C49A3C" strokeWidth="1" />
            <line x1="14" y1="4.5" x2="14" y2="23.5" stroke="#C49A3C" strokeWidth="1.3" />
            <line x1="8.5" y1="11" x2="19.5" y2="11" stroke="#C49A3C" strokeWidth="1.3" />
          </svg>
          <span style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "16px", color: "rgba(247,243,236,0.6)" }}>
            Fraternitas
          </span>
        </div>
        <div className="flex flex-wrap gap-5">
          {[{ label: "Mentions légales", href: "/legal" }, { label: "CGU", href: "/terms" }, { label: "Confidentialité", href: "/privacy" }, { label: "Contact", href: "/contact" }].map(link => (
            <Link key={link.href} href={link.href} className="text-xs font-light transition-opacity hover:opacity-60" style={{ color: "rgba(247,243,236,0.32)" }}>
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-xs font-light" style={{ color: "rgba(247,243,236,0.18)" }}>© {new Date().getFullYear()} Fraternitas</p>
      </div>
    </footer>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WhatIsSection />
        <EmotionSection />
        <HowSection />
        <ForWhoSection />
        <FaqSection />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}

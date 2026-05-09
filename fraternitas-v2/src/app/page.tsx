"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ─── Reveal ───────────────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
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
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms,
                   transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50" style={{
        background: scrolled ? "rgba(247,243,236,0.94)" : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(17,16,9,0.07)" : "none",
        transition: "background 0.3s, border-color 0.3s",
      }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12.5" stroke="#C49A3C" strokeWidth="1" />
              <line x1="14" y1="4.5" x2="14" y2="23.5" stroke="#C49A3C" strokeWidth="1.3" />
              <line x1="8.5" y1="11" x2="19.5" y2="11" stroke="#C49A3C" strokeWidth="1.3" />
            </svg>
            <span style={{
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "17px", color: "#111009", letterSpacing: "0.01em",
            }}>Fraternitas</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {[["#comprendre","La communauté"],["#comment","Comment ça marche"],["#faq","FAQ"]].map(([href,label]) => (
              <a key={href} href={href}
                className="text-sm font-medium transition-opacity hover:opacity-55"
                style={{ color: "rgba(17,16,9,0.58)" }}>{label}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login"
              className="text-sm font-medium px-4 py-2 rounded-full transition-all hover:bg-black/5"
              style={{ color: "#111009" }}>Se connecter</Link>
            <Link href="/auth/register"
              className="text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:opacity-90"
              style={{ background: "#111009", color: "#F7F3EC" }}>Rejoindre →</Link>
          </div>

          <button className="md:hidden p-2 flex flex-col gap-[5px]"
            onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            {[0,1,2].map(i => (
              <span key={i} className="block w-5 h-px transition-all" style={{
                background: "#111009",
                opacity: menuOpen && i === 1 ? 0 : 1,
                transform: menuOpen && i === 0 ? "rotate(45deg) translate(2px,3px)"
                  : menuOpen && i === 2 ? "rotate(-45deg) translate(2px,-3px)" : "none",
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
            <div className="px-5 py-5 flex flex-col gap-4">
              {[["#comprendre","La communauté"],["#comment","Comment ça marche"],["#faq","FAQ"]].map(([href,label]) => (
                <a key={href} href={href} className="text-base font-medium py-1"
                  style={{ color: "#111009" }} onClick={() => setMenuOpen(false)}>{label}</a>
              ))}
              <div className="pt-3 border-t flex flex-col gap-3" style={{ borderColor: "rgba(17,16,9,0.08)" }}>
                <Link href="/auth/login" className="text-center py-3.5 rounded-xl font-medium text-sm"
                  style={{ border: "1.5px solid rgba(17,16,9,0.15)", color: "#111009" }}
                  onClick={() => setMenuOpen(false)}>Se connecter</Link>
                <Link href="/auth/register" className="text-center py-3.5 rounded-xl font-semibold text-sm"
                  style={{ background: "#111009", color: "#F7F3EC" }}
                  onClick={() => setMenuOpen(false)}>Rejoindre gratuitement →</Link>
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
      className="relative min-h-screen flex flex-col items-center justify-center px-5 pt-24 pb-16 overflow-hidden"
      style={{ background: "linear-gradient(160deg,#1C1A12 0%,#0D0C08 55%,#181510 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 44% at 50% 58%,rgba(196,154,60,0.12) 0%,transparent 70%)",
      }} />

      <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full"
          style={{ border: "1px solid rgba(196,154,60,0.24)", color: "rgba(196,154,60,0.78)" }}
        >
          <span style={{ fontSize: "10px" }}>✦</span>
          <span className="text-xs font-medium tracking-widest uppercase">
            Bêta ouverte — Rejoignez les premiers membres
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.16,1,0.3,1] }}
          style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: "clamp(42px,9vw,86px)",
            fontWeight: 300, color: "#F5EDE0",
            lineHeight: 1.07, letterSpacing: "-0.015em",
            marginBottom: "1.1rem",
          }}
        >
          Ne vivez plus<br />votre foi{" "}
          <em style={{ fontStyle: "italic", color: "#C49A3C" }}>seul.</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16,1,0.3,1] }}
          style={{
            fontSize: "clamp(15px,2.2vw,18px)",
            color: "rgba(245,237,224,0.55)",
            fontWeight: 300, lineHeight: 1.72,
            maxWidth: "460px", margin: "0 auto 2.25rem",
          }}
        >
          Fraternitas réunit des catholiques autour de cercles locaux,
          d&rsquo;événements réels et d&rsquo;une vie spirituelle partagée.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.34, ease: [0.16,1,0.3,1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/auth/register"
            className="w-full sm:w-auto px-7 py-4 rounded-full font-semibold text-base text-center transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: "#C49A3C", color: "#0D0C08" }}>
            Rejoindre gratuitement →
          </Link>
          <Link href="/auth/login"
            className="w-full sm:w-auto px-7 py-4 rounded-full font-medium text-base text-center"
            style={{ border: "1.5px solid rgba(245,237,224,0.18)", color: "rgba(245,237,224,0.6)" }}>
            Se connecter
          </Link>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="mt-5 text-xs" style={{ color: "rgba(245,237,224,0.18)" }}>
          Gratuit pour commencer. Aucune carte de crédit requise.
        </motion.p>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs tracking-widest uppercase" style={{ color: "rgba(245,237,224,0.16)" }}>
          Découvrir
        </span>
        <div className="w-px h-6" style={{
          background: "linear-gradient(to bottom,rgba(196,154,60,0.45),transparent)",
          animation: "breathe 2.2s ease-in-out infinite",
        }} />
      </motion.div>

      <style>{`@keyframes breathe{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
    </section>
  );
}

// ─── Qu'est-ce que Fraternitas ────────────────────────────────────────────────
function WhatIsSection() {
  const pillars = [
    { icon: "◎", label: "Cercles locaux", desc: "Des groupes de 8 à 15 personnes dans votre ville. Un espace intime, pas un grand groupe anonyme." },
    { icon: "✦", label: "Événements réels", desc: "Dîners, retraites, sorties. Organisés par les membres, pour les membres." },
    { icon: "☽", label: "Vie spirituelle partagée", desc: "L'évangile du jour, le saint du jour, des repères quotidiens pour ancrer la foi dans la semaine." },
  ];

  return (
    <section className="py-16 sm:py-24 px-5" style={{ background: "#F7F3EC" }} id="comprendre">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <p className="text-xs font-medium tracking-widest uppercase mb-4"
            style={{ color: "rgba(196,154,60,0.7)" }}>
            Qu&rsquo;est-ce que Fraternitas ?
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: "clamp(26px,4vw,38px)", fontWeight: 400,
            color: "#111009", lineHeight: 1.2, marginBottom: "1rem",
          }}>
            Une communauté catholique
            <br /><em style={{ fontStyle: "italic", color: "#C49A3C" }}>vivante et locale.</em>
          </h2>
          <p style={{
            fontSize: "16px", fontWeight: 300, lineHeight: 1.78,
            color: "rgba(17,16,9,0.68)", marginBottom: "10px", maxWidth: "560px",
          }}>
            Fraternitas n&rsquo;est pas un réseau social de plus. C&rsquo;est un espace structuré
            autour de <strong style={{ color: "#111009", fontWeight: 500 }}>cercles de proximité</strong> —
            de petits groupes ancrés dans une ville, où des catholiques se retrouvent,
            prient, organisent des événements et tissent de vraies amitiés.
          </p>
          <p style={{
            fontSize: "16px", fontWeight: 300, lineHeight: 1.78,
            color: "rgba(17,16,9,0.68)", marginBottom: "24px", maxWidth: "560px",
          }}>
            La plateforme est un outil. La vie se passe en vrai, entre vraies personnes,
            dans de vrais lieux. Ouvert à tous ceux qui se reconnaissent dans la foi catholique.
          </p>
          <Link href="/auth/register"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full transition-all hover:opacity-90"
            style={{ background: "#111009", color: "#F7F3EC" }}>
            Rejoindre la communauté →
          </Link>

          {/* 3 piliers */}
          <div className="grid gap-4 mt-10 pt-8"
            style={{
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              borderTop: "1px solid rgba(17,16,9,0.08)",
            }}>
            {pillars.map((p, i) => (
              <div key={i} className="flex items-start gap-3 p-5 rounded-2xl bg-white"
                style={{ border: "1.5px solid rgba(17,16,9,0.07)" }}>
                <span className="text-lg shrink-0 mt-0.5" style={{ color: "#C49A3C" }}>{p.icon}</span>
                <div>
                  <p className="font-semibold text-sm mb-1.5" style={{ color: "#111009" }}>{p.label}</p>
                  <p style={{ fontSize: "14px", fontWeight: 300, lineHeight: 1.65, color: "rgba(17,16,9,0.58)", margin: 0 }}>
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Section émotionnelle ── PENSÉES EN ITALIQUE CORMORANT ────────────────────
// Traitement typographique : voix intérieure = italique + Cormorant + guillemets discrets
function EmotionSection() {
  const thoughts = [
    {
      text: "Vous allez à la messe le dimanche. Mais vous ne savez pas avec qui déjeuner après.",
      // Première phrase en romain, seconde en italique — la pensée intérieure
      parts: [
        { italic: false, content: "Vous allez à la messe le dimanche." },
        { italic: true,  content: " Mais vous ne savez pas avec qui déjeuner après." },
      ],
    },
    {
      parts: [
        { italic: false, content: "Vous avez des convictions profondes —" },
        { italic: true,  content: " mais dans votre entourage, peu partagent vraiment votre foi." },
      ],
    },
    {
      parts: [
        { italic: true, content: "Vous cherchez des amis avec qui prier, rire, vous engager." },
        { italic: false, content: " Pas juste partager un banc." },
      ],
    },
    {
      parts: [
        { italic: false, content: "Vous sentez que la foi devrait s'incarner dans le quotidien —" },
        { italic: true,  content: " mais vous ne savez pas comment." },
      ],
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-5" style={{ background: "#F0EBE0" }}>
      <div className="max-w-3xl mx-auto">
        <Reveal>
          <p className="text-xs font-medium tracking-widest uppercase mb-10"
            style={{ color: "rgba(17,16,9,0.33)" }}>
            Ce que vous vivez peut-être
          </p>
        </Reveal>

        {/* Liste verticale — 1 col mobile ET desktop pour cette section */}
        {/* Le contenu est dense et narratif, la colonne unique améliore la lecture */}
        <div className="space-y-4">
          {thoughts.map((thought, i) => (
            <Reveal key={i} delay={i * 70}>
              <div
                className="relative rounded-2xl px-6 py-5 sm:px-8 sm:py-6"
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid rgba(17,16,9,0.07)",
                  // Chaque carte légèrement différente — journal intime
                  borderLeft: "3px solid rgba(196,154,60,0.35)",
                }}
              >
                {/* Guillemet doré discret en filigrane */}
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "16px",
                    fontFamily: "'Cormorant Garamond',Georgia,serif",
                    fontSize: "48px",
                    lineHeight: 1,
                    color: "rgba(196,154,60,0.10)",
                    fontWeight: 300,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  "
                </span>

                <p style={{ margin: 0 }}>
                  {thought.parts.map((part, j) =>
                    part.italic ? (
                      <em
                        key={j}
                        style={{
                          fontFamily: "'Cormorant Garamond',Georgia,serif",
                          fontStyle: "italic",
                          fontSize: "clamp(17px,2.2vw,20px)",
                          fontWeight: 300,
                          color: "rgba(17,16,9,0.78)",
                          lineHeight: 1.65,
                        }}
                      >
                        {part.content}
                      </em>
                    ) : (
                      <span
                        key={j}
                        style={{
                          fontFamily: "'DM Sans',system-ui,sans-serif",
                          fontSize: "clamp(14px,1.8vw,16px)",
                          fontWeight: 300,
                          color: "rgba(17,16,9,0.55)",
                          lineHeight: 1.65,
                        }}
                      >
                        {part.content}
                      </span>
                    )
                  )}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Manifeste ── crème doré, Matthieu 18,20 ─────────────────────────────────
function ManifestoSection() {
  return (
    <section
      className="relative overflow-hidden py-20 sm:py-36 px-5"
      style={{ background: "#F5EFE3" }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 55% 55% at 50% 50%,rgba(196,154,60,0.08) 0%,transparent 70%)",
      }} />
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(to right,transparent,rgba(196,154,60,0.35),transparent)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(to right,transparent,rgba(196,154,60,0.35),transparent)" }} />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <Reveal>
          <div className="inline-flex items-center gap-3 mb-10 sm:mb-12">
            <div className="h-px w-8 sm:w-12" style={{ background: "rgba(196,154,60,0.4)" }} />
            <span className="text-xs font-medium tracking-widest uppercase"
              style={{ color: "rgba(196,154,60,0.7)" }}>
              L&rsquo;âme de Fraternitas
            </span>
            <div className="h-px w-8 sm:w-12" style={{ background: "rgba(196,154,60,0.4)" }} />
          </div>
        </Reveal>

        <Reveal delay={70}>
          <blockquote className="mb-8">
            <p style={{
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "clamp(28px,5.5vw,58px)",
              fontWeight: 300, fontStyle: "italic",
              color: "#1C1A12", lineHeight: 1.25,
              letterSpacing: "-0.01em", marginBottom: "1rem",
            }}>
              « Là où deux ou trois sont réunis en mon nom,
              <em style={{ color: "#A07828" }}> je suis au milieu d&rsquo;eux. »</em>
            </p>
            <footer style={{
              fontSize: "13px", fontWeight: 300,
              color: "rgba(28,26,18,0.42)", letterSpacing: "0.04em",
            }}>
              — Matthieu 18, 20
            </footer>
          </blockquote>
        </Reveal>

        <Reveal delay={140}>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-12" style={{ background: "rgba(196,154,60,0.22)" }} />
            <span style={{ color: "rgba(196,154,60,0.45)", fontSize: "10px" }}>✦</span>
            <div className="h-px w-12" style={{ background: "rgba(196,154,60,0.22)" }} />
          </div>
        </Reveal>

        <Reveal delay={200}>
          <p style={{
            fontSize: "clamp(15px,2vw,18px)", fontWeight: 300,
            color: "rgba(28,26,18,0.56)", lineHeight: 1.8, marginBottom: "12px",
          }}>
            Être catholique seul aujourd&rsquo;hui, c&rsquo;est difficile.
            Difficile de tenir, de persévérer, de comprendre, d&rsquo;espérer.
          </p>
          <p style={{
            fontSize: "clamp(15px,2vw,18px)", fontWeight: 300,
            color: "rgba(28,26,18,0.56)", lineHeight: 1.8, marginBottom: "32px",
          }}>
            L&rsquo;Église n&rsquo;a jamais été faite pour être vécue seul.
            Elle est un corps. Elle est communion.{" "}
            <strong style={{ color: "rgba(28,26,18,0.78)", fontWeight: 500 }}>
              Fraternitas est là pour que vous ne soyez plus seul à la vivre.
            </strong>
          </p>
        </Reveal>

        <Reveal delay={270}>
          <Link href="/auth/register"
            className="inline-flex items-center gap-2 text-sm font-semibold px-7 py-3.5 rounded-full transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: "#1C1A12", color: "#F5EFE3" }}>
            Rejoindre la communauté →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Messe ensemble ───────────────────────────────────────────────────────────
function MassTogetherSection() {
  return (
    <section className="py-16 sm:py-24 px-5" style={{ background: "#FFFFFF" }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          <div>
            <Reveal>
              <p className="text-xs font-medium tracking-widest uppercase mb-4"
                style={{ color: "rgba(17,16,9,0.33)" }}>Une fonctionnalité clé</p>
              <h2 style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif",
                fontSize: "clamp(26px,4vw,42px)", fontWeight: 400,
                color: "#111009", lineHeight: 1.18, marginBottom: "1.1rem",
              }}>
                Aller à la messe,
                <br /><em style={{ fontStyle: "italic", color: "#C49A3C" }}>ensemble.</em>
              </h2>
              <p style={{
                fontSize: "16px", fontWeight: 300, lineHeight: 1.78,
                color: "rgba(17,16,9,0.68)", marginBottom: "14px",
              }}>
                Beaucoup n&rsquo;y vont plus — non par manque de foi, mais par solitude.
                Par peur d&rsquo;y aller seul. Par difficulté à comprendre la liturgie.
                Par manque d&rsquo;un visage familier dans l&rsquo;assemblée.
              </p>
              <p style={{
                fontSize: "16px", fontWeight: 300, lineHeight: 1.78,
                color: "rgba(17,16,9,0.68)", marginBottom: "20px",
              }}>
                Sur Fraternitas, vous annoncez simplement :{" "}
                <em style={{
                  fontFamily: "'Cormorant Garamond',Georgia,serif",
                  fontStyle: "italic", fontSize: "17px",
                  color: "rgba(17,16,9,0.82)",
                }}>
                  «&thinsp;Je vais à la messe dimanche à Saint-Eustache à 10h — qui vient ?&thinsp;»
                </em>
              </p>
              <p style={{
                fontSize: "16px", fontWeight: 300, lineHeight: 1.78,
                color: "rgba(17,16,9,0.68)", marginBottom: "20px",
              }}>
                Un membre répond. Vous vous retrouvez à l&rsquo;entrée.
                Vous priez ensemble. Après, si vous le souhaitez, vous prenez un café.
              </p>

              <div className="rounded-2xl p-4 mb-7"
                style={{ background: "rgba(196,154,60,0.07)", border: "1px solid rgba(196,154,60,0.18)" }}>
                <p style={{ fontSize: "14px", fontWeight: 300, lineHeight: 1.7, color: "rgba(17,16,9,0.65)", margin: 0 }}>
                  <strong style={{ color: "#111009", fontWeight: 500 }}>Important :</strong>{" "}
                  La messe est une rencontre avec le Christ, pas un lieu de rencontre sociale.
                  Fraternitas facilite la présence ensemble — chacun prie selon son cœur,
                  en silence et en liberté.
                </p>
              </div>

              <Link href="/auth/register"
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full transition-all hover:opacity-90"
                style={{ background: "#111009", color: "#F7F3EC" }}>
                Trouver des compagnons de messe →
              </Link>
            </Reveal>
          </div>

          <Reveal delay={80}>
            <div className="space-y-3">
              <div className="rounded-2xl p-5"
                style={{ background: "#FAFAF8", border: "1.5px solid rgba(17,16,9,0.08)", boxShadow: "0 4px 20px rgba(17,16,9,0.05)" }}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-medium"
                    style={{ background: "linear-gradient(135deg,#D4C5A0,#C4A96C)", color: "#5A3E1B" }}>M</div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#111009" }}>Marie</p>
                    <p style={{ fontSize: "11px", color: "rgba(17,16,9,0.35)", margin: "1px 0 0" }}>Paris 4e · il y a 2h</p>
                  </div>
                </div>
                <div className="rounded-xl p-4 mb-4" style={{ background: "#F5EFE3" }}>
                  <p className="text-xs font-medium mb-1.5 uppercase tracking-wide"
                    style={{ color: "rgba(17,16,9,0.38)" }}>⛪ Intention de messe</p>
                  <p className="text-sm font-medium mb-1" style={{ color: "#111009" }}>
                    Messe dominicale — Saint-Eustache, Paris
                  </p>
                  <p style={{ fontSize: "13px", fontWeight: 300, color: "rgba(17,16,9,0.62)", lineHeight: 1.6 }}>
                    Dimanche 10 mai · 10h30 · Qui veut venir ? Je suis un peu perdue dans la liturgie des messes chantées 🙏
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{ background: "rgba(196,154,60,0.09)", border: "1px solid rgba(196,154,60,0.2)", color: "#8A6A20" }}>
                    🙏 Je prie pour cette intention
                  </div>
                  <div className="px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{ border: "1.5px solid rgba(17,16,9,0.1)", color: "rgba(17,16,9,0.55)" }}>
                    Je vous accompagne
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-4 ml-4"
                style={{ background: "#FAFAF8", border: "1.5px solid rgba(17,16,9,0.06)" }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-medium"
                    style={{ background: "linear-gradient(135deg,#C5D4A0,#6CA469)", color: "#1B3A1B" }}>P</div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "#111009" }}>Pierre</p>
                    <p style={{ fontSize: "13px", fontWeight: 300, color: "rgba(17,16,9,0.65)", lineHeight: 1.65 }}>
                      Je vous accompagne avec plaisir — je connais bien cette messe,
                      on peut se retrouver au portail à 10h15 🙂
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-center pt-1" style={{ color: "rgba(17,16,9,0.24)", fontWeight: 300 }}>
                Exemple illustratif — données fictives
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── Comment ça marche ────────────────────────────────────────────────────────
function HowSection() {
  const steps = [
    { n: "01", title: "Créez votre profil", desc: "Votre prénom, votre ville, ce qui vous anime. En quelques minutes, vous rejoignez la communauté." },
    { n: "02", title: "Rejoignez un cercle", desc: "Choisissez un cercle près de chez vous — ou créez le vôtre. Un espace intime, pas un grand groupe anonyme." },
    { n: "03", title: "Participez à la vie", desc: "Événements, prières partagées, messes ensemble, intentions. La plateforme facilite. Les vraies rencontres font le reste." },
  ];

  return (
    <section className="py-16 sm:py-24 px-5" style={{ background: "#F7F3EC" }} id="comment">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <div className="mb-12">
            <p className="text-xs font-medium tracking-widest uppercase mb-4"
              style={{ color: "rgba(17,16,9,0.33)" }}>Comment ça marche</p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "clamp(26px,4vw,44px)", fontWeight: 400,
              color: "#111009", lineHeight: 1.15,
            }}>
              Simple par principe.{" "}
              <em style={{ fontStyle: "italic", color: "#C49A3C" }}>Profond par nature.</em>
            </h2>
          </div>
        </Reveal>
        {steps.map((step, i) => (
          <Reveal key={i} delay={i * 80}>
            <div className="flex gap-6 sm:gap-8 py-8"
              style={{ borderBottom: i < steps.length - 1 ? "1px solid rgba(17,16,9,0.07)" : "none" }}>
              <div style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif",
                fontSize: "clamp(28px,5vw,40px)", fontWeight: 300,
                color: "rgba(196,154,60,0.35)",
                width: "44px", flexShrink: 0, paddingTop: "3px",
              }}>{step.n}</div>
              <div>
                <p className="font-semibold text-base mb-2" style={{ color: "#111009" }}>{step.title}</p>
                <p style={{ fontSize: "15px", fontWeight: 300, lineHeight: 1.72, color: "rgba(17,16,9,0.62)", margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ─── Pour vous si + Jean Chrysostome ─────────────────────────────────────────
function ForWhoSection() {
  const items = [
    "Vous vous définissez comme catholique pratiquant, en chemin, ou simplement en quête de sens",
    "Vous cherchez de vraies amitiés fondées sur des valeurs communes",
    "Vous avez du mal à trouver des catholiques en dehors de la messe",
    "Vous aimeriez aller à la messe mais vous vous sentez seul ou perdu dans la liturgie",
    "Vous voulez que votre foi s'incarne dans votre vie de tous les jours",
    "Vous souhaitez rencontrer des gens avec qui prier, mais aussi sortir, débattre, rire",
  ];

  return (
    <section className="py-16 sm:py-24 px-5" style={{ background: "#FFFFFF" }}>
      <div className="max-w-5xl mx-auto">

        {/* Jean Chrysostome */}
        <Reveal>
          <div
            className="mb-14 rounded-2xl sm:rounded-3xl px-6 py-8 sm:px-12 sm:py-10 relative overflow-hidden"
            style={{ background: "#F5EFE3", border: "1.5px solid rgba(196,154,60,0.2)" }}
          >
            <div className="hidden sm:block" style={{
              position: "absolute", top: "8px", left: "20px",
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "120px", lineHeight: 1,
              color: "rgba(196,154,60,0.09)", fontWeight: 300,
              pointerEvents: "none", userSelect: "none",
            }}>«</div>

            <div className="relative z-10 text-center max-w-xl mx-auto">
              <p style={{
                fontFamily: "'Cormorant Garamond',Georgia,serif",
                fontSize: "clamp(22px,3.8vw,36px)",
                fontWeight: 300, fontStyle: "italic",
                color: "#1C1A12", lineHeight: 1.4, marginBottom: "0.9rem",
              }}>
                « Un chrétien seul est un chrétien en danger. »
              </p>
              <p style={{
                fontSize: "13px", fontWeight: 400,
                color: "rgba(28,26,18,0.42)", letterSpacing: "0.02em", marginBottom: "1.5rem",
              }}>
                — Saint Jean Chrysostome · IVe siècle
              </p>
              <div className="flex items-center justify-center gap-4 mb-5">
                <div className="h-px w-8" style={{ background: "rgba(196,154,60,0.25)" }} />
                <span style={{ color: "rgba(196,154,60,0.4)", fontSize: "10px" }}>✦</span>
                <div className="h-px w-8" style={{ background: "rgba(196,154,60,0.25)" }} />
              </div>
              <p style={{
                fontSize: "15px", fontWeight: 300,
                color: "rgba(28,26,18,0.6)", lineHeight: 1.75, margin: 0,
              }}>
                Vivre sa foi sans communauté, c&rsquo;est s&rsquo;exposer au doute, à l&rsquo;isolement,
                et finalement à l&rsquo;abandon. L&rsquo;Église n&rsquo;est pas une option —
                elle est la maison du chrétien.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-start">
          <Reveal>
            <p className="text-xs font-medium tracking-widest uppercase mb-5"
              style={{ color: "rgba(17,16,9,0.33)" }}>Fraternitas est pour vous si…</p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 400,
              color: "#111009", lineHeight: 1.22, marginBottom: "1rem",
            }}>
              Ouvert à tous ceux
              <br />qui cherchent
              <em style={{ fontStyle: "italic", color: "#C49A3C" }}> à ne plus être seuls.</em>
            </h2>
            <p style={{
              fontSize: "15px", fontWeight: 300, lineHeight: 1.72,
              color: "rgba(17,16,9,0.56)", margin: 0,
            }}>
              Pas de filtre d&rsquo;âge, pas de case à cocher. Fraternitas accueille
              quiconque se reconnaît dans la foi catholique et cherche une communauté
              humaine et vivante.
            </p>
          </Reveal>

          <div className="space-y-4">
            {items.map((item, i) => (
              <Reveal key={i} delay={i * 50}>
                <div className="flex items-start gap-3">
                  <span className="shrink-0 mt-1.5" style={{ color: "#C49A3C", fontSize: "9px" }}>✦</span>
                  <p style={{
                    fontSize: "15px", fontWeight: 300, lineHeight: 1.72,
                    color: "rgba(17,16,9,0.68)", margin: 0,
                  }}>{item}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: "Fraternitas est-il réservé aux catholiques pratiquants ?", a: "Non. Fraternitas accueille tous ceux qui se reconnaissent dans la foi catholique, qu'ils soient pratiquants réguliers, en chemin, ou simplement en quête de sens. Aucun jugement, aucune condition d'entrée." },
  { q: "Y a-t-il une limite d'âge ?", a: "Aucune. Fraternitas est ouvert à tous, quel que soit l'âge. Votre place est ici si vous cherchez une communauté." },
  { q: "Est-ce que c'est gratuit ?", a: "L'accès de base est gratuit : profil, cercles, événements, vie spirituelle quotidienne. Un abonnement premium sera proposé pour des fonctionnalités avancées — mais le cœur du produit restera toujours accessible." },
  { q: "Que se passe-t-il si je suis le seul dans ma ville ?", a: "Vous pouvez créer le premier cercle de votre ville. Fraternitas vous donne les outils pour rassembler d'autres membres autour de vous. Beaucoup de communautés naissent d'une seule personne qui ose commencer." },
  { q: "La fonctionnalité 'aller à la messe ensemble' ne perturbe-t-elle pas le temps de prière ?", a: "Non — tout se passe avant et après la messe. Vous vous retrouvez à l'entrée, vous priez séparément selon votre cœur. La messe reste un temps de rencontre avec le Christ — Fraternitas facilite simplement la présence humaine autour de ce moment sacré." },
  { q: "Fraternitas est-il affilié à un mouvement ou un diocèse ?", a: "Non. Fraternitas est une plateforme indépendante, ouverte à toutes les sensibilités catholiques — charismatique, traditionnelle, dominicaine, ignatienne ou autre." },
  { q: "Mes données personnelles sont-elles protégées ?", a: "Oui. Vos données ne sont jamais vendues ni partagées avec des tiers. Vous contrôlez votre visibilité. La confiance est au cœur de Fraternitas." },
];

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-24 px-5" style={{ background: "#F7F3EC" }} id="faq">
      <div className="max-w-2xl mx-auto">
        <Reveal>
          <div className="text-center mb-10">
            <p className="text-xs font-medium tracking-widest uppercase mb-4"
              style={{ color: "rgba(17,16,9,0.33)" }}>Questions fréquentes</p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond',Georgia,serif",
              fontSize: "clamp(24px,4vw,38px)", fontWeight: 400, color: "#111009",
            }}>
              Ce que vous vous demandez
            </h2>
          </div>
        </Reveal>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <Reveal key={i} delay={i * 35}>
              <div className="rounded-xl overflow-hidden bg-white"
                style={{ border: "1.5px solid rgba(17,16,9,0.08)" }}>
                <button
                  className="w-full flex items-start justify-between gap-4 p-5 text-left transition-colors hover:bg-black/[0.015]"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span style={{ fontSize: "14px", fontWeight: 500, lineHeight: 1.55, color: "#111009", flex: 1 }}>
                    {item.q}
                  </span>
                  <span style={{
                    color: "#C49A3C", fontSize: "20px", lineHeight: 1, flexShrink: 0,
                    transform: open === i ? "rotate(45deg)" : "none",
                    transition: "transform 0.2s", display: "block", marginTop: "1px",
                  }}>+</span>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.26, ease: [0.16,1,0.3,1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <p className="px-5 pb-5" style={{
                        fontSize: "14px", fontWeight: 300, lineHeight: 1.72, color: "rgba(17,16,9,0.64)",
                      }}>{item.a}</p>
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
    <section className="py-20 sm:py-28 px-5 relative overflow-hidden" style={{ background: "#2C2218" }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 55% 55% at 50% 50%,rgba(196,154,60,0.10) 0%,transparent 70%)",
      }} />
      <div className="relative z-10 max-w-xl mx-auto text-center">
        <Reveal>
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-full mb-7"
            style={{ border: "1px solid rgba(196,154,60,0.35)" }}>
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12.5" stroke="#C49A3C" strokeWidth="1" />
              <line x1="14" y1="5" x2="14" y2="23" stroke="#C49A3C" strokeWidth="1.2" />
              <line x1="9" y1="11" x2="19" y2="11" stroke="#C49A3C" strokeWidth="1.2" />
            </svg>
          </div>
        </Reveal>
        <Reveal delay={55}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: "clamp(30px,5vw,52px)", fontWeight: 300,
            color: "#F5EDE0", lineHeight: 1.1, marginBottom: "1.1rem",
          }}>
            Votre communauté<br />
            <em style={{ fontStyle: "italic", color: "#C49A3C" }}>vous attend.</em>
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p style={{
            fontSize: "clamp(14px,2vw,16px)", fontWeight: 300,
            color: "rgba(245,237,224,0.46)", lineHeight: 1.72, marginBottom: "2rem",
          }}>
            Rejoignez Fraternitas aujourd&rsquo;hui. Gratuit, sans engagement,
            et le premier pas vers de vraies rencontres.
          </p>
        </Reveal>
        <Reveal delay={190}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/register"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold text-base text-center transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{ background: "#C49A3C", color: "#1C1A12" }}>
              Rejoindre gratuitement →
            </Link>
            <Link href="/auth/login"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-medium text-base text-center"
              style={{ border: "1.5px solid rgba(245,237,224,0.18)", color: "rgba(245,237,224,0.55)" }}>
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
    <footer className="py-9 px-5"
      style={{ background: "#1E1610", borderTop: "1px solid rgba(245,237,224,0.06)" }}>
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-2.5">
          <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12.5" stroke="#C49A3C" strokeWidth="1" />
            <line x1="14" y1="4.5" x2="14" y2="23.5" stroke="#C49A3C" strokeWidth="1.3" />
            <line x1="8.5" y1="11" x2="19.5" y2="11" stroke="#C49A3C" strokeWidth="1.3" />
          </svg>
          <span style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: "15px", color: "rgba(245,237,224,0.5)",
          }}>Fraternitas</span>
        </div>
        <div className="flex flex-wrap gap-4 sm:gap-5">
          {[
            { label: "Mentions légales", href: "/legal" },
            { label: "CGU", href: "/terms" },
            { label: "Confidentialité", href: "/privacy" },
            { label: "Contact", href: "/contact" },
          ].map(link => (
            <Link key={link.href} href={link.href}
              className="text-xs font-light transition-opacity hover:opacity-60"
              style={{ color: "rgba(245,237,224,0.3)" }}>{link.label}</Link>
          ))}
        </div>
        <p className="text-xs font-light" style={{ color: "rgba(245,237,224,0.16)" }}>
          © {new Date().getFullYear()} Fraternitas
        </p>
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
        <ManifestoSection />
        <MassTogetherSection />
        <HowSection />
        <ForWhoSection />
        <FaqSection />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}

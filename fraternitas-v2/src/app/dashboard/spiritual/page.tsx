"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SpiritualData {
  date: string;
  liturgicalInfo: { label: string; season: string; week: string; color: string; colorHex: string };
  gospel: { reference: string; title: string; intro: string; text: string; aelfUrl: string } | null;
  saint: { name: string; dates: string; description: string };
  quote: { text: string; author: string };
  error?: string;
}

type Tab = "jour" | "chapelet" | "prieres";

// ─── Tokens — couleurs plus contrastées pour la lisibilité ───────────────────
const C = {
  bg: "#F2EBE0",           // fond crème plus chaud
  card: "#FFFFFF",
  cardBorder: "rgba(17,16,9,0.10)",
  cream: "#E8DDD0",        // crème plus soutenu
  creamGold: "#F5EDE0",
  darkCard: "#1A1612",     // carte sombre — moins noir pur, plus brun profond
  gold: "#B8893A",         // or légèrement plus soutenu
  goldBorder: "rgba(184,137,58,0.35)",
  ink: "#111009",
  ink80: "rgba(17,16,9,0.80)",
  ink65: "rgba(17,16,9,0.65)",
  ink50: "rgba(17,16,9,0.50)",
  ink35: "rgba(17,16,9,0.35)",
  ink12: "rgba(17,16,9,0.12)",
  serif: "'Cormorant Garamond','Playfair Display',Georgia,serif",
  sans: "'DM Sans',system-ui,sans-serif",
};

// ─── Strip HTML — retirer toutes les balises résiduelles ─────────────────────
function stripHtml(str: string): string {
  return str
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, "«").replace(/&rdquo;/g, "»")
    .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ")
    .replace(/&eacute;/g, "é").replace(/&egrave;/g, "è")
    .replace(/&agrave;/g, "à").replace(/&#[0-9]+;/g, "")
    .replace(/&[a-z]+;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── Catégories de prières ────────────────────────────────────────────────────
const PRAYER_CATEGORIES = [
  {
    id: "quotidiennes",
    label: "Prières quotidiennes",
    icon: "✦",
    prayers: [
      { slug: "notre-pere", label: "Notre Père", sub: "La prière enseignée par Jésus" },
      { slug: "je-vous-salue-marie", label: "Je vous salue Marie", sub: "Ave Maria" },
      { slug: "gloire-au-pere", label: "Gloire au Père", sub: "Doxologie trinitaire" },
      { slug: "angelus", label: "L'Angélus", sub: "6h · 12h · 18h" },
      { slug: "acte-de-contrition", label: "Acte de contrition", sub: "Repentance et pardon" },
      { slug: "acte-de-foi", label: "Acte de foi", sub: "Profession de foi personnelle" },
    ],
  },
  {
    id: "repas",
    label: "Avant le repas",
    icon: "☀",
    prayers: [
      { slug: "avant-le-repas", label: "Bénédicité", sub: "Bénissez-nous, Seigneur…" },
      { slug: "grace-apres-repas", label: "Grâces après le repas", sub: "Action de grâces" },
    ],
  },
  {
    id: "morts",
    label: "Prières pour nos morts",
    icon: "🕯",
    prayers: [
      { slug: "pour-les-defunts", label: "Prière pour les défunts", sub: "Requiem aeternam…" },
      { slug: "de-profundis", label: "De profundis", sub: "Psaume 130" },
    ],
  },
  {
    id: "latin",
    label: "Prières en latin",
    icon: "✝",
    prayers: [
      { slug: "pater-noster", label: "Pater Noster", sub: "Notre Père en latin" },
      { slug: "ave-maria-latin", label: "Ave Maria", sub: "Je vous salue Marie en latin" },
      { slug: "salve-regina", label: "Salve Regina", sub: "Reine des cieux" },
      { slug: "memorare", label: "Memorare", sub: "Souviens-toi, ô très pieuse Vierge…" },
    ],
  },
  {
    id: "marie",
    label: "Prières à Marie",
    icon: "☽",
    prayers: [
      { slug: "memorare", label: "Memorare", sub: "Souviens-toi, ô Marie…" },
      { slug: "je-vous-salue-reine", label: "Je vous salue, Reine", sub: "Salve Regina" },
      { slug: "magnificat", label: "Magnificat", sub: "Le cantique de Marie" },
    ],
  },
  {
    id: "autres",
    label: "Autres prières",
    icon: "◎",
    prayers: [
      { slug: "acte-de-foi", label: "Acte d'espérance", sub: "Espérance chrétienne" },
      { slug: "priere-saint-francois", label: "Prière de saint François", sub: "Seigneur, faites de moi…" },
      { slug: "chapelet", label: "Prier le Chapelet", sub: "Guide guidé · 4 mystères", isLink: "/dashboard/spiritual/chapelet" },
    ],
  },
];

// ─── localStorage rosary ──────────────────────────────────────────────────────
const STORAGE_KEY = "fraternitas_rosary_v2";
interface RosaryProgress { mysteryType: string; decadeIndex: number; grainIndex: number }
const MYSTERY_LABELS: Record<string, string> = {
  joyeux: "Mystères Joyeux", lumineux: "Mystères Lumineux",
  douloureux: "Mystères Douloureux", glorieux: "Mystères Glorieux",
};
function getRosaryProgress(): RosaryProgress | null {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}

// ─── Composants ───────────────────────────────────────────────────────────────
function Skel({ w = "100%", h = "13px", r = "6px" }: { w?: string; h?: string; r?: string }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "rgba(17,16,9,0.09)", animation: "sk 1.8s ease-in-out infinite", flexShrink: 0 }} />;
}

function CrossIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" stroke={C.gold} strokeWidth="1.3" />
      <line x1="14" y1="5" x2="14" y2="23" stroke={C.gold} strokeWidth="1.3" />
      <line x1="8" y1="11" x2="20" y2="11" stroke={C.gold} strokeWidth="1.3" />
    </svg>
  );
}

function Chev({ color = C.ink50 }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M6 4L10 8L6 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Séparateur section ───────────────────────────────────────────────────────
function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "4px 0" }}>
      <div style={{ flex: 1, height: "1px", background: "rgba(17,16,9,0.10)" }} />
      <span style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.ink35, fontFamily: C.sans }}>
        {label}
      </span>
      <div style={{ flex: 1, height: "1px", background: "rgba(17,16,9,0.10)" }} />
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function PrionsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("jour");
  const [data, setData] = useState<SpiritualData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rosary, setRosary] = useState<RosaryProgress | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>("quotidiennes");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/spiritual");
      if (res.ok) setData(await res.json());
    } catch { /* silencieux */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setRosary(getRosaryProgress()); }, []);

  const rosaryPercent = rosary
    ? Math.round(((rosary.decadeIndex * 10 + Math.max(0, rosary.grainIndex + 1)) / 50) * 100)
    : 0;

  const TABS = [
    { key: "jour" as Tab, label: "Du jour" },
    { key: "chapelet" as Tab, label: "Chapelet" },
    { key: "prieres" as Tab, label: "Prières" },
  ];

  // Nettoyage texte évangile
  const gospelText = data?.gospel?.text ? stripHtml(data.gospel.text) : "";
  const gospelPreview = gospelText.split("\n\n")[0]?.slice(0, 160) || "";

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes sk { 0%,100%{opacity:.4} 50%{opacity:.9} }
        @keyframes fu { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .fu { animation: fu .45s cubic-bezier(.16,1,.3,1) both; }
        .row-hover:hover { background: rgba(17,16,9,0.03) !important; }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(242,235,224,0.95)", backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${C.ink12}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 8px" }}>
          <button onClick={() => router.back()} style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            fontSize: "12px", color: C.ink50, fontFamily: C.sans,
            display: "flex", alignItems: "center", gap: "4px",
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Accueil
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CrossIcon size={16} />
            <span style={{ fontFamily: C.serif, fontSize: "18px", fontWeight: 400, color: C.ink }}>Prions</span>
          </div>

          {/* Date liturgique */}
          {data && !loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{
                width: "7px", height: "7px", borderRadius: "50%",
                background: data.liturgicalInfo.color === "white" ? "transparent" : data.liturgicalInfo.colorHex,
                border: data.liturgicalInfo.color === "white" ? `1.5px solid ${data.liturgicalInfo.colorHex}` : "none",
              }} />
            </div>
          ) : <div style={{ width: "20px" }} />}
        </div>

        {/* Onglets */}
        <div style={{ display: "flex", borderTop: `1px solid ${C.ink12}` }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: "9px 4px", textAlign: "center",
              fontSize: "13px", fontWeight: tab === t.key ? 500 : 400,
              color: tab === t.key ? C.ink : C.ink50,
              background: "none", border: "none", cursor: "pointer",
              borderBottom: `2px solid ${tab === t.key ? C.gold : "transparent"}`,
              transition: "all .15s", fontFamily: C.sans,
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: "600px", margin: "0 auto", padding: "16px 14px 80px" }}>

        {/* ══════════════════ ONGLET DU JOUR ══════════════════ */}
        {tab === "jour" && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "0" }}>

            {/* ── ÉVANGILE ── */}
            <div style={{ marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", paddingLeft: "2px" }}>
                <span style={{ fontSize: "10px", color: C.gold }}>✦</span>
                <span style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.ink50 }}>
                  Évangile du jour
                </span>
                {data?.gospel?.reference && (
                  <span style={{ fontSize: "10px", color: C.gold, fontWeight: 500, marginLeft: "auto" }}>
                    {data.gospel.reference}
                  </span>
                )}
              </div>

              <div style={{
                background: C.card, borderRadius: "16px",
                border: `1.5px solid ${C.cardBorder}`,
                overflow: "hidden",
              }}>
                {loading ? (
                  <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "9px" }}>
                    <Skel w="60%" h="10px" />
                    <Skel w="90%" h="18px" />
                    <Skel w="75%" h="14px" />
                    <Skel w="40%" h="10px" />
                  </div>
                ) : data?.gospel ? (
                  <div style={{ padding: "16px" }}>
                    {data.gospel.title && (
                      <p style={{
                        fontFamily: C.serif, fontSize: "15px", fontWeight: 400, fontStyle: "italic",
                        color: C.ink65, marginBottom: "10px", lineHeight: 1.4,
                      }}>
                        « {stripHtml(data.gospel.title)} »
                      </p>
                    )}
                    <p style={{
                      fontFamily: C.serif, fontSize: "18px", fontWeight: 300, fontStyle: "italic",
                      color: C.ink80, lineHeight: 1.65, marginBottom: "14px",
                    }}>
                      {gospelPreview}{gospelText.length > 160 ? "…" : ""}
                    </p>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      paddingTop: "12px", borderTop: `1px solid ${C.ink12}`,
                    }}>
                      <span style={{ fontSize: "11px", color: C.ink50, fontWeight: 300 }}>
                        {stripHtml(data.gospel.intro)}
                      </span>
                      <a href={data.gospel.aelfUrl} target="_blank" rel="noopener noreferrer" style={{
                        fontSize: "12px", color: C.gold, fontWeight: 500,
                        textDecoration: "none", display: "flex", alignItems: "center", gap: "3px",
                      }}>
                        Lire <Chev color={C.gold} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "16px" }}>
                    <p style={{ fontSize: "13px", color: C.ink50, fontWeight: 300 }}>
                      {data?.error || "L'évangile du jour n'est pas disponible."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── SÉPARATEUR ── */}
            <div style={{ height: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "24px", height: "1px", background: C.gold, opacity: 0.4 }} />
            </div>

            {/* ── SAINT DU JOUR ── */}
            <div style={{ marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", paddingLeft: "2px" }}>
                <span style={{ fontSize: "10px", color: C.gold }}>☽</span>
                <span style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.ink50 }}>
                  Saint du jour
                </span>
              </div>

              {loading ? (
                <div style={{ background: C.cream, borderRadius: "16px", padding: "14px 16px", border: `1.5px solid ${C.goldBorder}`, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Skel w="50%" h="18px" />
                  <Skel w="25%" h="10px" />
                  <Skel w="90%" h="12px" />
                  <Skel w="75%" h="12px" />
                </div>
              ) : data?.saint ? (
                <div style={{
                  background: C.cream, borderRadius: "16px", padding: "14px 16px",
                  border: `1.5px solid ${C.goldBorder}`,
                }}>
                  <p style={{
                    fontFamily: C.serif, fontSize: "20px", fontWeight: 400,
                    color: C.ink, marginBottom: "3px", lineHeight: 1.2,
                  }}>
                    {data.saint.name}
                  </p>
                  {data.saint.dates && (
                    <p style={{ fontSize: "11px", fontWeight: 300, color: C.ink50, marginBottom: "10px" }}>
                      {data.saint.dates}
                    </p>
                  )}
                  <p style={{
                    fontFamily: C.serif, fontSize: "15px", fontWeight: 300,
                    color: C.ink65, lineHeight: 1.7, margin: 0,
                  }}>
                    {data.saint.description}
                  </p>
                </div>
              ) : null}
            </div>

            {/* ── SÉPARATEUR ── */}
            <div style={{ height: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "24px", height: "1px", background: C.gold, opacity: 0.4 }} />
            </div>

            {/* ── CITATION ── */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", paddingLeft: "2px" }}>
                <span style={{ fontSize: "10px", color: C.gold }}>◎</span>
                <span style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.ink50 }}>
                  Parole du jour
                </span>
              </div>

              {loading ? (
                <div style={{ background: C.card, borderRadius: "16px", padding: "16px", border: `1.5px solid ${C.cardBorder}`, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Skel w="80%" h="16px" /><Skel w="60%" h="16px" /><Skel w="40%" h="11px" />
                </div>
              ) : data?.quote ? (
                <div style={{
                  background: "#111009", borderRadius: "16px", padding: "18px 18px",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", top: "8px", left: "16px",
                    fontFamily: C.serif, fontSize: "64px", lineHeight: 1,
                    color: "rgba(184,137,58,0.12)", pointerEvents: "none", userSelect: "none",
                  }}>«</div>
                  <p style={{
                    fontFamily: C.serif, fontSize: "19px", fontWeight: 300, fontStyle: "italic",
                    color: "#F5EFE4", lineHeight: 1.65, marginBottom: "12px",
                    position: "relative", zIndex: 1,
                  }}>
                    « {data.quote.text} »
                  </p>
                  <p style={{ fontSize: "12px", fontWeight: 400, color: "rgba(184,137,58,0.7)", position: "relative", zIndex: 1 }}>
                    — {data.quote.author}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ══════════════════ ONGLET CHAPELET ══════════════════ */}
        {tab === "chapelet" && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* État du jour */}
            <div style={{
              background: C.card, borderRadius: "16px", padding: "14px 16px",
              border: `1.5px solid ${C.cardBorder}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <p style={{ fontSize: "14px", fontWeight: 500, color: C.ink, margin: 0 }}>
                  {rosary ? `${MYSTERY_LABELS[rosary.mysteryType]}` : "Pas encore commencé aujourd'hui"}
                </p>
                {rosaryPercent > 0 && (
                  <span style={{ fontSize: "13px", color: C.gold, fontWeight: 500 }}>{rosaryPercent}%</span>
                )}
              </div>
              {rosary && (
                <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} style={{
                      flex: 1, height: "3px", borderRadius: "99px",
                      background: i < rosary.decadeIndex ? C.ink : i === rosary.decadeIndex ? C.gold : C.ink12,
                      opacity: i < rosary.decadeIndex ? 0.65 : i === rosary.decadeIndex ? 0.7 : 1,
                    }} />
                  ))}
                </div>
              )}
              {rosary && (
                <p style={{ fontSize: "11px", color: C.ink50, fontWeight: 300, margin: 0 }}>
                  Dizaine {rosary.decadeIndex + 1}/5 en cours
                </p>
              )}
            </div>

            {/* Bouton principal */}
            <Link href="/dashboard/spiritual/chapelet" style={{ textDecoration: "none" }}>
              <div style={{
                background: "#111009", borderRadius: "16px", padding: "16px 20px",
                textAlign: "center", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}>
                <CrossIcon size={16} />
                <p style={{ fontSize: "15px", fontWeight: 500, color: "#F5EFE4", margin: 0, fontFamily: C.sans }}>
                  {rosary ? "Reprendre le chapelet" : "Commencer le chapelet"} →
                </p>
              </div>
            </Link>

            {/* Info chapelet */}
            <div style={{ padding: "4px 2px" }}>
              <p style={{ fontSize: "12px", fontWeight: 300, color: C.ink50, lineHeight: 1.6, margin: 0, textAlign: "center" }}>
                Prière de Fatima · Mystères guidés · Grains tactiles<br />
                Sauvegarde automatique si vous interrompez
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════ ONGLET PRIÈRES ══════════════════ */}
        {tab === "prieres" && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

            <div style={{ marginBottom: "6px" }}>
              <p style={{ fontFamily: C.serif, fontSize: "22px", fontWeight: 300, color: C.ink, marginBottom: "3px" }}>Prières</p>
              <p style={{ fontSize: "12px", fontWeight: 300, color: C.ink50, lineHeight: 1.55 }}>
                La tradition catholique à portée de main.
              </p>
            </div>

            {PRAYER_CATEGORIES.map(cat => (
              <div key={cat.id} style={{
                background: C.card, borderRadius: "16px",
                border: `1.5px solid ${C.cardBorder}`,
                overflow: "hidden",
              }}>
                {/* En-tête catégorie */}
                <button
                  onClick={() => setOpenCategory(openCategory === cat.id ? null : cat.id)}
                  style={{
                    width: "100%", background: "none", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "13px 16px", fontFamily: C.sans,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "13px", color: C.gold }}>{cat.icon}</span>
                    <span style={{ fontSize: "14px", fontWeight: 500, color: C.ink }}>{cat.label}</span>
                  </div>
                  <span style={{
                    fontSize: "16px", color: C.ink50,
                    transform: openCategory === cat.id ? "rotate(90deg)" : "none",
                    transition: "transform .2s", display: "block",
                  }}>›</span>
                </button>

                {/* Prières de la catégorie */}
                {openCategory === cat.id && (
                  <div style={{ borderTop: `1px solid ${C.ink12}` }}>
                    {cat.prayers.map((prayer, i) => {
                      const href = (prayer as { isLink?: string }).isLink || `/dashboard/spiritual/prieres/${prayer.slug}`;
                      return (
                        <Link key={prayer.slug + i} href={href} style={{ textDecoration: "none", display: "block" }}>
                          <div className="row-hover" style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "12px 16px",
                            borderBottom: i < cat.prayers.length - 1 ? `1px solid ${C.ink12}` : "none",
                            background: "transparent", transition: "background .15s",
                          }}>
                            <div>
                              <p style={{ fontSize: "14px", fontWeight: 500, color: C.ink, margin: "0 0 1px" }}>
                                {prayer.label}
                              </p>
                              <p style={{ fontSize: "11px", fontWeight: 300, color: C.ink50, margin: 0 }}>
                                {prayer.sub}
                              </p>
                            </div>
                            <Chev />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

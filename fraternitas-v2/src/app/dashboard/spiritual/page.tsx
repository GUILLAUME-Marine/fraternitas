"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SpiritualData {
  date: string;
  liturgicalInfo: { label: string; season: string; week: string; color: string; colorHex: string };
  gospel: { reference: string; title: string; intro: string; text: string; aelfUrl: string } | null;
  saint: { name: string; dates: string; description: string };
  quote: { text: string; author: string };
  error?: string;
}

type Tab = "jour" | "chapelet" | "prieres";

const C = {
  bg: "#F2EBE0", card: "#FFFFFF", cardBorder: "rgba(17,16,9,0.10)",
  cream: "#E8DDD0", creamGold: "#F5EDE0", gold: "#B8893A",
  goldBorder: "rgba(184,137,58,0.35)", ink: "#111009",
  ink80: "rgba(17,16,9,0.80)", ink65: "rgba(17,16,9,0.65)",
  ink50: "rgba(17,16,9,0.50)", ink35: "rgba(17,16,9,0.35)", ink12: "rgba(17,16,9,0.12)",
  serif: "'Cormorant Garamond','Playfair Display',Georgia,serif",
  sans: "'DM Sans',system-ui,sans-serif",
};

function stripHtml(str: string): string {
  return str
    .replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<[^>]+>/g, "")
    .replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'").replace(/&ldquo;/g, "«")
    .replace(/&rdquo;/g, "»").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ")
    .replace(/&eacute;/g, "é").replace(/&egrave;/g, "è").replace(/&agrave;/g, "à")
    .replace(/&#[0-9]+;/g, "").replace(/&[a-z]+;/g, " ")
    .replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function getEvangelist(intro: string): string {
  const m = intro.match(/selon\s+saint\s+([A-Za-z\u00C0-\u017E]+)/i);
  if (m) return `Évangile selon saint ${m[1]}`;
  const m2 = intro.match(/selon\s+([A-Za-z\u00C0-\u017E\s]+)/i);
  if (m2) return `Évangile selon ${m2[1].trim()}`;
  return "Évangile du jour";
}

// Heure du jour → salutation contextuelle
function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bonjour.";
  if (h >= 12 && h < 14) return "Midi. L'Angélus sonne.";
  if (h >= 14 && h < 18) return "Bonne après-midi.";
  if (h >= 18 && h < 21) return "Ce soir.";
  return "Bonne nuit.";
}

const PRAYER_CATEGORIES = [
  {
    id: "matin", label: "Ce matin", icon: "☀",
    desc: "Offrir sa journée avant qu'elle commence.",
    prayers: [
      { slug: "matin-offre", label: "Je vous offre, Seigneur", sub: "Offrir sa journée à Dieu" },
      { slug: "angelus", label: "L'Angélus", sub: "6h · 12h · 18h" },
      { slug: "acte-de-foi", label: "Acte de foi", sub: "Actus Fidei" },
      { slug: "acte-esperance", label: "Acte d'espérance", sub: "Confiance en Dieu" },
      { slug: "acte-charite", label: "Acte de charité", sub: "Amour de Dieu et du prochain" },
    ],
  },
  {
    id: "benedicite", label: "Avant de manger", icon: "🍞",
    desc: "Bénir ce qui vient d'une main invisible.",
    prayers: [
      { slug: "benedicite-court", label: "Bénédicité bref", sub: "Bénissez-nous, Seigneur…" },
      { slug: "benedicite-long", label: "Bénédicité complet", sub: "Oculi omnium in te sperant…" },
      { slug: "benedicite-famille", label: "En famille", sub: "Pour les repas avec enfants" },
    ],
  },
  {
    id: "graces", label: "Après le repas", icon: "🙏",
    desc: "Rendre grâce pour ce qu'on vient de recevoir.",
    prayers: [
      { slug: "grace-apres-repas", label: "Action de grâces", sub: "Nous vous rendons grâces…" },
    ],
  },
  {
    id: "soir", label: "Ce soir", icon: "🌙",
    desc: "Faire le point et remettre sa nuit à Dieu.",
    prayers: [
      { slug: "examen-soir", label: "Examen de conscience", sub: "Regarder sa journée avec Dieu" },
      { slug: "acte-de-contrition", label: "Acte de contrition", sub: "Actus Contritionis" },
      { slug: "salve-regina", label: "Salve Regina", sub: "Dernière prière du soir" },
      { slug: "complies", label: "Complies", sub: "Prière du soir de l'Église" },
    ],
  },
  {
    id: "epreuve", label: "Dans l'épreuve", icon: "🕯",
    desc: "Quand les mots manquent, l'Église a prié avant vous.",
    prayers: [
      { slug: "pour-les-defunts", label: "Pour les défunts", sub: "Requiem aeternam…" },
      { slug: "de-profundis", label: "De profundis", sub: "Psaume 130" },
      { slug: "memorare", label: "Memorare", sub: "Souviens-toi, ô très pieuse Vierge…" },
      { slug: "maladie", label: "Dans la maladie", sub: "Pour soi ou un proche" },
    ],
  },
  {
    id: "marie", label: "Avec Marie", icon: "☽",
    desc: "Se confier à celle qui a dit oui.",
    prayers: [
      { slug: "je-vous-salue-marie", label: "Je vous salue Marie", sub: "Ave Maria" },
      { slug: "magnificat", label: "Magnificat", sub: "Le cantique de Marie" },
      { slug: "salve-regina", label: "Salve Regina", sub: "Je vous salue, Reine" },
    ],
  },
  {
    id: "chemin", label: "En chemin", icon: "✈",
    desc: "Pour les décisions, les voyages, les débuts.",
    prayers: [
      { slug: "avant-examen", label: "Avant un examen", sub: "Confier son effort à Dieu" },
      { slug: "voyageur", label: "Prière du voyageur", sub: "Saint Christophe" },
      { slug: "decision", label: "Avant une décision", sub: "Veni Sancte Spiritus" },
      { slug: "mariage", label: "Pour un mariage", sub: "Pour les époux" },
    ],
  },
];

// STORAGE_KEY v3 — cohérent avec chapelet/page.tsx
const STORAGE_KEY = "fraternitas_rosary_v3";
interface RosaryProgress { mysteryType: string; decadeIndex: number; grainIndex: number }
const MYSTERY_LABELS: Record<string, string> = {
  joyeux: "Mystères Joyeux", lumineux: "Mystères Lumineux",
  douloureux: "Mystères Douloureux", glorieux: "Mystères Glorieux",
};
function getRosaryProgress(): RosaryProgress | null {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}

function Skel({ w = "100%", h = "13px", r = "6px" }: { w?: string; h?: string; r?: string }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "rgba(17,16,9,0.09)", animation: "sk 1.8s ease-in-out infinite", flexShrink: 0 }} />;
}
function CrossIcon({ size = 14, color = C.gold }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" stroke={color} strokeWidth="1.3" />
      <line x1="14" y1="5" x2="14" y2="23" stroke={color} strokeWidth="1.3" />
      <line x1="8" y1="11" x2="20" y2="11" stroke={color} strokeWidth="1.3" />
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

export default function PrionsPage() {
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("jour");
  const [data, setData] = useState<SpiritualData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rosary, setRosary] = useState<RosaryProgress | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [gospelOpen, setGospelOpen] = useState(false);
  const [tabKey, setTabKey] = useState(0); // pour forcer la ré-animation au changement d'onglet

  useEffect(() => {
    const readHash = () => {
      const h = window.location.hash.replace("#", "") as Tab;
      if (h === "chapelet" || h === "prieres" || h === "jour") {
        setTab(h);
        setTabKey(k => k + 1);
      }
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

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

  const switchTab = (t: Tab) => {
    setTab(t);
    setTabKey(k => k + 1);
    window.history.replaceState(null, "", `#${t}`);
    window.scrollTo(0, 0);
  };

  const rosaryPercent = rosary
    ? Math.round(((rosary.decadeIndex * 10 + Math.max(0, rosary.grainIndex + 1)) / 50) * 100)
    : 0;

  const TABS = [
    { key: "jour" as Tab, label: "Du jour" },
    { key: "chapelet" as Tab, label: "Chapelet" },
    { key: "prieres" as Tab, label: "Prières" },
  ];

  const gospelText = data?.gospel?.text ? stripHtml(data.gospel.text) : "";
  const gospelLines = gospelText.split("\n").filter(Boolean);
  const previewLines = gospelLines.slice(0, 4).join("\n");
  const restLines = gospelLines.slice(4).join("\n");

  const now = new Date();
  const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const monthNames = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const dateLabel = `${dayNames[now.getDay()]} ${now.getDate()} ${monthNames[now.getMonth()]}`;
  const todayShort = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][now.getDay()];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes sk { 0%,100%{opacity:.4} 50%{opacity:.9} }
        @keyframes fu { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .fu { animation: fu .45s cubic-bezier(.16,1,.3,1) both; }
        .rh:hover { background: rgba(17,16,9,0.04) !important; }
        .tab-btn { transition: all .15s; }
        .tab-btn:active { opacity: 0.75; }

        /* ── Responsive desktop ── */
        @media (min-width: 768px) {
          .page-inner { max-width: 780px !important; padding: 20px 24px 80px !important; }
          .deux-col { display: grid !important; grid-template-columns: 1fr 340px; gap: 16px; align-items: start; }
          .col-droite { display: flex !important; flex-direction: column; gap: 10px; }
          .tab-header { max-width: 780px; margin: 0 auto; padding: 0 8px; }
          .date-label { font-size: 20px !important; }
          .date-week  { font-size: 12px !important; }
          .gospel-titre { font-size: 22px !important; }
          .gospel-texte { font-size: 16px !important; }
          .saint-nom    { font-size: 20px !important; }
        }
        @media (min-width: 1100px) {
          .page-inner { max-width: 900px !important; }
          .deux-col { grid-template-columns: 1fr 380px; }
        }
      `}</style>

      {/* ══ HEADER ══ */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "linear-gradient(180deg, #D4A83A 0%, #C49A3C 55%, #B8893A 100%)",
        borderBottom: "1.5px solid #8A6520",
        boxShadow: "0 2px 8px rgba(139,101,32,0.20)",
      }}>
        <div className="tab-header" style={{ display: "flex", maxWidth: "600px", margin: "0 auto" }}>
          {TABS.map(t => (
            <button key={t.key} className="tab-btn" onClick={() => switchTab(t.key)} style={{
              flex: 1, padding: "13px 4px 11px", textAlign: "center",
              fontSize: "13px", fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? "#fff" : "rgba(255,255,255,0.55)",
              background: "none", border: "none", cursor: "pointer",
              borderBottom: `3px solid ${tab === t.key ? "#fff" : "transparent"}`,
              fontFamily: C.sans, letterSpacing: "0.01em",
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="page-inner" style={{ maxWidth: "600px", margin: "0 auto", padding: "14px 14px 60px" }}>

        {/* ════ DU JOUR ════ */}
        {tab === "jour" && (
          <div key={`jour-${tabKey}`} className="fu" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

            {/* ── FIX BUG 1 : Bandeau date — typographie seule, sans fond opaque ── */}
            <div style={{
              padding: "6px 4px 2px",
              display: "flex", alignItems: "baseline", justifyContent: "space-between",
              flexWrap: "wrap", gap: "4px",
            }}>
              <span className="date-label" style={{
                fontFamily: C.serif, fontSize: "18px", fontWeight: 300,
                color: C.ink, lineHeight: 1.2,
              }}>
                {dateLabel}
              </span>
              {!loading && data?.liturgicalInfo?.week ? (
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{
                    width: "5px", height: "5px", borderRadius: "50%",
                    background: data.liturgicalInfo.color === "white" ? "transparent" : data.liturgicalInfo.colorHex,
                    border: data.liturgicalInfo.color === "white" ? "1.5px solid rgba(184,137,58,0.60)" : "none",
                    flexShrink: 0,
                  }} />
                  <span className="date-week" style={{
                    fontFamily: C.sans, fontSize: "11px", fontWeight: 500,
                    color: C.gold, letterSpacing: "0.03em",
                  }}>
                    {data.liturgicalInfo.week}
                  </span>
                </div>
              ) : null}
            </div>

            {/* ── Layout 2 colonnes sur desktop ── */}
            <div className="deux-col" style={{ display: "contents" }}>

              {/* Colonne gauche — citation + évangile */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

                {/* ── Citation du jour ── */}
                {loading ? (
                  <div style={{ background: "#111009", borderRadius: "14px", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Skel w="85%" h="16px" r="4px" /><Skel w="60%" h="14px" r="4px" /><Skel w="35%" h="10px" r="4px" />
                  </div>
                ) : data?.quote ? (
                  <div style={{ background: "#111009", borderRadius: "14px", padding: "16px 18px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: "4px", left: "12px", fontFamily: C.serif, fontSize: "52px", lineHeight: 1, color: "rgba(184,137,58,0.12)", pointerEvents: "none", userSelect: "none" }}>«</div>
                    <p style={{ fontFamily: C.serif, fontSize: "17px", fontWeight: 300, fontStyle: "italic", color: "#F5EFE4", lineHeight: 1.55, marginBottom: "8px", position: "relative", zIndex: 1 }}>
                      {data.quote.text}
                    </p>
                    <p style={{ fontSize: "11px", fontWeight: 500, color: "rgba(196,154,60,0.80)", position: "relative", zIndex: 1, fontFamily: C.sans }}>
                      — {data.quote.author}
                    </p>
                  </div>
                ) : null}

                {/* ── Évangile du jour ── */}
                <div style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, overflow: "hidden" }}>
                  {loading ? (
                    <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <Skel w="65%" h="20px" r="4px" /><Skel w="30%" h="11px" /><Skel w="90%" h="14px" /><Skel w="75%" h="14px" />
                    </div>
                  ) : data?.gospel ? (
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
                        <span className="gospel-titre" style={{ fontFamily: C.serif, fontSize: "20px", fontWeight: 400, color: C.ink, lineHeight: 1.2 }}>
                          {getEvangelist(data.gospel.intro)}
                        </span>
                        {data.gospel.reference && (
                          <span style={{ fontSize: "12px", fontWeight: 300, color: C.gold, fontFamily: C.sans }}>
                            {data.gospel.reference}
                          </span>
                        )}
                      </div>
                      <p className="gospel-texte" style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, fontStyle: "italic", color: C.ink80, lineHeight: 1.52, whiteSpace: "pre-line", margin: 0 }}>
                        {previewLines}
                      </p>
                      {restLines && gospelOpen && (
                        <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, color: "rgba(17,16,9,0.74)", lineHeight: 1.52, whiteSpace: "pre-line", marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${C.ink12}` }}>
                          {restLines}
                        </p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", marginTop: "10px", borderTop: `1px solid ${C.ink12}` }}>
                        <a href={data.gospel.aelfUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: C.ink35, fontWeight: 300, textDecoration: "none", fontFamily: C.sans }}>
                          AELF →
                        </a>
                        {restLines ? (
                          <button onClick={() => setGospelOpen(v => !v)} style={{ fontSize: "12px", color: C.gold, fontWeight: 500, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "3px", fontFamily: C.sans }}>
                            {gospelOpen ? "Fermer" : "Lire la suite"} <Chev color={C.gold} />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "14px" }}>
                      <p style={{ fontSize: "13px", color: C.ink50, fontWeight: 300, fontFamily: C.sans }}>
                        {data?.error || "L'évangile du jour n'est pas disponible."}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Colonne droite (desktop) / suite (mobile) */}
              <div className="col-droite" style={{ display: "contents" }}>

                {/* ── Saint du jour ── */}
                {loading ? (
                  <div style={{ background: C.cream, borderRadius: "14px", padding: "12px 14px", border: `1.5px solid ${C.goldBorder}`, display: "flex", flexDirection: "column", gap: "7px", marginTop: "10px" }}>
                    <Skel w="50%" h="16px" /><Skel w="25%" h="10px" /><Skel w="90%" h="12px" />
                  </div>
                ) : data?.saint ? (
                  <div style={{ background: C.cream, borderRadius: "14px", padding: "12px 14px", border: `1.5px solid ${C.goldBorder}`, marginTop: "10px" }}>
                    <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.gold, fontFamily: C.sans, marginBottom: "5px" }}>Saint du jour</p>
                    <p className="saint-nom" style={{ fontFamily: C.serif, fontSize: "18px", fontWeight: 400, color: C.ink, marginBottom: "2px", lineHeight: 1.2 }}>{data.saint.name}</p>
                    {data.saint.dates && <p style={{ fontSize: "11px", fontWeight: 300, color: C.ink50, marginBottom: "7px", fontFamily: C.sans }}>{data.saint.dates}</p>}
                    <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, color: C.ink65, lineHeight: 1.55, margin: 0 }}>{data.saint.description}</p>
                  </div>
                ) : null}

              </div>
            </div>
          </div>
        )}

        {/* ════ CHAPELET ════ */}
        {tab === "chapelet" && (
          <div key={`chapelet-${tabKey}`} className="fu" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

            {/* ── FIX BUG 2 : Carte mystère — textes lisibles ── */}
            <div style={{
              background: "linear-gradient(135deg,#1A1410 0%,#2C1E08 100%)",
              borderRadius: "16px", border: "1.5px solid rgba(196,154,60,0.22)",
              padding: "18px", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
                  <circle cx="90" cy="90" r="80" stroke="#C49A3C" strokeWidth="0.5" opacity="0.10" />
                  <circle cx="90" cy="90" r="58" stroke="#C49A3C" strokeWidth="0.4" opacity="0.07" />
                </svg>
              </div>
              <div style={{ position: "relative", zIndex: 1 }}>
                {/* FIX : opacité 0.70 → 0.85 minimum sur texte secondaire */}
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(196,154,60,0.85)", fontFamily: C.sans, marginBottom: "5px" }}>
                  Mystère du jour · {todayShort}
                </p>
                <p style={{ fontFamily: C.serif, fontSize: "21px", fontWeight: 300, color: "#F5EFE4", lineHeight: 1.15, marginBottom: "6px" }}>
                  {rosary ? MYSTERY_LABELS[rosary.mysteryType] : "Mystères du jour"}
                </p>
                {/* FIX : opacité 0.38 → 0.72 */}
                <p style={{ fontFamily: C.serif, fontSize: "13px", fontWeight: 300, fontStyle: "italic", color: "rgba(245,239,228,0.72)", lineHeight: 1.4, margin: 0 }}>
                  Cinq mystères à contempler avec Marie
                </p>
              </div>
            </div>

            {/* ── FIX BUG 9 : Affichage conditionnel strict ── */}
            {rosary ? (
              /* Si en cours → carte reprise uniquement, pas de formulaire */
              <div style={{ background: C.card, borderRadius: "14px", padding: "14px", border: "1.5px solid rgba(196,154,60,0.35)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: C.ink, margin: "0 0 2px", fontFamily: C.sans }}>{MYSTERY_LABELS[rosary.mysteryType]}</p>
                    <p style={{ fontSize: "12px", fontWeight: 300, color: C.ink50, margin: 0, fontFamily: C.sans }}>Dizaine {rosary.decadeIndex + 1} · {rosaryPercent}%</p>
                  </div>
                  <span style={{ fontSize: "22px", fontWeight: 300, color: "#C49A3C", fontFamily: C.serif }}>{rosaryPercent}%</span>
                </div>
                <div style={{ display: "flex", gap: "3px", marginBottom: "12px" }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} style={{ flex: 1, height: "4px", borderRadius: "99px", background: i < rosary.decadeIndex ? "#1A1410" : i === rosary.decadeIndex ? "#C49A3C" : C.ink12 }} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Link href="/dashboard/spiritual/chapelet?resume=1" style={{ textDecoration: "none", flex: 2 }}>
                    <button style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "#C49A3C", border: "none", color: "#1A1410", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: C.sans }}>
                      Reprendre →
                    </button>
                  </Link>
                  <button onClick={() => { try { localStorage.removeItem(STORAGE_KEY); } catch {} setRosary(null); }} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: `1.5px solid ${C.ink12}`, background: "none", fontSize: "12px", color: C.ink50, cursor: "pointer", fontFamily: C.sans }}>
                    Effacer
                  </button>
                </div>
              </div>
            ) : (
              /* Si pas en cours → bouton commencer uniquement */
              <Link href="/dashboard/spiritual/chapelet" style={{ textDecoration: "none" }}>
                <button style={{ width: "100%", padding: "15px", background: "#C49A3C", border: "none", borderRadius: "14px", color: "#1A1410", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: C.sans, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <CrossIcon size={15} color="#1A1410" />
                  Commencer le chapelet →
                </button>
              </Link>
            )}

            {/* Pourquoi */}
            <div style={{ background: C.card, borderRadius: "13px", border: `1.5px solid ${C.cardBorder}`, padding: "13px 16px" }}>
              <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.50, marginBottom: "4px" }}>
                « Le chapelet est l&apos;arme de notre temps. »
              </p>
              <p style={{ fontSize: "11px", fontWeight: 400, color: C.ink50, fontFamily: C.sans, marginBottom: "8px" }}>— Saint Jean-Paul II</p>
              <Link href="/dashboard/spiritual/chapelet?pourquoi=1" style={{ fontSize: "12px", fontWeight: 500, color: C.gold, textDecoration: "none", display: "flex", alignItems: "center", gap: "3px", fontFamily: C.sans }}>
                Pourquoi prier le chapelet <Chev color={C.gold} />
              </Link>
            </div>

            <p style={{ fontSize: "10px", fontWeight: 300, color: C.ink35, textAlign: "center", fontFamily: C.sans }}>
              Progression sauvegardée automatiquement
            </p>
          </div>
        )}

        {/* ════ PRIÈRES ════ */}
        {tab === "prieres" && (
          <div key={`prieres-${tabKey}`} className="fu" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ marginBottom: "2px" }}>
              <p style={{ fontFamily: C.serif, fontSize: "22px", fontWeight: 300, color: C.ink, margin: "0 0 2px" }}>Prières</p>
              <p style={{ fontFamily: C.sans, fontSize: "12px", fontWeight: 300, color: C.ink50, margin: 0 }}>{getGreeting()}</p>
            </div>

            {/* Card parcours */}
            <div onClick={() => router.push("/dashboard/spiritual/parcours")} style={{ background: "linear-gradient(135deg,#1A1410 0%,#2C1E08 100%)", borderRadius: "16px", border: "1.5px solid rgba(196,154,60,0.30)", padding: "16px", cursor: "pointer", marginBottom: "4px" }}>
              <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(196,154,60,0.80)", fontFamily: C.sans, marginBottom: "5px" }}>Nouveau ici ?</p>
              <p style={{ fontFamily: C.serif, fontSize: "19px", fontWeight: 300, color: "#F5EFE4", marginBottom: "3px", lineHeight: 1.25 }}>Commencer à prier.</p>
              <p style={{ fontSize: "12px", fontWeight: 300, color: "rgba(245,239,228,0.70)", fontFamily: C.sans, marginBottom: "10px", lineHeight: 1.5 }}>Un parcours guidé · 5 minutes.</p>
              <span style={{ display: "inline-flex", alignItems: "center", background: "#C49A3C", borderRadius: "99px", padding: "6px 14px", fontSize: "12px", fontWeight: 600, color: "#1A1410", fontFamily: C.sans }}>Je commence →</span>
            </div>

            {/* Accordéons */}
            {PRAYER_CATEGORIES.map(cat => (
              <div key={cat.id} style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, overflow: "hidden" }}>
                <button onClick={() => setOpenCategory(openCategory === cat.id ? null : cat.id)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", fontFamily: C.sans }}>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <span style={{ fontSize: "14px", color: C.gold }}>{cat.icon}</span>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: C.ink }}>{cat.label}</span>
                    </div>
                    <p style={{ fontSize: "11px", fontWeight: 300, fontStyle: "italic", color: C.ink50, margin: "2px 0 0 21px", fontFamily: C.serif }}>{cat.desc}</p>
                  </div>
                  <span style={{ fontSize: "18px", color: C.ink35, transform: openCategory === cat.id ? "rotate(90deg)" : "none", transition: "transform .2s", flexShrink: 0, marginLeft: "8px" }}>›</span>
                </button>
                {openCategory === cat.id && (
                  <div style={{ borderTop: `1px solid ${C.ink12}` }}>
                    {cat.prayers.map((prayer, i) => (
                      <Link key={prayer.slug + i} href={`/dashboard/spiritual/prieres/${prayer.slug}`} style={{ textDecoration: "none", display: "block" }}>
                        <div className="rh" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: i < cat.prayers.length - 1 ? `1px solid ${C.ink12}` : "none", background: "transparent", transition: "background .12s" }}>
                          <div>
                            <p style={{ fontSize: "14px", fontWeight: 500, color: C.ink, margin: "0 0 1px", fontFamily: C.sans }}>{prayer.label}</p>
                            <p style={{ fontSize: "11px", fontWeight: 300, color: C.ink50, margin: 0, fontFamily: C.sans }}>{prayer.sub}</p>
                          </div>
                          <Chev />
                        </div>
                      </Link>
                    ))}
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

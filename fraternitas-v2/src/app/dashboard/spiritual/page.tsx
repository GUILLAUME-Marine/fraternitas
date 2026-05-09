"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

const C = {
  bg: "#F2EBE0",
  card: "#FFFFFF",
  cardBorder: "rgba(17,16,9,0.10)",
  cream: "#E8DDD0",
  creamGold: "#F5EDE0",
  gold: "#B8893A",
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

function stripHtml(str: string): string {
  return str
    .replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<[^>]+>/g, "")
    .replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'").replace(/&ldquo;/g, "«")
    .replace(/&rdquo;/g, "»").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ")
    .replace(/&eacute;/g, "é").replace(/&egrave;/g, "è").replace(/&agrave;/g, "à")
    .replace(/&#[0-9]+;/g, "").replace(/&[a-z]+;/g, " ")
    .replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

// ─── Catégories corrigées selon la demande ────────────────────────────────────
const PRAYER_CATEGORIES = [
  {
    id: "matin",
    label: "Ce matin",
    icon: "☀",
    desc: "Offrir sa journée avant qu'elle commence.",
    prayers: [
      { slug: "notre-pere", label: "Notre Père", sub: "La prière du Seigneur" },
      { slug: "je-vous-salue-marie", label: "Je vous salue Marie", sub: "Ave Maria" },
      { slug: "acte-de-foi", label: "Acte de foi", sub: "Profession de foi personnelle" },
      { slug: "angelus", label: "L'Angélus", sub: "6h · 12h · 18h" },
      { slug: "gloire-au-pere", label: "Gloire au Père", sub: "Doxologie trinitaire" },
    ],
  },
  {
    id: "repas",
    label: "Avant le repas",
    icon: "🍞",
    desc: "Bénir ce qui vient d'une main invisible.",
    prayers: [
      { slug: "avant-le-repas", label: "Bénédicité", sub: "Bénissez-nous, Seigneur…" },
      { slug: "grace-apres-repas", label: "Grâces après le repas", sub: "Action de grâces" },
    ],
  },
  {
    id: "soir",
    label: "Ce soir",
    icon: "🌙",
    desc: "Faire le point et remettre sa nuit à Dieu.",
    prayers: [
      { slug: "acte-de-contrition", label: "Acte de contrition", sub: "Repentance et pardon" },
      { slug: "salve-regina", label: "Salve Regina", sub: "Reine des cieux" },
    ],
  },
  {
    id: "marie",
    label: "Avec Marie",
    icon: "☽",
    desc: "Se confier à celle qui a dit oui.",
    prayers: [
      { slug: "je-vous-salue-marie", label: "Je vous salue Marie", sub: "Ave Maria" },
      { slug: "memorare", label: "Memorare", sub: "Souviens-toi, ô Marie…" },
      { slug: "magnificat", label: "Magnificat", sub: "Le cantique de Marie" },
      { slug: "je-vous-salue-reine", label: "Salve Regina", sub: "Je vous salue, Reine" },
    ],
  },
  {
    id: "morts",
    label: "Pour nos défunts",
    icon: "🕯",
    desc: "Prier pour ceux qui nous ont précédés.",
    prayers: [
      { slug: "pour-les-defunts", label: "Pour les défunts", sub: "Requiem aeternam…" },
      { slug: "de-profundis", label: "De profundis", sub: "Psaume 130" },
    ],
  },
  {
    id: "latin",
    label: "En latin",
    icon: "✝",
    desc: "La tradition romaine millénaire.",
    prayers: [
      { slug: "pater-noster", label: "Pater Noster", sub: "Notre Père en latin" },
      { slug: "ave-maria-latin", label: "Ave Maria", sub: "Je vous salue Marie en latin" },
      { slug: "salve-regina", label: "Salve Regina", sub: "Reine des cieux" },
    ],
  },
  {
    id: "chapelet-link",
    label: "Le Chapelet",
    icon: "◎",
    desc: "Prière guidée avec Marie · 20 minutes.",
    prayers: [
      { slug: "chapelet", label: "Commencer le chapelet", sub: "Guide guidé · 4 mystères", isLink: "/dashboard/spiritual/chapelet" },
    ],
  },
];

const STORAGE_KEY = "fraternitas_rosary_v2";
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
  // Lire le tab depuis l'URL hash pour restaurer "prieres" après le parcours
  const getInitialTab = (): Tab => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "") as Tab;
      if (hash === "chapelet" || hash === "prieres") return hash;
    }
    return "jour";
  };

  const [tab, setTab] = useState<Tab>(getInitialTab());
  const [data, setData] = useState<SpiritualData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rosary, setRosary] = useState<RosaryProgress | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>(null); // null = tout fermé
  const [gospelOpen, setGospelOpen] = useState(false);

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

  // Mettre à jour le hash quand le tab change
  const switchTab = (t: Tab) => {
    setTab(t);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${t}`);
    }
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
  // Preview : 3 premières lignes
  const previewLines = gospelLines.slice(0, 3).join("\n");
  const restLines = gospelLines.slice(3).join("\n");

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const todayLabel = dayNames[new Date().getDay()];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes sk { 0%,100%{opacity:.4} 50%{opacity:.9} }
        @keyframes fu { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        .fu { animation: fu .45s cubic-bezier(.16,1,.3,1) both; }
        .rh:hover { background: rgba(17,16,9,0.03) !important; }
      `}</style>

      {/* ── Header compact — sans la topnav du dashboard ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(242,235,224,0.97)", backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${C.ink12}`,
      }}>
        {/* Ligne titre */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 0" }}>
          <button onClick={() => router.back()} style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            fontSize: "12px", color: C.ink50, fontFamily: C.sans,
            display: "flex", alignItems: "center", gap: "4px",
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CrossIcon size={15} />
            <span style={{ fontFamily: C.serif, fontSize: "18px", fontWeight: 400, color: C.ink }}>Prions</span>
          </div>

          {/* Semaine liturgique en gras */}
          {data && !loading && data.liturgicalInfo?.week ? (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: data.liturgicalInfo.color === "white" ? "transparent" : data.liturgicalInfo.colorHex,
                border: data.liturgicalInfo.color === "white" ? `1.5px solid ${data.liturgicalInfo.colorHex}` : "none",
                flexShrink: 0,
              }} />
              <span style={{ fontFamily: C.sans, fontSize: "10px", fontWeight: 700, color: "rgba(17,16,9,0.60)", letterSpacing: "0.01em", maxWidth: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {data.liturgicalInfo.week}
              </span>
            </div>
          ) : <div style={{ width: "20px" }} />}
        </div>

        {/* Onglets — fond légèrement différent */}
        <div style={{ display: "flex", marginTop: "8px", background: "rgba(226,218,204,0.60)", borderTop: `1px solid ${C.ink12}` }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => switchTab(t.key)} style={{
              flex: 1, padding: "10px 4px", textAlign: "center",
              fontSize: "13px", fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? C.ink : C.ink50,
              background: tab === t.key ? "rgba(255,255,255,0.55)" : "none",
              border: "none", cursor: "pointer",
              borderBottom: `2.5px solid ${tab === t.key ? C.gold : "transparent"}`,
              transition: "all .15s", fontFamily: C.sans,
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: "600px", margin: "0 auto", padding: "14px 14px 80px" }}>

        {/* ══════════════ DU JOUR ══════════════ */}
        {tab === "jour" && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "0" }}>

            {/* Évangile */}
            <div style={{ marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", paddingLeft: "2px" }}>
                <span style={{ fontSize: "10px", color: C.gold }}>✦</span>
                <span style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.ink50 }}>Évangile du jour</span>
                {data?.gospel?.reference && (
                  <span style={{ fontSize: "10px", color: C.gold, fontWeight: 500, marginLeft: "auto" }}>{data.gospel.reference}</span>
                )}
              </div>

              <div style={{ background: C.card, borderRadius: "16px", border: `1.5px solid ${C.cardBorder}`, overflow: "hidden" }}>
                {loading ? (
                  <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Skel w="60%" h="10px" /><Skel w="90%" h="15px" /><Skel w="75%" h="13px" /><Skel w="40%" h="10px" />
                  </div>
                ) : data?.gospel ? (
                  <div style={{ padding: "14px" }}>
                    {data.gospel.title && (
                      <p style={{ fontFamily: C.serif, fontSize: "14px", fontStyle: "italic", color: C.ink65, marginBottom: "8px", lineHeight: 1.35 }}>
                        « {stripHtml(data.gospel.title)} »
                      </p>
                    )}
                    {/* Texte évangile — compact, lineHeight 1.5 au lieu de 1.8 */}
                    <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, fontStyle: "italic", color: C.ink80, lineHeight: 1.52, marginBottom: "0", whiteSpace: "pre-line" }}>
                      {previewLines}
                    </p>

                    {/* Suite — accordéon compact */}
                    {restLines && gospelOpen && (
                      <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, color: "rgba(17,16,9,0.74)", lineHeight: 1.52, whiteSpace: "pre-line", marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${C.ink12}` }}>
                        {restLines}
                      </p>
                    )}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", marginTop: "10px", borderTop: `1px solid ${C.ink12}` }}>
                      <span style={{ fontSize: "10px", color: C.ink50, fontWeight: 300 }}>
                        {stripHtml(data.gospel.intro)}
                      </span>
                      {restLines ? (
                        <button onClick={() => setGospelOpen(v => !v)} style={{ fontSize: "12px", color: C.gold, fontWeight: 500, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "3px", fontFamily: C.sans, flexShrink: 0 }}>
                          {gospelOpen ? "Fermer" : "Lire la suite"} <Chev color={C.gold} />
                        </button>
                      ) : (
                        <a href={data.gospel.aelfUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: C.gold, fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center", gap: "3px" }}>
                          Voir sur AELF <Chev color={C.gold} />
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "14px" }}>
                    <p style={{ fontSize: "13px", color: C.ink50, fontWeight: 300 }}>
                      {data?.error || "L'évangile du jour n'est pas disponible."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sep */}
            <div style={{ height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "20px", height: "1px", background: C.gold, opacity: 0.35 }} />
            </div>

            {/* Saint du jour */}
            <div style={{ marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", paddingLeft: "2px" }}>
                <span style={{ fontSize: "10px", color: C.gold }}>☽</span>
                <span style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.ink50 }}>Saint du jour</span>
              </div>
              {loading ? (
                <div style={{ background: C.cream, borderRadius: "16px", padding: "12px 14px", border: `1.5px solid ${C.goldBorder}`, display: "flex", flexDirection: "column", gap: "7px" }}>
                  <Skel w="50%" h="16px" /><Skel w="25%" h="10px" /><Skel w="90%" h="12px" /><Skel w="75%" h="12px" />
                </div>
              ) : data?.saint ? (
                <div style={{ background: C.cream, borderRadius: "16px", padding: "12px 14px", border: `1.5px solid ${C.goldBorder}` }}>
                  <p style={{ fontFamily: C.serif, fontSize: "19px", fontWeight: 400, color: C.ink, marginBottom: "2px", lineHeight: 1.2 }}>{data.saint.name}</p>
                  {data.saint.dates && <p style={{ fontSize: "11px", fontWeight: 300, color: C.ink50, marginBottom: "8px" }}>{data.saint.dates}</p>}
                  <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, color: C.ink65, lineHeight: 1.55, margin: 0 }}>{data.saint.description}</p>
                </div>
              ) : null}
            </div>

            {/* Sep */}
            <div style={{ height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "20px", height: "1px", background: C.gold, opacity: 0.35 }} />
            </div>

            {/* Citation */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", paddingLeft: "2px" }}>
                <span style={{ fontSize: "10px", color: C.gold }}>◎</span>
                <span style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: C.ink50 }}>Parole du jour</span>
              </div>
              {loading ? (
                <div style={{ background: C.card, borderRadius: "16px", padding: "14px", border: `1.5px solid ${C.cardBorder}`, display: "flex", flexDirection: "column", gap: "7px" }}>
                  <Skel w="80%" h="14px" /><Skel w="60%" h="14px" /><Skel w="40%" h="10px" />
                </div>
              ) : data?.quote ? (
                <div style={{ background: "#111009", borderRadius: "16px", padding: "16px 18px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: "6px", left: "14px", fontFamily: C.serif, fontSize: "56px", lineHeight: 1, color: "rgba(184,137,58,0.12)", pointerEvents: "none", userSelect: "none" }}>«</div>
                  <p style={{ fontFamily: C.serif, fontSize: "17px", fontWeight: 300, fontStyle: "italic", color: "#F5EFE4", lineHeight: 1.55, marginBottom: "10px", position: "relative", zIndex: 1 }}>
                    « {data.quote.text} »
                  </p>
                  <p style={{ fontSize: "11px", fontWeight: 400, color: "rgba(184,137,58,0.7)", position: "relative", zIndex: 1 }}>— {data.quote.author}</p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ══════════════ CHAPELET ══════════════ */}
        {tab === "chapelet" && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

            {/* Carte mystère sombre */}
            <div style={{ background: "linear-gradient(135deg,#1A1410 0%,#2C1E08 100%)", borderRadius: "16px", border: "1.5px solid rgba(196,154,60,0.22)", padding: "20px 18px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
                  <circle cx="110" cy="110" r="100" stroke="#C49A3C" strokeWidth="0.5" opacity="0.10"/>
                  <circle cx="110" cy="110" r="74" stroke="#C49A3C" strokeWidth="0.4" opacity="0.07"/>
                  <circle cx="110" cy="110" r="50" stroke="#C49A3C" strokeWidth="0.4" opacity="0.05"/>
                </svg>
              </div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(196,154,60,0.70)", fontFamily: C.sans, marginBottom: "5px" }}>
                  Mystère du jour · {todayLabel}
                </p>
                <p style={{ fontFamily: C.serif, fontSize: "22px", fontWeight: 300, color: "#F5EFE4", lineHeight: 1.15, marginBottom: "5px" }}>
                  {rosary ? MYSTERY_LABELS[rosary.mysteryType] : "Mystères Douloureux"}
                </p>
                <p style={{ fontFamily: C.serif, fontSize: "13px", fontWeight: 300, fontStyle: "italic", color: "rgba(245,239,228,0.40)", lineHeight: 1.45, margin: 0 }}>
                  Cinq mystères à contempler avec Marie
                </p>
              </div>
            </div>

            {/* Intention */}
            <div style={{ background: "#FAF5EC", borderRadius: "14px", border: "1.5px solid rgba(196,154,60,0.28)", padding: "12px 14px" }}>
              <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#B8973A", fontFamily: C.sans, marginBottom: "7px" }}>
                Confier ce chapelet
              </p>
              <input type="text" placeholder="Pour mon père… Pour la paix…" style={{ width: "100%", padding: "9px 12px", border: "1.5px solid rgba(196,154,60,0.28)", borderRadius: "10px", background: "rgba(255,255,255,0.70)", color: C.ink, fontFamily: C.serif, fontSize: "16px", fontWeight: 300, fontStyle: "italic", outline: "none" }} />
            </div>

            {/* Son — barre compacte */}
            <div style={{ background: C.card, borderRadius: "10px", border: `1px solid ${C.cardBorder}`, padding: "7px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: C.ink35, fontFamily: C.sans, flexShrink: 0 }}>Son</span>
              <div style={{ display: "flex", gap: "5px", flex: 1 }}>
                {["Silence", "Plain-chant", "Chant marial"].map((label, i) => (
                  <div key={i} style={{ flex: 1, padding: "5px 0", borderRadius: "7px", border: `1px solid ${i === 0 ? "#1A1410" : C.cardBorder}`, background: i === 0 ? "#1A1410" : "transparent", fontSize: "10px", fontWeight: i === 0 ? 500 : 400, color: i === 0 ? "#C49A3C" : C.ink50, textAlign: "center" as const, fontFamily: C.sans }}>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Reprise */}
            {rosary && (
              <div style={{ background: C.card, borderRadius: "12px", padding: "12px 14px", border: "1.5px solid rgba(196,154,60,0.32)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: C.ink, margin: "0 0 2px" }}>{MYSTERY_LABELS[rosary.mysteryType]}</p>
                    <p style={{ fontSize: "11px", fontWeight: 300, color: C.ink50, margin: 0 }}>Dizaine {rosary.decadeIndex + 1} · {rosaryPercent}%</p>
                  </div>
                  <span style={{ fontSize: "20px", fontWeight: 300, color: "#C49A3C", fontFamily: C.serif }}>{rosaryPercent}%</span>
                </div>
                <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} style={{ flex: 1, height: "3px", borderRadius: "99px", background: i < rosary.decadeIndex ? "#1A1410" : i === rosary.decadeIndex ? "#C49A3C" : C.ink12, opacity: i <= rosary.decadeIndex ? 0.7 : 1 }} />
                  ))}
                </div>
                <Link href="/dashboard/spiritual/chapelet" style={{ textDecoration: "none", display: "block" }}>
                  <button style={{ width: "100%", padding: "9px", borderRadius: "10px", background: "#1A1410", border: "none", color: "#F5EFE4", fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans }}>
                    Reprendre →
                  </button>
                </Link>
              </div>
            )}

            {/* Commencer */}
            <Link href="/dashboard/spiritual/chapelet" style={{ textDecoration: "none" }}>
              <button style={{ width: "100%", padding: "15px", background: "#C49A3C", border: "none", borderRadius: "14px", color: "#1A1410", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: C.sans, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <CrossIcon size={14} color="#1A1410" />
                {rosary ? "Reprendre le chapelet" : "Commencer le chapelet"} →
              </button>
            </Link>

            {/* Pourquoi */}
            <div style={{ background: C.card, borderRadius: "13px", border: `1.5px solid ${C.cardBorder}`, padding: "14px 16px" }}>
              <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: "#B8973A", fontFamily: C.sans, marginBottom: "5px" }}>Le saviez-vous ?</p>
              <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 300, fontStyle: "italic", color: C.ink, lineHeight: 1.50, marginBottom: "4px" }}>
                « Le chapelet est l&apos;arme de notre temps. »
              </p>
              <p style={{ fontSize: "11px", fontWeight: 400, color: C.ink50, fontFamily: C.sans, marginBottom: "8px" }}>— Saint Jean-Paul II</p>
              <Link href="/dashboard/spiritual/chapelet#pourquoi" style={{ fontSize: "12px", fontWeight: 500, color: "#B8973A", textDecoration: "none", display: "flex", alignItems: "center", gap: "3px", fontFamily: C.sans }}>
                Pourquoi prier le chapelet <Chev color="#B8973A" />
              </Link>
            </div>

            <p style={{ fontSize: "10px", fontWeight: 300, color: C.ink35, textAlign: "center", fontFamily: C.sans }}>
              Sauvegarde automatique de votre progression
            </p>
          </div>
        )}

        {/* ══════════════ PRIÈRES ══════════════ */}
        {tab === "prieres" && (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

            <div style={{ marginBottom: "4px" }}>
              <p style={{ fontFamily: C.serif, fontSize: "22px", fontWeight: 300, color: C.ink, marginBottom: "3px" }}>Prières</p>
              <p style={{ fontFamily: C.serif, fontSize: "14px", fontWeight: 300, fontStyle: "italic", color: C.ink50, lineHeight: 1.55 }}>
                Parce qu&apos;il y a toujours des mots pour s&apos;adresser à Dieu.
              </p>
            </div>

            {/* Card parcours guidé */}
            <div onClick={() => router.push("/dashboard/spiritual/parcours")} style={{ background: "linear-gradient(135deg,#1A1410 0%,#2C1E08 100%)", borderRadius: "16px", border: "1.5px solid rgba(196,154,60,0.30)", padding: "18px 16px 16px", cursor: "pointer", marginBottom: "0" }}>
              <p style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(196,154,60,0.60)", fontFamily: C.sans, marginBottom: "6px" }}>Nouveau ici ?</p>
              <p style={{ fontFamily: C.serif, fontSize: "20px", fontWeight: 300, color: "#F5EFE4", marginBottom: "4px", lineHeight: 1.25 }}>Commencer à prier.</p>
              <p style={{ fontSize: "12px", fontWeight: 300, color: "rgba(245,239,228,0.50)", fontFamily: C.sans, marginBottom: "12px", lineHeight: 1.5 }}>Un parcours guidé · Débutant ou pratiquant.</p>
              <span style={{ display: "inline-flex", alignItems: "center", background: "#C49A3C", borderRadius: "99px", padding: "7px 16px", fontSize: "12px", fontWeight: 500, color: "#1A1410", fontFamily: C.sans }}>Je commence →</span>
            </div>

            {/* Accordéons — tous fermés par défaut */}
            {PRAYER_CATEGORIES.map(cat => (
              <div key={cat.id} style={{ background: C.card, borderRadius: "14px", border: `1.5px solid ${C.cardBorder}`, overflow: "hidden" }}>
                <button
                  onClick={() => setOpenCategory(openCategory === cat.id ? null : cat.id)}
                  style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", fontFamily: C.sans }}
                >
                  <div style={{ textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <span style={{ fontSize: "13px", color: C.gold }}>{cat.icon}</span>
                      <span style={{ fontSize: "14px", fontWeight: 500, color: C.ink }}>{cat.label}</span>
                    </div>
                    <p style={{ fontSize: "11px", fontWeight: 300, fontStyle: "italic", color: C.ink50, margin: "2px 0 0 20px", fontFamily: C.serif }}>{cat.desc}</p>
                  </div>
                  <span style={{ fontSize: "16px", color: C.ink50, transform: openCategory === cat.id ? "rotate(90deg)" : "none", transition: "transform .2s", flexShrink: 0, marginLeft: "8px" }}>›</span>
                </button>

                {openCategory === cat.id && (
                  <div style={{ borderTop: `1px solid ${C.ink12}` }}>
                    {cat.prayers.map((prayer, i) => {
                      const href = (prayer as { isLink?: string }).isLink || `/dashboard/spiritual/prieres/${prayer.slug}`;
                      return (
                        <Link key={prayer.slug + i} href={href} style={{ textDecoration: "none", display: "block" }}>
                          <div className="rh" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderBottom: i < cat.prayers.length - 1 ? `1px solid ${C.ink12}` : "none", background: "transparent", transition: "background .12s" }}>
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: 500, color: C.ink, margin: "0 0 1px" }}>{prayer.label}</p>
                              <p style={{ fontSize: "10px", fontWeight: 300, color: C.ink50, margin: 0 }}>{prayer.sub}</p>
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

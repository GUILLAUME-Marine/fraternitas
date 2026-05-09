"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SpiritualData {
  date: string;
  liturgicalInfo: {
    label: string; season: string; week: string;
    color: string; colorHex: string;
  };
  gospel: { reference: string; title: string; intro: string; text: string; aelfUrl: string } | null;
  saint: { name: string; dates: string; description: string };
  quote: { text: string; author: string };
  error?: string;
}

type Tab = "jour" | "chapelet" | "prieres";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#F5EFE4", card: "#FFFFFF", cream: "#EDE6D8", creamGold: "#FBF7F0",
  gold: "#C49A3C", goldBorder: "rgba(196,154,60,0.28)", ink: "#111009",
  ink70: "rgba(17,16,9,0.70)", ink55: "rgba(17,16,9,0.55)",
  ink40: "rgba(17,16,9,0.40)", ink30: "rgba(17,16,9,0.30)", ink08: "rgba(17,16,9,0.08)",
  serif: "'Cormorant Garamond','Playfair Display',Georgia,serif",
  sans: "'DM Sans',system-ui,sans-serif",
};

// ─── Prières catalogue ────────────────────────────────────────────────────────
const PRAYERS = [
  { slug: "notre-pere", label: "Notre Père", sub: "Oratio Dominica" },
  { slug: "je-vous-salue-marie", label: "Je vous salue Marie", sub: "Ave Maria" },
  { slug: "angelus", label: "L'Angélus", sub: "Angelus Domini" },
  { slug: "acte-de-contrition", label: "Acte de contrition", sub: "Actus Contritionis" },
  { slug: "gloire-au-pere", label: "Gloire au Père", sub: "Gloria Patri" },
  { slug: "acte-de-foi", label: "Acte de foi", sub: "Actus Fidei" },
  { slug: "memorare", label: "Memorare", sub: "Souviens-toi, ô Marie…" },
  { slug: "avant-le-repas", label: "Avant le repas", sub: "Bénissez-nous, Seigneur" },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skel({ w = "100%", h = "12px", r = "6px" }: { w?: string; h?: string; r?: string }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r, flexShrink: 0,
      background: "rgba(17,16,9,0.08)",
      animation: "sk 1.8s ease-in-out infinite",
    }} />
  );
}

// ─── Chevron ──────────────────────────────────────────────────────────────────
function Chev({ color = C.gold }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M6 4L10 8L6 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Cross logo ───────────────────────────────────────────────────────────────
function CrossLogo({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="12" stroke="#C49A3C" strokeWidth="1.3" />
      <line x1="14" y1="5" x2="14" y2="23" stroke="#C49A3C" strokeWidth="1.3" />
      <line x1="8" y1="11" x2="20" y2="11" stroke="#C49A3C" strokeWidth="1.3" />
    </svg>
  );
}

// ─── Liturgical dot ───────────────────────────────────────────────────────────
function LiturgicalDot({ color, hex }: { color: string; hex: string }) {
  const labels: Record<string, string> = {
    white: "Blanc", green: "Vert", red: "Rouge",
    purple: "Violet", pink: "Rose", black: "Noir",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <div style={{
        width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
        background: color === "white" ? "transparent" : hex,
        border: color === "white" ? `1.5px solid ${hex}` : "none",
      }} />
      <span style={{ fontSize: "10px", fontWeight: 300, color: C.ink40, fontFamily: C.sans }}>
        {labels[color] || "Liturgique"}
      </span>
    </div>
  );
}

// ─── Rosary progress (localStorage) ──────────────────────────────────────────
const STORAGE_KEY = "fraternitas_rosary_v2";
interface RosaryProgress {
  mysteryType: string; decadeIndex: number; grainIndex: number;
  startedAt?: string;
}

function getRosaryProgress(): RosaryProgress | null {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

const MYSTERY_LABELS: Record<string, string> = {
  joyeux: "Mystères Joyeux", lumineux: "Mystères Lumineux",
  douloureux: "Mystères Douloureux", glorieux: "Mystères Glorieux",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PrionsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("jour");
  const [data, setData] = useState<SpiritualData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rosary, setRosary] = useState<RosaryProgress | null>(null);

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

  const TABS: Array<{ key: Tab; label: string }> = [
    { key: "jour", label: "Du jour" },
    { key: "chapelet", label: "Chapelet" },
    { key: "prieres", label: "Prières" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes sk { 0%,100%{opacity:.4} 50%{opacity:.9} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        .pi { animation: fadeUp .5s cubic-bezier(.16,1,.3,1) both; }
        .pr:hover { opacity: .75; }
        .pc { cursor: pointer; transition: background .15s; }
        .pc:hover { background: rgba(17,16,9,0.02) !important; }
      `}</style>

      {/* ── Header sticky ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(245,239,228,0.94)", backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${C.ink08}`,
      }}>
        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px 8px",
        }}>
          <button onClick={() => router.back()} style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            fontSize: "12px", color: C.ink40, fontFamily: C.sans,
            display: "flex", alignItems: "center", gap: "4px",
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Accueil
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CrossLogo size={15} />
            <span style={{ fontFamily: C.serif, fontSize: "17px", color: C.ink70 }}>Prions</span>
          </div>

          {/* Date liturgique compacte */}
          {data && !loading ? (
            <LiturgicalDot color={data.liturgicalInfo.color} hex={data.liturgicalInfo.colorHex} />
          ) : (
            <div style={{ width: "48px" }} />
          )}
        </div>

        {/* Onglets */}
        <div style={{ display: "flex", padding: "0 12px" }}>
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: "7px 4px", textAlign: "center",
              fontSize: "12px", fontWeight: tab === t.key ? 500 : 400,
              color: tab === t.key ? C.ink : C.ink40,
              background: "none", border: "none", cursor: "pointer",
              borderBottom: `2px solid ${tab === t.key ? C.gold : "transparent"}`,
              transition: "all .15s", fontFamily: C.sans,
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Contenu ── */}
      <main style={{ maxWidth: "600px", margin: "0 auto", padding: "14px 14px 80px" }}>

        {/* ══════════ ONGLET DU JOUR ══════════ */}
        {tab === "jour" && (
          <div className="pi" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

            {/* Évangile */}
            <div style={{ background: C.card, borderRadius: "16px", border: `1.5px solid ${C.ink08}` }}>
              {loading ? (
                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Skel w="80px" h="9px" /><Skel w="70%" h="16px" /><Skel w="50%" h="9px" />
                </div>
              ) : data?.gospel ? (
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ fontSize: "9px", color: C.gold }}>✦</span>
                      <span style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: C.ink40 }}>Évangile du jour</span>
                    </div>
                    <span style={{ fontSize: "10px", color: C.gold, fontWeight: 500 }}>{data.gospel.reference}</span>
                  </div>
                  <p style={{ fontFamily: C.serif, fontSize: "17px", fontWeight: 300, fontStyle: "italic", color: C.ink70, lineHeight: 1.5, marginBottom: "10px" }}>
                    « {data.gospel.text.split("\n\n")[0].slice(0, 120)}{data.gospel.text.length > 120 ? "…" : ""} »
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "10px", color: C.ink40, fontWeight: 300 }}>{data.gospel.intro}</span>
                    <Link href="/dashboard/spiritual" style={{
                      fontSize: "11px", color: C.gold, fontWeight: 500,
                      textDecoration: "none", display: "flex", alignItems: "center", gap: "3px",
                    }}>
                      Lire <Chev />
                    </Link>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "14px 16px" }}>
                  <p style={{ fontSize: "12px", color: C.ink40, fontWeight: 300 }}>
                    {data?.error || "Évangile non disponible"}
                  </p>
                </div>
              )}
            </div>

            {/* Chapelet card sombre */}
            <Link href="/dashboard/spiritual/chapelet" style={{ textDecoration: "none", display: "block" }}>
              <div style={{
                background: "#111009", borderRadius: "16px", padding: "12px 14px",
                position: "relative", overflow: "hidden",
                transition: "transform .2s", cursor: "pointer",
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = "translateY(-1px)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = "none")}
              >
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: "radial-gradient(ellipse 55% 55% at 75% 30%,rgba(196,154,60,0.10),transparent)",
                }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div>
                      <span style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(196,154,60,0.55)" }}>
                        Chapelet du jour
                      </span>
                      <p style={{ fontFamily: C.serif, fontSize: "17px", fontWeight: 300, color: "#F5EFE4", lineHeight: 1.1, marginTop: "2px" }}>
                        {rosary ? MYSTERY_LABELS[rosary.mysteryType] : "Mystères Douloureux"}
                      </p>
                    </div>
                    <Chev color="rgba(196,154,60,0.5)" />
                  </div>
                  {rosary ? (
                    <>
                      <div style={{ background: "rgba(245,239,228,0.08)", borderRadius: "99px", height: "2px", marginBottom: "4px" }}>
                        <div style={{ width: `${rosaryPercent}%`, height: "100%", background: "rgba(196,154,60,0.65)", borderRadius: "99px", transition: "width .4s" }} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "9px", color: "rgba(245,239,228,0.3)", fontWeight: 300 }}>
                          Dizaine {rosary.decadeIndex + 1} · en cours · {rosaryPercent}%
                        </span>
                        <span style={{ fontSize: "10px", color: C.gold, fontWeight: 500 }}>Reprendre →</span>
                      </div>
                    </>
                  ) : (
                    <span style={{ fontSize: "10px", color: "rgba(245,239,228,0.4)", fontWeight: 300 }}>
                      Pas encore commencé aujourd&rsquo;hui
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Saint du jour */}
            {loading ? (
              <div style={{ background: C.card, borderRadius: "14px", padding: "12px 14px", border: `1.5px solid ${C.ink08}`, display: "flex", flexDirection: "column", gap: "7px" }}>
                <Skel w="60px" h="8px" /><Skel w="50%" h="14px" /><Skel w="80%" h="9px" />
              </div>
            ) : data?.saint ? (
              <div style={{ background: C.cream, borderRadius: "14px", padding: "11px 14px", border: `1px solid ${C.goldBorder}`, display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: "9px", fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", color: C.ink40 }}>☽ Saint du jour</span>
                  <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 400, color: C.ink, margin: "2px 0 1px", lineHeight: 1.15 }}>
                    {data.saint.name}
                  </p>
                  {data.saint.dates && (
                    <p style={{ fontSize: "10px", fontWeight: 300, color: C.ink40, margin: 0 }}>
                      {data.saint.dates} · {data.saint.description.slice(0, 55)}…
                    </p>
                  )}
                </div>
                <button style={{
                  background: "none", border: `1.5px solid ${C.goldBorder}`, borderRadius: "99px",
                  padding: "5px 10px", fontSize: "10px", color: C.gold, fontWeight: 500,
                  cursor: "pointer", fontFamily: C.sans, flexShrink: 0,
                }}>
                  Découvrir
                </button>
              </div>
            ) : null}

            {/* Citation du jour */}
            {data?.quote && !loading && (
              <div style={{ background: C.creamGold, borderRadius: "14px", padding: "11px 14px", border: `1px solid ${C.goldBorder}` }}>
                <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, fontStyle: "italic", color: C.ink70, lineHeight: 1.55, marginBottom: "5px" }}>
                  « {data.quote.text} »
                </p>
                <p style={{ fontSize: "10px", color: C.ink40, fontWeight: 300, margin: 0 }}>— {data.quote.author}</p>
              </div>
            )}
          </div>
        )}

        {/* ══════════ ONGLET CHAPELET ══════════ */}
        {tab === "chapelet" && (
          <div className="pi" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

            {/* Avancement */}
            <div style={{ background: C.card, borderRadius: "14px", padding: "10px 14px", border: `1.5px solid ${C.ink08}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "10px", color: C.ink40, fontWeight: 300 }}>
                  {rosary ? `Commencé · dizaine ${rosary.decadeIndex + 1}/5` : "Pas encore commencé aujourd'hui"}
                </span>
                <span style={{ fontSize: "11px", color: C.gold, fontWeight: 500 }}>{rosaryPercent > 0 ? `${rosaryPercent}%` : ""}</span>
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} style={{
                    flex: 1, height: "3px", borderRadius: "99px",
                    background: rosary && i < rosary.decadeIndex ? "#111009"
                      : rosary && i === rosary.decadeIndex ? C.gold
                      : "rgba(17,16,9,0.1)",
                    opacity: rosary && i < rosary.decadeIndex ? 0.7 : rosary && i === rosary.decadeIndex ? 0.65 : 1,
                  }} />
                ))}
              </div>
            </div>

            {/* Mystères 2×2 */}
            <div>
              <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", color: C.ink30, marginBottom: "8px" }}>
                Choisir un mystère
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {([
                  { key: "joyeux", label: "Joyeux", days: "Lun · Sam", color: "#B8973A", today: false },
                  { key: "lumineux", label: "Lumineux", days: "Jeudi", color: "#4A7C59", today: false },
                  { key: "douloureux", label: "Douloureux", days: "Mar · Ven", color: "#7A4A4A", today: true },
                  { key: "glorieux", label: "Glorieux", days: "Mer · Dim", color: "#3A5A8A", today: false },
                ] as const).map((m) => (
                  <Link key={m.key} href="/dashboard/spiritual/chapelet" style={{ textDecoration: "none" }}>
                    <div style={{
                      background: m.today ? C.creamGold : C.card,
                      border: m.today ? `2px solid rgba(196,154,60,0.45)` : `1.5px solid ${C.ink08}`,
                      borderRadius: "14px", padding: "11px 12px", position: "relative",
                      cursor: "pointer", transition: "transform .15s",
                    }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = "translateY(-1px)")}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = "none")}
                    >
                      {m.today && (
                        <div style={{
                          position: "absolute", top: "-1px", right: "10px",
                          background: C.gold, borderRadius: "0 0 5px 5px",
                          padding: "1px 6px",
                        }}>
                          <span style={{ fontSize: "7px", fontWeight: 500, color: "#1C1A12", fontFamily: C.sans }}>
                            {new Date().toLocaleDateString("fr-FR", { weekday: "short" }).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: m.color, marginBottom: "7px" }} />
                      <p style={{ fontFamily: C.serif, fontSize: "15px", fontWeight: 400, color: C.ink, lineHeight: 1.1, marginBottom: "3px" }}>
                        {m.label}
                      </p>
                      <p style={{ fontSize: "10px", fontWeight: 300, color: C.ink40, margin: 0 }}>{m.days}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Prières du début — lien discret */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 0", borderTop: `1px solid ${C.ink08}`, borderBottom: `1px solid ${C.ink08}`,
            }}>
              <div>
                <p style={{ fontSize: "12px", fontWeight: 500, color: C.ink, margin: 0 }}>Prières du début</p>
                <p style={{ fontSize: "10px", fontWeight: 300, color: C.ink40, margin: "1px 0 0" }}>Credo · Notre Père · 3 Ave · Gloire au Père</p>
              </div>
              <Link href="/dashboard/spiritual/prieres/notre-pere" style={{
                fontSize: "11px", color: C.gold, fontWeight: 500, textDecoration: "none",
                display: "flex", alignItems: "center", gap: "2px",
              }}>
                Voir <Chev />
              </Link>
            </div>

            {/* Bouton principal */}
            <Link href="/dashboard/spiritual/chapelet" style={{ textDecoration: "none" }}>
              <div style={{
                background: "#111009", borderRadius: "14px", padding: "14px",
                textAlign: "center", cursor: "pointer",
                transition: "opacity .15s",
              }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
              >
                <p style={{ fontSize: "14px", fontWeight: 500, color: "#F5EFE4", margin: 0, fontFamily: C.sans }}>
                  {rosary ? "Reprendre le chapelet →" : "Commencer le chapelet →"}
                </p>
              </div>
            </Link>
          </div>
        )}

        {/* ══════════ ONGLET PRIÈRES ══════════ */}
        {tab === "prieres" && (
          <div className="pi" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
              <p style={{ fontFamily: C.serif, fontSize: "22px", fontWeight: 300, color: C.ink, marginBottom: "4px" }}>
                Prières
              </p>
              <p style={{ fontSize: "12px", fontWeight: 300, color: C.ink40, lineHeight: 1.55 }}>
                Les prières fondamentales de la tradition catholique.
              </p>
            </div>

            <div style={{ background: C.card, borderRadius: "16px", border: `1.5px solid ${C.ink08}`, overflow: "hidden" }}>
              {PRAYERS.map((prayer, i) => (
                <Link key={prayer.slug} href={`/dashboard/spiritual/prieres/${prayer.slug}`} style={{ textDecoration: "none", display: "block" }}>
                  <div className="pc" style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "13px 16px",
                    borderBottom: i < PRAYERS.length - 1 ? `1px solid ${C.ink08}` : "none",
                    background: "transparent",
                  }}>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 500, color: C.ink, margin: "0 0 1px" }}>{prayer.label}</p>
                      <p style={{ fontSize: "10px", fontWeight: 300, color: C.ink40, margin: 0, letterSpacing: "0.03em" }}>{prayer.sub}</p>
                    </div>
                    <Chev color={C.ink40} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Chapelet depuis prières */}
            <Link href="/dashboard/spiritual/chapelet" style={{ textDecoration: "none" }}>
              <div style={{
                background: C.cream, borderRadius: "14px", padding: "12px 14px",
                border: `1px solid ${C.goldBorder}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: C.ink, margin: "0 0 2px" }}>Prier le chapelet</p>
                  <p style={{ fontSize: "10px", fontWeight: 300, color: C.ink40, margin: 0 }}>
                    Guide guidé · 4 mystères · Prière de Fatima incluse
                  </p>
                </div>
                <Chev />
              </div>
            </Link>

            {/* Citation */}
            <div style={{ background: C.creamGold, borderRadius: "14px", padding: "12px 14px", border: `1px solid ${C.goldBorder}` }}>
              <p style={{ fontFamily: C.serif, fontSize: "16px", fontWeight: 300, fontStyle: "italic", color: C.ink70, lineHeight: 1.55, marginBottom: "4px" }}>
                « Priez sans cesse. »
              </p>
              <p style={{ fontSize: "10px", color: C.ink40, fontWeight: 300, margin: 0 }}>— Saint Paul · 1 Th 5, 17</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

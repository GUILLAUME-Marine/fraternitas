"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SpiritualData {
  date: string;
  liturgicalInfo: {
    label: string;
    season: string;
    week: string;
    color: string;
    colorHex: string;
  };
  gospel: {
    reference: string;
    intro: string;
    text: string;
    title: string;
    aelfUrl: string;
  } | null;
  saint: {
    name: string;
    dates: string;
    description: string;
  };
  quote: {
    text: string;
    author: string;
  };
  error?: string;
}

// ─── Skeleton sobre ───────────────────────────────────────────────────────────
function Skeleton({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        background: "rgba(17,16,9,0.07)",
        borderRadius: "8px",
        animation: "skeleton-pulse 1.8s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

// ─── Couleur liturgique → label et style ─────────────────────────────────────
function LiturgicalDot({ color, hex }: { color: string; hex: string }) {
  const labels: Record<string, string> = {
    white: "Blanc — Temps pascal",
    green: "Vert — Temps ordinaire",
    red: "Rouge — Martyr / Pentecôte",
    purple: "Violet — Avent / Carême",
    pink: "Rose — Laetare / Gaudete",
    black: "Noir — Funérailles",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{
          background: color === "white" ? "#E8E0D0" : hex,
          border: color === "white" ? "1.5px solid rgba(17,16,9,0.2)" : "none",
          boxShadow: `0 0 6px ${color === "white" ? "rgba(17,16,9,0.1)" : hex + "66"}`,
        }}
        title={labels[color] || ""}
      />
      <span
        className="text-xs font-light tracking-wide"
        style={{ color: "rgba(17,16,9,0.4)" }}
      >
        {labels[color] || ""}
      </span>
    </div>
  );
}

// ─── Prières rapides ──────────────────────────────────────────────────────────
const PRAYERS = [
  { slug: "notre-pere", label: "Notre Père", description: "La prière enseignée par Jésus" },
  { slug: "je-vous-salue-marie", label: "Je vous salue Marie", description: "La salutation angélique" },
  { slug: "angelus", label: "L'Angélus", description: "Prière du matin, du midi et du soir" },
  { slug: "acte-de-contrition", label: "Acte de contrition", description: "Prière de repentance et de pardon" },
  { slug: "gloire-au-pere", label: "Gloire au Père", description: "Doxologie trinitaire" },
  { slug: "acte-de-foi", label: "Acte de foi", description: "Profession de foi personnelle" },
];

// ─── Page principale ───────────────────────────────────────────────────────────
export default function SpiritualPage() {
  const [data, setData] = useState<SpiritualData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch("/api/spiritual");
      if (!res.ok) throw new Error("API unavailable");
      const json = await res.json();
      setData(json);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5EFE4",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .spiritual-section {
          animation: fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        .spiritual-section:nth-child(1) { animation-delay: 0ms; }
        .spiritual-section:nth-child(2) { animation-delay: 80ms; }
        .spiritual-section:nth-child(3) { animation-delay: 160ms; }
        .spiritual-section:nth-child(4) { animation-delay: 240ms; }
        .spiritual-section:nth-child(5) { animation-delay: 320ms; }
        .spiritual-section:nth-child(6) { animation-delay: 400ms; }

        .prayer-item:hover {
          background: rgba(17,16,9,0.04) !important;
        }

        .back-btn:hover {
          opacity: 0.6;
        }

        * { box-sizing: border-box; }
      `}</style>

      {/* ── Header sobre ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(245,239,228,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(17,16,9,0.07)",
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          className="back-btn"
          onClick={() => router.back()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(17,16,9,0.5)",
            fontSize: "13px",
            fontWeight: 400,
            padding: "0",
            transition: "opacity 0.15s",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Retour
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12.5" stroke="#C49A3C" strokeWidth="1" />
            <line x1="14" y1="4.5" x2="14" y2="23.5" stroke="#C49A3C" strokeWidth="1.3" />
            <line x1="8.5" y1="11" x2="19.5" y2="11" stroke="#C49A3C" strokeWidth="1.3" />
          </svg>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "16px",
              color: "rgba(17,16,9,0.7)",
              fontWeight: 400,
            }}
          >
            Vie spirituelle
          </span>
        </div>

        <div style={{ width: "60px" }} />
      </header>

      {/* ── Contenu ── */}
      <main
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          padding: "48px 24px 80px",
        }}
      >
        {fetchError ? (
          <ErrorState onRetry={fetchData} />
        ) : loading ? (
          <LoadingSkeleton />
        ) : data ? (
          <SpiritualContent data={data} expanded={expanded} setExpanded={setExpanded} />
        ) : null}
      </main>
    </div>
  );
}

// ─── Contenu spirituel ────────────────────────────────────────────────────────
function SpiritualContent({
  data,
  expanded,
  setExpanded,
}: {
  data: SpiritualData;
  expanded: string | null;
  setExpanded: (v: string | null) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>

      {/* ── Section 1 : Date liturgique ── */}
      <section className="spiritual-section" style={{ marginBottom: "48px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <LiturgicalDot
            color={data.liturgicalInfo.color}
            hex={data.liturgicalInfo.colorHex}
          />
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: 300,
              color: "#111009",
              lineHeight: 1.15,
              margin: 0,
              textTransform: "capitalize",
            }}
          >
            {data.liturgicalInfo.label}
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(17,16,9,0.45)",
              fontWeight: 300,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {data.liturgicalInfo.season} · {data.liturgicalInfo.week}
          </p>
        </div>
      </section>

      {/* Séparateur */}
      <div
        className="spiritual-section"
        style={{
          height: "1px",
          background: "rgba(17,16,9,0.08)",
          marginBottom: "48px",
        }}
      />

      {/* ── Section 2 : Évangile du jour ── */}
      <section className="spiritual-section" style={{ marginBottom: "56px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          <span style={{ color: "#C49A3C", fontSize: "13px" }}>✦</span>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "rgba(17,16,9,0.35)",
              margin: 0,
            }}
          >
            Évangile du jour
          </p>
        </div>

        {data.error && !data.gospel ? (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "20px",
              padding: "32px",
              border: "1.5px solid rgba(17,16,9,0.07)",
            }}
          >
            <p
              style={{
                fontSize: "14px",
                color: "rgba(17,16,9,0.45)",
                fontWeight: 300,
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              {data.error}
            </p>
          </div>
        ) : data.gospel ? (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "20px",
              padding: "clamp(24px, 5vw, 48px)",
              border: "1.5px solid rgba(17,16,9,0.06)",
              boxShadow: "0 2px 24px rgba(17,16,9,0.04)",
            }}
          >
            {/* Référence */}
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "15px",
                fontWeight: 400,
                color: "#C49A3C",
                marginBottom: "4px",
              }}
            >
              {data.gospel.reference}
            </p>
            {data.gospel.title && (
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(20px, 3vw, 26px)",
                  fontWeight: 400,
                  fontStyle: "italic",
                  color: "#111009",
                  marginBottom: "28px",
                  lineHeight: 1.25,
                }}
              >
                « {data.gospel.title} »
              </p>
            )}

            {/* Intro */}
            <p
              style={{
                fontSize: "12px",
                fontWeight: 500,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "rgba(17,16,9,0.35)",
                marginBottom: "20px",
              }}
            >
              {data.gospel.intro}
            </p>

            {/* Texte */}
            {data.gospel.text && (
              <div>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "clamp(18px, 2.5vw, 22px)",
                    fontWeight: 300,
                    lineHeight: 1.8,
                    color: "rgba(17,16,9,0.82)",
                    whiteSpace: "pre-line",
                  }}
                >
                  {data.gospel.text.length > 800 && expanded !== "gospel"
                    ? data.gospel.text.slice(0, 800) + "…"
                    : data.gospel.text}
                </p>

                {data.gospel.text.length > 800 && (
                  <button
                    onClick={() => setExpanded(expanded === "gospel" ? null : "gospel")}
                    style={{
                      marginTop: "16px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#C49A3C",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {expanded === "gospel" ? "Réduire" : "Lire la suite"}
                    <span style={{ fontSize: "11px" }}>{expanded === "gospel" ? "↑" : "↓"}</span>
                  </button>
                )}
              </div>
            )}

            {/* Lien AELF */}
            <div
              style={{
                marginTop: "32px",
                paddingTop: "20px",
                borderTop: "1px solid rgba(17,16,9,0.07)",
              }}
            >
              <a
                href={data.gospel.aelfUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "12px",
                  color: "rgba(17,16,9,0.4)",
                  fontWeight: 400,
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = "#C49A3C")}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = "rgba(17,16,9,0.4)")}
              >
                Lire toutes les lectures du jour sur AELF.org
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "20px",
              padding: "32px",
              border: "1.5px solid rgba(17,16,9,0.07)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "14px", color: "rgba(17,16,9,0.4)", fontWeight: 300 }}>
              Le contenu spirituel n&rsquo;est pas disponible en ce moment.
              <br />Réessayez plus tard ou consultez directement{" "}
              <a href="https://www.aelf.org" target="_blank" rel="noopener noreferrer" style={{ color: "#C49A3C" }}>
                aelf.org
              </a>.
            </p>
          </div>
        )}
      </section>

      {/* ── Section 3 : Saint du jour ── */}
      <section className="spiritual-section" style={{ marginBottom: "56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <span style={{ color: "#C49A3C", fontSize: "13px" }}>☽</span>
          <p style={{
            fontSize: "11px", fontWeight: 500, letterSpacing: "2px",
            textTransform: "uppercase", color: "rgba(17,16,9,0.35)", margin: 0,
          }}>
            Saint du jour
          </p>
        </div>

        <div
          style={{
            background: "#EDE6D8",
            borderRadius: "20px",
            padding: "clamp(24px, 4vw, 36px)",
            border: "1.5px solid rgba(196,154,60,0.15)",
          }}
        >
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(22px, 3.5vw, 30px)",
              fontWeight: 400,
              color: "#111009",
              marginBottom: data.saint.dates ? "4px" : "16px",
              lineHeight: 1.2,
            }}
          >
            {data.saint.name}
          </h2>
          {data.saint.dates && (
            <p
              style={{
                fontSize: "13px",
                color: "rgba(17,16,9,0.4)",
                fontWeight: 300,
                marginBottom: "16px",
              }}
            >
              {data.saint.dates}
            </p>
          )}
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(16px, 2.2vw, 19px)",
              fontWeight: 300,
              lineHeight: 1.75,
              color: "rgba(17,16,9,0.68)",
            }}
          >
            {data.saint.description}
          </p>
        </div>
      </section>

      {/* ── Section 4 : Citation du jour ── */}
      <section className="spiritual-section" style={{ marginBottom: "56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <span style={{ color: "#C49A3C", fontSize: "13px" }}>◎</span>
          <p style={{
            fontSize: "11px", fontWeight: 500, letterSpacing: "2px",
            textTransform: "uppercase", color: "rgba(17,16,9,0.35)", margin: 0,
          }}>
            Parole du jour
          </p>
        </div>

        <blockquote
          style={{
            margin: 0,
            padding: "clamp(28px, 4vw, 44px)",
            background: "#111009",
            borderRadius: "20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Guillemets décoratifs */}
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "24px",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "80px",
              lineHeight: 1,
              color: "rgba(196,154,60,0.12)",
              fontWeight: 300,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            «
          </div>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(22px, 3.5vw, 32px)",
              fontWeight: 300,
              fontStyle: "italic",
              color: "#F5EFE4",
              lineHeight: 1.55,
              margin: "0 0 20px",
              position: "relative",
              zIndex: 1,
            }}
          >
            « {data.quote.text} »
          </p>

          <footer
            style={{
              fontSize: "13px",
              fontWeight: 400,
              color: "rgba(196,154,60,0.7)",
              position: "relative",
              zIndex: 1,
            }}
          >
            — {data.quote.author}
          </footer>
        </blockquote>
      </section>

      {/* ── Section 5 : Apprendre les prières ── */}
      <section className="spiritual-section" style={{ marginBottom: "56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ color: "#C49A3C", fontSize: "13px" }}>✶</span>
          <p style={{
            fontSize: "11px", fontWeight: 500, letterSpacing: "2px",
            textTransform: "uppercase", color: "rgba(17,16,9,0.35)", margin: 0,
          }}>
            Prier
          </p>
        </div>
        <p style={{
          fontSize: "14px", fontWeight: 300,
          color: "rgba(17,16,9,0.45)", marginBottom: "20px", lineHeight: 1.5,
        }}>
          Les prières fondamentales de la tradition catholique.
        </p>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "20px",
            border: "1.5px solid rgba(17,16,9,0.07)",
            overflow: "hidden",
          }}
        >
          {PRAYERS.map((prayer, i) => (
            <Link
              key={prayer.slug}
              href={`/dashboard/spiritual/prieres/${prayer.slug}`}
              className="prayer-item"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 20px",
                borderBottom: i < PRAYERS.length - 1 ? "1px solid rgba(17,16,9,0.06)" : "none",
                textDecoration: "none",
                transition: "background 0.15s",
                background: "transparent",
              }}
            >
              <div>
                <p style={{ fontSize: "14px", fontWeight: 500, color: "#111009", margin: "0 0 2px" }}>
                  {prayer.label}
                </p>
                <p style={{ fontSize: "12px", fontWeight: 300, color: "rgba(17,16,9,0.4)", margin: 0 }}>
                  {prayer.description}
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <path d="M6 4L10 8L6 12" stroke="rgba(17,16,9,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Section 6 : Le chapelet ── */}
      <section className="spiritual-section">
        <Link
          href="/dashboard/spiritual/chapelet"
          style={{
            display: "block",
            background: "linear-gradient(135deg, #1A1710 0%, #0D0C08 100%)",
            borderRadius: "20px",
            padding: "clamp(24px, 4vw, 36px)",
            textDecoration: "none",
            position: "relative",
            overflow: "hidden",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(17,16,9,0.15)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          {/* Glow */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 60% 60% at 80% 50%, rgba(196,154,60,0.10) 0%, transparent 70%)",
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ color: "#C49A3C", fontSize: "20px" }}>✞</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="rgba(196,154,60,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(20px, 3vw, 26px)",
                fontWeight: 300,
                color: "#F5EFE4",
                marginBottom: "8px",
                lineHeight: 1.2,
              }}
            >
              Prier le Chapelet
            </h3>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 300,
                color: "rgba(245,239,228,0.45)",
                lineHeight: 1.55,
              }}
            >
              Guide complet · Les 4 mystères · Prières pas-à-pas
            </p>
          </div>
        </Link>
      </section>

    </div>
  );
}

// ─── Skeleton de chargement ───────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
      {/* Date */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Skeleton style={{ width: "120px", height: "10px" }} />
        <Skeleton style={{ width: "70%", height: "36px" }} />
        <Skeleton style={{ width: "45%", height: "12px" }} />
      </div>

      {/* Évangile */}
      <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "36px", border: "1.5px solid rgba(17,16,9,0.06)" }}>
        <Skeleton style={{ width: "100px", height: "12px", marginBottom: "16px" }} />
        <Skeleton style={{ width: "60%", height: "20px", marginBottom: "24px" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Skeleton style={{ width: "100%", height: "14px" }} />
          <Skeleton style={{ width: "95%", height: "14px" }} />
          <Skeleton style={{ width: "88%", height: "14px" }} />
          <Skeleton style={{ width: "92%", height: "14px" }} />
          <Skeleton style={{ width: "75%", height: "14px" }} />
        </div>
      </div>

      {/* Saint */}
      <div style={{ background: "#EDE6D8", borderRadius: "20px", padding: "36px" }}>
        <Skeleton style={{ width: "55%", height: "24px", marginBottom: "8px", background: "rgba(17,16,9,0.08)" }} />
        <Skeleton style={{ width: "30%", height: "10px", marginBottom: "16px", background: "rgba(17,16,9,0.06)" }} />
        <Skeleton style={{ width: "100%", height: "12px", background: "rgba(17,16,9,0.06)" }} />
        <Skeleton style={{ width: "90%", height: "12px", marginTop: "8px", background: "rgba(17,16,9,0.06)" }} />
      </div>

      {/* Citation */}
      <div style={{ background: "#111009", borderRadius: "20px", padding: "36px" }}>
        <Skeleton style={{ width: "85%", height: "18px", marginBottom: "12px", background: "rgba(247,243,236,0.08)" }} />
        <Skeleton style={{ width: "70%", height: "18px", marginBottom: "20px", background: "rgba(247,243,236,0.08)" }} />
        <Skeleton style={{ width: "40%", height: "10px", background: "rgba(196,154,60,0.15)" }} />
      </div>
    </div>
  );
}

// ─── État d'erreur ────────────────────────────────────────────────────────────
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "80px 24px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "1.5px solid rgba(17,16,9,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" stroke="rgba(17,16,9,0.3)" strokeWidth="1" />
          <path d="M10 6V10" stroke="rgba(17,16,9,0.4)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="10" cy="13.5" r="0.75" fill="rgba(17,16,9,0.4)" />
        </svg>
      </div>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "22px",
          fontWeight: 400,
          color: "#111009",
          marginBottom: "8px",
        }}
      >
        Contenu indisponible
      </h2>
      <p
        style={{
          fontSize: "14px",
          fontWeight: 300,
          color: "rgba(17,16,9,0.5)",
          lineHeight: 1.6,
          marginBottom: "28px",
          maxWidth: "320px",
          margin: "0 auto 28px",
        }}
      >
        Le contenu spirituel n&rsquo;est pas disponible en ce moment.
        <br />
        Réessayez dans quelques instants.
      </p>
      <button
        onClick={onRetry}
        style={{
          padding: "10px 24px",
          borderRadius: "999px",
          border: "1.5px solid rgba(17,16,9,0.15)",
          background: "none",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: 500,
          color: "#111009",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => {
          (e.target as HTMLElement).style.background = "rgba(17,16,9,0.05)";
        }}
        onMouseLeave={e => {
          (e.target as HTMLElement).style.background = "none";
        }}
      >
        Réessayer
      </button>
    </div>
  );
}
